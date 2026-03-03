import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
