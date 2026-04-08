import { Test, TestingModule } from '@nestjs/testing';
import { Car, CarType, Gearbox, Prisma, Role } from '@prisma/client';
import { JwtUser } from 'src/shared/types';
import { FavouritesController } from './favourites.controller';
import { FavouritesService } from './favourites.service';

describe('FavouritesController', () => {
  let controller: FavouritesController;
  let favouritesServiceMock: jest.Mocked<FavouritesService>;
  let mockUser: JwtUser;
  let mockCar: Car;
  let mockFavouritesList: Prisma.FavouritesListGetPayload<{
    include: {
      cars: true;
    };
  }>;

  beforeEach(async () => {
    favouritesServiceMock = {
      getUserFavouriteList: jest.fn(),
      addToList: jest.fn(),
      removeItemFromList: jest.fn(),
    } as any;

    mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      role: Role.USER,
    };

    mockCar = {
      id: 'car-1',
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
      controllers: [FavouritesController],
      providers: [
        {
          provide: FavouritesService,
          useValue: favouritesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<FavouritesController>(FavouritesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return user favourite list', async () => {
      favouritesServiceMock.getUserFavouriteList.mockResolvedValue(
        mockFavouritesList,
      );

      const result = await controller.findOne(mockUser);

      expect(result).toEqual(mockFavouritesList);
      expect(favouritesServiceMock.getUserFavouriteList).toHaveBeenCalledWith(
        'user-1',
      );
    });
  });

  describe('update', () => {
    it('should add car to favourites list', async () => {
      const updatedList = {
        ...mockFavouritesList,
        cars: [mockCar, { ...mockCar, id: 'car-2' }],
      };
      favouritesServiceMock.addToList.mockResolvedValue(updatedList);

      const result = await controller.update(mockUser, { carId: 'car-2' });

      expect(result).toEqual(updatedList);
      expect(favouritesServiceMock.addToList).toHaveBeenCalledWith(
        'user-1',
        'car-2',
      );
    });
  });

  describe('remove', () => {
    it('should remove car from favourites list', async () => {
      const updatedList = { ...mockFavouritesList, cars: [] };
      favouritesServiceMock.removeItemFromList.mockResolvedValue(updatedList);

      const result = await controller.remove(mockUser, { carId: 'car-1' });

      expect(result).toEqual(updatedList);
      expect(favouritesServiceMock.removeItemFromList).toHaveBeenCalledWith(
        'user-1',
        'car-1',
      );
    });
  });
});
