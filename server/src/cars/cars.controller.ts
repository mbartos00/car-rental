import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  carQuerySchema,
  carSchema,
  updateCarSchema,
} from 'src/shared/schemas/cars.schema';
import { CarInput, CarQuerySchema, CarUpdateInput } from 'src/shared/types';
import { ZodPipe } from 'src/shared/zod-pipe/zod.pipe';
import { CarsService } from './cars.service';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('create')
  async create(@Body(new ZodPipe(carSchema)) carPayload: CarInput) {
    const car = await this.carsService.create(carPayload);

    if (!car) {
      throw new BadRequestException();
    }

    return { car, message: 'Car created' };
  }

  @Get()
  async findAll(@Query(new ZodPipe(carQuerySchema)) query: CarQuerySchema) {
    return await this.carsService.findAll(query);
  }

  @Get('filters')
  async getFilters() {
    return await this.carsService.getCarFilters();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const car = await this.carsService.findOne(id);

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    return car;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodPipe(updateCarSchema)) updateCarPayload: CarUpdateInput,
  ) {
    return await this.carsService.update(id, updateCarPayload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const car = await this.carsService.remove(id);

    return { message: `${car.name} deleted successfully` };
  }
}
