import type { CarType, Gearbox, Prisma } from '@prisma/client';
import { CarQueryParam, CarQuerySchema } from 'src/shared/types';

export function buildCarFilters(
  queryParams: Partial<CarQuerySchema>,
): Prisma.CarWhereInput {
  return Object.keys(queryParams).reduce((acc: Prisma.CarWhereInput, key) => {
    const value = queryParams[key as keyof CarQuerySchema];
    if (value === undefined) return acc;

    switch (key as CarQueryParam) {
      case CarQueryParam.min_price:
        if (typeof acc.price !== 'object') {
          acc.price = {};
        }

        acc.price = {
          ...acc.price,
          gte: value as number,
        };
        break;

      case CarQueryParam.max_price:
        if (typeof acc.price !== 'object') {
          acc.price = {};
        }

        acc.price = {
          ...acc.price,
          lte: value as number,
        };
        break;

      case CarQueryParam.car_type:
        acc.carType = value as CarType;
        break;

      case CarQueryParam.gearbox:
        acc.gearbox = value as Gearbox;
        break;

      case CarQueryParam.seats:
        acc.seats = value as number;
        break;

      case CarQueryParam.min_tank_capacity:
        if (typeof acc.tankCapacity !== 'object') {
          acc.tankCapacity = {};
        }

        acc.tankCapacity = {
          ...acc.tankCapacity,
          gte: value as number,
        };
        break;

      case CarQueryParam.max_tank_capacity:
        if (typeof acc.tankCapacity !== 'object') {
          acc.tankCapacity = {};
        }

        acc.tankCapacity = {
          ...acc.tankCapacity,
          lte: value as number,
        };
        break;

      case CarQueryParam.search:
        acc.name = {
          contains: value as string,
          mode: 'insensitive',
        };
        break;

      default:
        break;
    }

    return acc;
  }, {});
}
