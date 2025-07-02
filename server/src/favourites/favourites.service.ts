import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CarsService } from 'src/cars/cars.service';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class FavouritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly carService: CarsService,
  ) {}

  async getUserFavouriteList(userId: string) {
    const favList = await this.prisma.favouritesList.findUnique({
      where: { userId },
      include: {
        cars: true,
      },
    });

    if (!favList) {
      throw new NotFoundException('Favourite list not found');
    }

    return favList;
  }

  async addToList(userId: string, carId: string) {
    await this.carService.findOne(carId);

    const currentList = await this.getUserFavouriteList(userId);

    if (currentList.cars.some((car) => car.id === carId)) {
      throw new ConflictException('Car already in list');
    }

    return await this.prisma.favouritesList.update({
      where: {
        userId,
      },
      data: {
        cars: {
          connect: { id: carId },
        },
      },
      include: {
        cars: true,
      },
    });
  }

  async removeItemFromList(userId: string, carId: string) {
    const list = await this.getUserFavouriteList(userId);

    if (list.cars.length === 0) {
      throw new BadRequestException('List is empty');
    }

    if (!list.cars.find((car) => car.id === carId)) {
      throw new BadRequestException('Car is not present on the list');
    }

    return await this.prisma.favouritesList.update({
      where: { userId },
      data: {
        cars: {
          disconnect: { id: carId },
        },
      },
      include: {
        cars: true,
      },
    });
  }
}
