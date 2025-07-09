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
        include: {
          reviews: {
            select: {
              id: true,
              rating: true,
            },
            omit: {
              userId: true,
            },
          },
        },
      }),
      this.prismaService.car.count({ where }),
    ]);

    return buildPaginatedResponse(cars, totalCars, page, limit);
  }

  async findOne(id: string) {
    const car = await this.prismaService.car.findUnique({
      where: { id },
      include: {
        reviews: {
          omit: {
            userId: true,
          },
        },
      },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    return car;
  }

  async update(id: string, carUpdatePayload: Prisma.CarUpdateInput) {
    return this.prismaService.$transaction(async (prisma) => {
      const car = await prisma.car.findUnique({ where: { id } });

      if (!car) {
        throw new NotFoundException('Car not found');
      }

      return await this.prismaService.car.update({
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

      return await this.prismaService.car.delete({
        where: { id },
      });
    });
  }
}
