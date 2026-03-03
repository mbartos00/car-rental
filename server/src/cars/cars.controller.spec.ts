import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CarType, Gearbox, Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CarInput, CarQuerySchema, CarUpdateInput } from 'src/shared/types';
import { ZodPipe } from 'src/shared/zod-pipe/zod.pipe';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';

describe('CarsController', () => {
  let controller: CarsController;
  let carsService: any;
  let mockCar: any;
  let mockCarInput: CarInput;
  let mockCarUpdateInput: CarUpdateInput;
  let mockCarQuery: CarQuerySchema;

  beforeEach(async () => {
    mockCar = {
      id: '507f1f77bcf86cd799439011',
      name: 'Toyota Camry',
      description: 'Reliable sedan with excellent fuel economy',
      price: 25000,
      carType: CarType.SEDAN,
      images: ['image1.jpg', 'image2.jpg'],
      tankCapacity: 60,
      gearbox: Gearbox.AUTOMATIC,
      seats: 5,
      createdAt: new Date(),
    };

    mockCarInput = {
      name: 'Toyota Camry',
      description: 'Reliable sedan with excellent fuel economy',
      price: 25000,
      carType: CarType.SEDAN,
      images: ['image1.jpg', 'image2.jpg'],
      tankCapacity: 60,
      gearbox: Gearbox.AUTOMATIC,
      seats: 5,
    };

    mockCarUpdateInput = {
      name: 'Updated Toyota Camry',
      price: 26000,
      description: 'Updated description',
    };

    mockCarQuery = {
      page: 1,
      limit: 10,
      car_type: CarType.SEDAN,
      min_price: 20000,
      max_price: 30000,
      sort_by: 'name',
      sort_order: 'asc',
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarsController],
      providers: [
        {
          provide: CarsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: ZodPipe,
          useValue: {
            transform: jest.fn((value) => value),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CarsController>(CarsController);
    carsService = module.get<jest.Mocked<CarsService>>(CarsService);
  });

  describe('create', () => {
    it('should create a new car successfully', async () => {
      carsService.create.mockResolvedValue(mockCar);

      const result = await controller.create(mockCarInput);

      expect(result).toEqual({
        car: mockCar,
        message: 'Car created',
      });
      expect(carsService.create).toHaveBeenCalledWith(mockCarInput);
    });

    it('should throw BadRequestException when car creation fails', async () => {
      carsService.create.mockResolvedValue(null);

      await expect(controller.create(mockCarInput)).rejects.toThrow(
        BadRequestException,
      );

      expect(carsService.create).toHaveBeenCalledWith(mockCarInput);
    });

    it('should throw BadRequestException when service throws error', async () => {
      carsService.create.mockRejectedValue(new Error('Database error'));

      await expect(controller.create(mockCarInput)).rejects.toThrow();

      expect(carsService.create).toHaveBeenCalledWith(mockCarInput);
    });
  });

  describe('findAll', () => {
    it('should return all cars with query parameters', async () => {
      const mockCarsResult = {
        cars: [mockCar],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      carsService.findAll.mockResolvedValue(mockCarsResult);

      const result = await controller.findAll(mockCarQuery);

      expect(result).toEqual(mockCarsResult);
      expect(carsService.findAll).toHaveBeenCalledWith(mockCarQuery);
    });

    it('should return cars with empty query', async () => {
      const emptyQuery = {};
      const mockCarsResult = {
        cars: [mockCar],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      carsService.findAll.mockResolvedValue(mockCarsResult);

      const result = await controller.findAll(emptyQuery as CarQuerySchema);

      expect(result).toEqual(mockCarsResult);
      expect(carsService.findAll).toHaveBeenCalledWith(emptyQuery);
    });

    it('should handle empty result', async () => {
      const mockEmptyResult = {
        cars: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      carsService.findAll.mockResolvedValue(mockEmptyResult);

      const result = await controller.findAll(mockCarQuery);

      expect(result).toEqual(mockEmptyResult);
      expect(carsService.findAll).toHaveBeenCalledWith(mockCarQuery);
    });
  });

  describe('findOne', () => {
    it('should find car by id', async () => {
      const carId = '507f1f77bcf86cd799439011';
      carsService.findOne.mockResolvedValue(mockCar);

      const result = await controller.findOne(carId);

      expect(result).toEqual(mockCar);
      expect(carsService.findOne).toHaveBeenCalledWith(carId);
    });

    it('should throw NotFoundException when car is not found', async () => {
      const carId = '507f1f77bcf86cd799439011';
      carsService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(carId)).rejects.toThrow(
        new NotFoundException('Car not found'),
      );

      expect(carsService.findOne).toHaveBeenCalledWith(carId);
    });

    it('should throw NotFoundException when car is undefined', async () => {
      const carId = '507f1f77bcf86cd799439011';
      carsService.findOne.mockResolvedValue(undefined);

      await expect(controller.findOne(carId)).rejects.toThrow(
        new NotFoundException('Car not found'),
      );

      expect(carsService.findOne).toHaveBeenCalledWith(carId);
    });
  });

  describe('update', () => {
    it('should update car successfully', async () => {
      const carId = '507f1f77bcf86cd799439011';
      const updatedCar = { ...mockCar, ...mockCarUpdateInput };

      carsService.update.mockResolvedValue(updatedCar);

      const result = await controller.update(carId, mockCarUpdateInput);

      expect(result).toEqual(updatedCar);
      expect(carsService.update).toHaveBeenCalledWith(
        carId,
        mockCarUpdateInput,
      );
    });

    it('should handle partial updates', async () => {
      const carId = '507f1f77bcf86cd799439011';
      const partialUpdate = { price: 27000 };
      const updatedCar = { ...mockCar, price: 27000 };

      carsService.update.mockResolvedValue(updatedCar);

      const result = await controller.update(carId, partialUpdate);

      expect(result).toEqual(updatedCar);
      expect(carsService.update).toHaveBeenCalledWith(carId, partialUpdate);
    });

    it('should handle service errors during update', async () => {
      const carId = '507f1f77bcf86cd799439011';
      carsService.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        controller.update(carId, mockCarUpdateInput),
      ).rejects.toThrow('Update failed');

      expect(carsService.update).toHaveBeenCalledWith(
        carId,
        mockCarUpdateInput,
      );
    });
  });

  describe('remove', () => {
    it('should remove car successfully', async () => {
      const carId = '507f1f77bcf86cd799439011';
      carsService.remove.mockResolvedValue(mockCar);

      const result = await controller.remove(carId);

      expect(result).toEqual({
        message: `${mockCar.name} deleted successfully`,
      });
      expect(carsService.remove).toHaveBeenCalledWith(carId);
    });

    it('should handle removal of car with different name', async () => {
      const carId = '507f1f77bcf86cd799439011';
      const differentCar = { ...mockCar, name: 'Honda Civic' };
      carsService.remove.mockResolvedValue(differentCar);

      const result = await controller.remove(carId);

      expect(result).toEqual({
        message: `${differentCar.name} deleted successfully`,
      });
      expect(carsService.remove).toHaveBeenCalledWith(carId);
    });

    it('should handle service errors during removal', async () => {
      const carId = '507f1f77bcf86cd799439011';
      carsService.remove.mockRejectedValue(new Error('Deletion failed'));

      await expect(controller.remove(carId)).rejects.toThrow('Deletion failed');

      expect(carsService.remove).toHaveBeenCalledWith(carId);
    });
  });

  describe('getFilters', () => {
    it('should return car filter metadata', async () => {
      const mockFilters = {
        price: { min: 10000, max: 50000 },
        tankCapacity: { min: 40, max: 70 },
        carType: [
          { carType: CarType.SEDAN, _count: 10 },
          { carType: CarType.SUV, _count: 5 },
        ],
        gearbox: [
          { gearbox: Gearbox.AUTOMATIC, _count: 12 },
          { gearbox: Gearbox.MANUAL, _count: 3 },
        ],
        seats: [2, 5, 7],
      };

      carsService.getCarFilters = jest.fn().mockResolvedValue(mockFilters);

      const result = await controller.getFilters();

      expect(result).toEqual(mockFilters);
      expect(carsService.getCarFilters).toHaveBeenCalled();
    });
  });
});
