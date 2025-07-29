import { CarQueryParam } from 'src/shared/types';
import { buildCarFilters } from './car-filter-builder';
import { CarType, Gearbox } from '@prisma/client';

describe('buildCarFilters', () => {
  it('should return empty object when no query params provided', () => {
    const result = buildCarFilters({});
    expect(result).toEqual({});
  });

  it('should ignore unknown query parameters', () => {
    const queryParams = {
      unknown_param: 'some value',
    } as any;

    const result = buildCarFilters(queryParams);

    expect(result).toEqual({});
  });

  it('should handle price range filters', () => {
    const queryParams = {
      [CarQueryParam.min_price]: 10000,
      [CarQueryParam.max_price]: 50000,
    };
    const result = buildCarFilters(queryParams);

    expect(result).toEqual({
      price: {
        gte: 10000,
        lte: 50000,
      },
    });
  });

  it('should handle car type and gearbox filters', () => {
    const queryParams = {
      [CarQueryParam.car_type]: CarType.SUV,
      [CarQueryParam.gearbox]: Gearbox.AUTOMATIC,
    };
    const result = buildCarFilters(queryParams);

    expect(result).toEqual({
      carType: 'SUV',
      gearbox: 'AUTOMATIC',
    });
  });

  it('should handle seats range filters', () => {
    const queryParams = {
      [CarQueryParam.seats]: 2,
    };
    const result = buildCarFilters(queryParams);

    expect(result).toEqual({
      seats: 2,
    });
  });

  it('should handle tank capacity range filters', () => {
    const queryParams = {
      [CarQueryParam.min_tank_capacity]: 40,
      [CarQueryParam.max_tank_capacity]: 80,
    };
    const result = buildCarFilters(queryParams);

    expect(result).toEqual({
      tankCapacity: {
        gte: 40,
        lte: 80,
      },
    });
  });

  it('should handle search filter for car name', () => {
    const queryParams = { [CarQueryParam.search]: 'BMW' };
    const result = buildCarFilters(queryParams);

    expect(result).toEqual({
      name: {
        contains: 'BMW',
        mode: 'insensitive',
      },
    });
  });

  it('should handle multiple filters combined', () => {
    const queryParams = {
      [CarQueryParam.search]: 'Honda',
      [CarQueryParam.min_price]: 15000,
      [CarQueryParam.car_type]: CarType.SEDAN,
      [CarQueryParam.seats]: 4,
    };
    const result = buildCarFilters(queryParams);

    expect(result).toEqual({
      name: {
        contains: 'Honda',
        mode: 'insensitive',
      },
      price: {
        gte: 15000,
      },
      carType: 'SEDAN',
      seats: 4,
    });
  });
});
