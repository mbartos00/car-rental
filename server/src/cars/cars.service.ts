import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReservationStatus } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';
import { CarQuerySchema } from 'src/shared/types';
import {
  buildPaginatedResponse,
  buildPagination,
  buildSort,
} from 'src/shared/utils/pagination';
import { buildCarFilters } from './utils/car-filter-builder';

@Injectable()
export class CarsService {
  constructor(private prismaService: PrismaService) {}

  async create(carPayload: Prisma.CarCreateInput) {
    return this.prismaService.car.create({
      data: carPayload,
    });
  }

  async findAll(query: CarQuerySchema) {
    const { sort_by, sort_order, page, limit, ...filters } = query;
    const where = buildCarFilters(filters);
    const orderBy = buildSort(sort_by, sort_order);
    const pagination = buildPagination(page, limit);

    const [cars, totalCars] = await Promise.all([
      this.prismaService.car.findMany({
        where,
        orderBy,
        ...pagination,
      }),
      this.prismaService.car.count({ where }),
    ]);

    return buildPaginatedResponse(cars, totalCars, page, limit);
  }

  async findOne(id: string) {
    return this.prismaService.$transaction(async (prisma) => {
      const car = await prisma.car.findUnique({
        where: { id },
        include: {
          reviews: {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              rating: true,
              description: true,
              carId: true,
              createdAt: true,
            },
          },
        },
      });

      if (!car) {
        throw new NotFoundException('Car not found');
      }

      const reviewStats = await prisma.review.aggregate({
        where: { carId: id },
        _count: true,
        _avg: { rating: true },
      });

      return {
        ...car,
        reviewCount: reviewStats._count,
        averageReview: reviewStats._avg.rating || 0,
      };
    });
  }

  async update(id: string, carUpdatePayload: Prisma.CarUpdateInput) {
    return this.prismaService.$transaction(async (prisma) => {
      const car = await prisma.car.findUnique({ where: { id } });

      if (!car) {
        throw new NotFoundException('Car not found');
      }

      return await prisma.car.update({
        where: { id },
        data: carUpdatePayload,
      });
    });
  }

  async remove(id: string) {
    return this.prismaService.$transaction(async (prisma) => {
      const car = await prisma.car.findUnique({ where: { id } });

      if (!car) {
        throw new NotFoundException('Car not found');
      }

      return await prisma.car.delete({
        where: { id },
      });
    });
  }

  async getPopularCars(limit: number) {
    const [reservationCounts, cars, ratings] = await Promise.all([
      this.prismaService.reservation.groupBy({
        by: ['carId'],
        _count: true,
        where: { status: { not: ReservationStatus.CANCELLED } },
      }),
      this.prismaService.car.findMany(),
      this.getAverageRatings(),
    ]);

    const reservedCounts = new Map(
      reservationCounts.map((entry) => [entry.carId, entry._count]),
    );

    return cars
      .map((car) => ({
        car,
        score:
          (reservedCounts.get(car.id) ?? 0) * 3 + car.favouritesListIds.length,
      }))
      .sort(
        (a, b) =>
          b.score - a.score ||
          (ratings.get(b.car.id) ?? 0) - (ratings.get(a.car.id) ?? 0) ||
          b.car.createdAt.getTime() - a.car.createdAt.getTime(),
      )
      .slice(0, limit)
      .map(({ car }) => car);
  }

  async getRecommendedCars(userId: string | null, limit: number) {
    const [cars, ratings] = await Promise.all([
      this.prismaService.car.findMany(),
      this.getAverageRatings(),
    ]);

    const topRated = () =>
      [...cars]
        .sort((a, b) => (ratings.get(b.id) ?? 0) - (ratings.get(a.id) ?? 0))
        .slice(0, limit);

    if (!userId) return topRated();

    const [favouritesList, reservations] = await Promise.all([
      this.prismaService.favouritesList.findUnique({
        where: { userId },
        include: { cars: true },
      }),
      this.prismaService.reservation.findMany({
        where: { userId },
        include: { car: true },
      }),
    ]);

    const history = [
      ...(favouritesList?.cars ?? []),
      ...reservations.map((reservation) => reservation.car),
    ];

    if (history.length === 0) return topRated();

    const historyIds = new Set(history.map((car) => car.id));
    const preferredTypes = new Set(history.map((car) => car.carType));
    const preferredSeats = new Set(history.map((car) => car.seats));
    const prices = history.map((car) => car.price);
    const minPrice = Math.min(...prices) * 0.75;
    const maxPrice = Math.max(...prices) * 1.25;

    const recommended = cars
      .filter((car) => !historyIds.has(car.id))
      .map((car) => ({
        car,
        score:
          (preferredTypes.has(car.carType) ? 2 : 0) +
          (car.price >= minPrice && car.price <= maxPrice ? 1 : 0) +
          (preferredSeats.has(car.seats) ? 1 : 0),
      }))
      .sort(
        (a, b) =>
          b.score - a.score ||
          (ratings.get(b.car.id) ?? 0) - (ratings.get(a.car.id) ?? 0),
      )
      .slice(0, limit)
      .map(({ car }) => car);

    return recommended.length > 0 ? recommended : topRated();
  }

  private async getAverageRatings(): Promise<Map<string, number>> {
    const grouped = await this.prismaService.review.groupBy({
      by: ['carId'],
      _avg: { rating: true },
    });

    return new Map(
      grouped.map((entry) => [entry.carId, entry._avg.rating ?? 0]),
    );
  }

  async getCarFilters() {
    const priceAndTankCapacity = await this.prismaService.car.aggregate({
      _min: {
        price: true,
        tankCapacity: true,
      },
      _max: {
        price: true,
        tankCapacity: true,
      },
    });

    const [carType, gearbox, seats] = await this.prismaService.$transaction(
      async (prisma) => [
        await prisma.car.groupBy({
          by: ['carType'],
          _count: true,
        }),
        await prisma.car.groupBy({
          by: ['gearbox'],
          _count: true,
        }),
        await prisma.car.groupBy({
          by: ['seats'],
          _count: true,
        }),
      ],
    );

    return {
      price: {
        min: priceAndTankCapacity._min.price,
        max: priceAndTankCapacity._max.price,
      },
      tankCapacity: {
        min: priceAndTankCapacity._min.tankCapacity,
        max: priceAndTankCapacity._max.tankCapacity,
      },
      carType,
      gearbox,
      seats,
    };
  }
}
