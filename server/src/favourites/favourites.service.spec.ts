import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Car, CarType, Gearbox, Prisma, PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CarsService } from 'src/cars/cars.service';
import { PrismaService } from 'src/db/prisma.service';
import { FavouritesService } from './favourites.service';

describe('FavouritesService', () => {
  let favouritesService: FavouritesService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let carsServiceMock: jest.Mocked<CarsService>;
  let mockCar: Car;
  let mockFavouritesList: Prisma.FavouritesListGetPayload<{
    include: { cars: true };
  }>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    carsServiceMock = {
      findOne: jest.fn(),
    } as any;

    mockCar = {
      id: '1',
      name: 'Toyota Camry 2023',
      description: 'Reliable sedan',
      price: 25000,
      carType: CarType.SEDAN,
      images: ['image1.jpg'],
      tankCapacity: 60,
      gearbox: Gearbox.AUTOMATIC,
      seats: 5,
      favouritesListIds: ['fav-list-1'],
      createdAt: new Date(),
    };

    mockFavouritesList = {
      id: 'fav-list-1',
      userId: 'user-1',
      carIds: [],
      cars: [mockCar],
      createdAt: new Date(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavouritesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: CarsService,
          useValue: carsServiceMock,
        },
      ],
    }).compile();

    favouritesService = module.get<FavouritesService>(FavouritesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserFavouriteList', () => {
    it('should return user favourite list with cars', async () => {
      prismaMock.favouritesList.findUnique.mockResolvedValue(
        mockFavouritesList,
      );

      const result = await favouritesService.getUserFavouriteList('user-1');

      expect(result).toEqual(mockFavouritesList);
      expect(prismaMock.favouritesList.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: { cars: true },
      });
    });

    it('should throw NotFoundException when favourite list not found', async () => {
      prismaMock.favouritesList.findUnique.mockResolvedValue(null);

      await expect(
        favouritesService.getUserFavouriteList('nonexistent-user'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        favouritesService.getUserFavouriteList('nonexistent-user'),
      ).rejects.toThrow('Favourite list not found');
    });
  });

  describe('addToList', () => {
    it('should add car to favourite list successfully', async () => {
      const newCar = { ...mockCar, id: '2' };
      const updatedList = { ...mockFavouritesList, cars: [mockCar, newCar] };

      carsServiceMock.findOne.mockResolvedValue(newCar as any);
      prismaMock.favouritesList.findUnique.mockResolvedValue(
        mockFavouritesList,
      );
      prismaMock.favouritesList.update.mockResolvedValue(updatedList);

      const result = await favouritesService.addToList('user-1', '2');

      expect(result).toEqual(updatedList);
      expect(carsServiceMock.findOne).toHaveBeenCalledWith('2');
      expect(prismaMock.favouritesList.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { cars: { connect: { id: '2' } } },
        include: { cars: true },
      });
    });

    it('should throw ConflictException when car already in list', async () => {
      carsServiceMock.findOne.mockResolvedValue(mockCar as any);
      prismaMock.favouritesList.findUnique.mockResolvedValue(
        mockFavouritesList,
      );

      await expect(favouritesService.addToList('user-1', '1')).rejects.toThrow(
        ConflictException,
      );
      await expect(favouritesService.addToList('user-1', '1')).rejects.toThrow(
        'Car already in list',
      );
    });
  });

  describe('removeItemFromList', () => {
    it('should remove car from favourite list successfully', async () => {
      const updatedList = { ...mockFavouritesList, cars: [] };

      prismaMock.favouritesList.findUnique.mockResolvedValue(
        mockFavouritesList,
      );
      prismaMock.favouritesList.update.mockResolvedValue(updatedList);

      const result = await favouritesService.removeItemFromList('user-1', '1');

      expect(result).toEqual(updatedList);
      expect(prismaMock.favouritesList.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { cars: { disconnect: { id: '1' } } },
        include: { cars: true },
      });
    });

    it('should throw BadRequestException when list is empty', async () => {
      const emptyList = { ...mockFavouritesList, cars: [] };
      prismaMock.favouritesList.findUnique.mockResolvedValue(emptyList);

      await expect(
        favouritesService.removeItemFromList('user-1', '1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        favouritesService.removeItemFromList('user-1', '1'),
      ).rejects.toThrow('List is empty');
    });

    it('should throw BadRequestException when car not in list', async () => {
      prismaMock.favouritesList.findUnique.mockResolvedValue(
        mockFavouritesList,
      );

      await expect(
        favouritesService.removeItemFromList('user-1', 'nonexistent-car'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        favouritesService.removeItemFromList('user-1', 'nonexistent-car'),
      ).rejects.toThrow('Car is not present on the list');
    });
  });
});
