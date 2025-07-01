import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';
import { CarQuerySchema, PrismaError } from 'src/shared/types';
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
        reviews: true,
      },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    return car;
  }

  async update(id: string, carUpdatePayload: Prisma.CarUpdateInput) {
    try {
      return await this.prismaService.car.update({
        where: { id },
        data: carUpdatePayload,
      });
    } catch (error: any) {
      if ((error as PrismaError).code === 'P2025') {
        throw new NotFoundException('Car not found');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prismaService.car.delete({
        where: { id },
      });
    } catch (error: any) {
      if ((error as PrismaError).code === 'P2025') {
        throw new NotFoundException('Car not found');
      }
      throw error;
    }
  }
}
