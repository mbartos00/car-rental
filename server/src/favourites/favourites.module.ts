import { Module } from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { FavouritesController } from './favourites.controller';
import { CarsService } from 'src/cars/cars.service';

@Module({
  controllers: [FavouritesController],
  providers: [FavouritesService, CarsService],
})
export class FavouritesModule {}
