import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';
import { LocationSchema } from 'src/shared/types';

@Injectable()
export class LocationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.location.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(payload: LocationSchema) {
    try {
      return await this.prismaService.location.create({ data: payload });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Location already exists');
      }

      throw error;
    }
  }

  async update(id: string, payload: LocationSchema) {
    const location = await this.prismaService.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return this.prismaService.location.update({
      where: { id },
      data: payload,
    });
  }

  async remove(id: string) {
    const location = await this.prismaService.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    const usedBy = await this.prismaService.reservation.count({
      where: {
        OR: [{ pickupLocationId: id }, { dropoffLocationId: id }],
      },
    });

    if (usedBy > 0) {
      throw new ConflictException('Location is used by reservations');
    }

    await this.prismaService.location.delete({ where: { id } });

    return { message: `Location ${location.name} removed` };
  }
}
