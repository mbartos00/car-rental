import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/auth/decorators/user.decorator';
import { AddToFavouritesSchema, JwtUser } from 'src/shared/types';
import { FavouritesService } from './favourites.service';
import { ZodPipe } from 'src/shared/zod-pipe/zod.pipe';
import { addToFavouritesSchema } from 'src/shared/schemas/favourites.schema';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Get()
  async findOne(@User() user: JwtUser) {
    return await this.favouritesService.getUserFavouriteList(user.id);
  }

  @Patch()
  async update(
    @User() user: JwtUser,
    @Body(new ZodPipe(addToFavouritesSchema)) { carId }: AddToFavouritesSchema,
  ) {
    return await this.favouritesService.addToList(user.id, carId);
  }

  @Delete()
  async remove(
    @User() user: JwtUser,
    @Body(new ZodPipe(addToFavouritesSchema)) { carId }: AddToFavouritesSchema,
  ) {
    return await this.favouritesService.removeItemFromList(user.id, carId);
  }
}
