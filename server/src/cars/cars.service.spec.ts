import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Car, CarType, Gearbox, PrismaClient, Review } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/db/prisma.service';
import { CarQuerySchema } from 'src/shared/types';
import * as paginationUtils from 'src/shared/utils/pagination';
import { CarsService } from './cars.service';
import * as carFilterUtils from './utils/car-filter-builder';

jest.mock('src/shared/utils/pagination');
jest.mock('./utils/car-filter-builder');

describe('CarsService', () => {
  let carsService: CarsService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let mockCar: Car;
  let mockCarWithReviews: Car & { reviews: Review[] };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    mockCar = {
      id: '1',
      name: 'Toyota Camry 2023',
      description: 'Reliable and fuel-efficient sedan',
      price: 25000,
      carType: CarType.SEDAN,
      images: ['image1.jpg', 'image2.jpg'],
      tankCapacity: 60,
      gearbox: Gearbox.AUTOMATIC,
      seats: 5,
      favouritesListId: null,
      createdAt: new Date(),
    };

    mockCarWithReviews = {
      ...mockCar,
      reviews: [
        {
          id: '1',
          rating: 5,
          description: 'Great car!',
          carId: '1',
          userId: '1',
          createdAt: new Date(),
        },
        {
          id: '2',
          rating: 4,
          description: 'Good value',
          carId: '1',
          userId: '2',
          createdAt: new Date(),
        },
      ],
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    carsService = module.get<CarsService>(CarsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new car', async () => {
      const carPayload = {
        name: 'Honda Civic 2023',
        description: 'Compact and efficient car',
        price: 22000,
        carType: CarType.SEDAN,
        images: ['civic1.jpg', 'civic2.jpg'],
        tankCapacity: 50,
        gearbox: Gearbox.MANUAL,
        seats: 5,
      };

      prismaMock.car.create.mockResolvedValue(mockCar);

      const result = await carsService.create(carPayload);

      expect(result).toEqual(mockCar);
      expect(prismaMock.car.create).toHaveBeenCalledWith({
        data: carPayload,
      });
    });
  });

  describe('findAll', () => {
    const mockQuery: CarQuerySchema = {
      sort_by: 'price',
      sort_order: 'asc',
      page: 1,
      limit: 10,
      name: 'Toyota',
      car_type: CarType.SEDAN,
    };

    const mockFilters = { name: 'Toyota', carType: CarType.SEDAN };
    const mockOrderBy = { price: 'asc' };
    const mockPagination = { skip: 0, take: 10 };
    const mockPaginatedResponse = {
      data: [mockCarWithReviews],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    beforeEach(() => {
      (carFilterUtils.buildCarFilters as jest.Mock).mockReturnValue(
        mockFilters,
      );
      (paginationUtils.buildSort as jest.Mock).mockReturnValue(mockOrderBy);
      (paginationUtils.buildPagination as jest.Mock).mockReturnValue(
        mockPagination,
      );
      (paginationUtils.buildPaginatedResponse as jest.Mock).mockReturnValue(
        mockPaginatedResponse,
      );
    });

    it('should return paginated cars with reviews', async () => {
      const carsWithReviewsSelection = [
        {
          ...mockCar,
          reviews: [
            { id: '1', rating: 5 },
            { id: '2', rating: 4 },
          ],
        },
      ];

      prismaMock.car.findMany.mockResolvedValue(carsWithReviewsSelection);
      prismaMock.car.count.mockResolvedValue(1);

      const result = await carsService.findAll(mockQuery);

      expect(result).toEqual(mockPaginatedResponse);

      expect(carFilterUtils.buildCarFilters).toHaveBeenCalledWith({
        name: 'Toyota',
        car_type: CarType.SEDAN,
      });
      expect(paginationUtils.buildSort).toHaveBeenCalledWith('price', 'asc');
      expect(paginationUtils.buildPagination).toHaveBeenCalledWith(1, 10);

      expect(prismaMock.car.findMany).toHaveBeenCalledWith({
        where: mockFilters,
        orderBy: mockOrderBy,
        ...mockPagination,
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
      });
      expect(prismaMock.car.count).toHaveBeenCalledWith({ where: mockFilters });

      expect(paginationUtils.buildPaginatedResponse).toHaveBeenCalledWith(
        carsWithReviewsSelection,
        1,
        1,
        10,
      );
    });

    it('should handle empty query parameters', async () => {
      const emptyQuery = {} as CarQuerySchema;
      const emptyFilters = {};

      (carFilterUtils.buildCarFilters as jest.Mock).mockReturnValue(
        emptyFilters,
      );
      (paginationUtils.buildSort as jest.Mock).mockReturnValue(undefined);
      (paginationUtils.buildPagination as jest.Mock).mockReturnValue({
        skip: 0,
        take: 10,
      });

      prismaMock.car.findMany.mockResolvedValue([]);
      prismaMock.car.count.mockResolvedValue(0);

      await carsService.findAll(emptyQuery);

      expect(carFilterUtils.buildCarFilters).toHaveBeenCalledWith({});
      expect(paginationUtils.buildSort).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(paginationUtils.buildPagination).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });
  });

  describe('findOne', () => {
    it('should return car with reviews when found', async () => {
      prismaMock.car.findUnique.mockResolvedValue(mockCarWithReviews);

      const result = await carsService.findOne('1');

      expect(result).toEqual(mockCarWithReviews);
      expect(prismaMock.car.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          reviews: {
            omit: {
              userId: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when car not found', async () => {
      prismaMock.car.findUnique.mockResolvedValue(null);

      await expect(carsService.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(carsService.findOne('nonexistent-id')).rejects.toThrow(
        'Car not found',
      );
    });
  });

  describe('update', () => {
    const updatePayload = {
      price: 26000,
      description: 'Updated description with new features',
      seats: 7,
    };

    it('should update car successfully inside transaction', async () => {
      const updatedCar = { ...mockCar, ...updatePayload };

      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb({
          car: {
            findUnique: jest.fn().mockResolvedValue(mockCar),
          },
        } as any);
      });
      prismaMock.car.update.mockResolvedValue(updatedCar);

      const result = await carsService.update('1', updatePayload);

      expect(result).toEqual(updatedCar);
      expect(prismaMock.car.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updatePayload,
      });
    });

    it('should throw NotFoundException when car not found in transaction', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb({
          car: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        } as any);
      });

      await expect(
        carsService.update('nonexistent-id', updatePayload),
      ).rejects.toThrow(NotFoundException);
      await expect(
        carsService.update('nonexistent-id', updatePayload),
      ).rejects.toThrow('Car not found');
    });
  });

  describe('remove', () => {
    it('should delete car successfully inside transaction', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb({
          car: {
            findUnique: jest.fn().mockResolvedValue(mockCar),
          },
        } as any);
      });
      prismaMock.car.delete.mockResolvedValue(mockCar);

      const result = await carsService.remove('1');

      expect(result).toEqual(mockCar);
      expect(prismaMock.car.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when car not found in transaction', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb({
          car: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        } as any);
      });

      await expect(carsService.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(carsService.remove('nonexistent-id')).rejects.toThrow(
        'Car not found',
      );
    });
  });
});
