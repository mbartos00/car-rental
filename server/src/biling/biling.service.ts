import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';
import { BilingSchema, JwtUser, UpdateBilingSchema } from 'src/shared/types';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class BilingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UsersService,
  ) {}

  async addBilingInfo(userId: string, createBilingPayload: BilingSchema) {
    const user = await this.userService.findOneById(userId);

    const bilingInfoExist = await this.prismaService.bilingInfo.count({
      where: {
        userId: user?.id,
      },
    });

    if (bilingInfoExist > 0) {
      throw new ConflictException('User already have biling information');
    }

    return this.prismaService.bilingInfo.create({
      data: {
        ...createBilingPayload,
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
      omit: {
        userId: true,
      },
    });
  }

  async findAll() {
    return this.prismaService.bilingInfo.findMany();
  }

  async findOne(user: JwtUser, id: string) {
    const bilingInfo = await this.prismaService.bilingInfo.findUnique({
      where: { id },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
      },
      omit: {
        userId: true,
      },
    });

    if (!bilingInfo) {
      throw new NotFoundException('Resource not found');
    }

    if (bilingInfo.user.id !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    return bilingInfo;
  }

  async update(
    user: JwtUser,
    id: string,
    updateBilingPayload: UpdateBilingSchema,
  ) {
    return this.prismaService.$transaction(async (prisma) => {
      const bilingInfo = await prisma.bilingInfo.findUnique({ where: { id } });

      if (!bilingInfo) {
        throw new NotFoundException('Biling info not found');
      }

      if (bilingInfo.userId !== user.id && user.role !== Role.ADMIN) {
        throw new ForbiddenException(
          'You cannot update this biling information',
        );
      }

      return prisma.bilingInfo.update({
        where: { id },
        data: { ...updateBilingPayload },
        omit: {
          userId: true,
        },
      });
    });
  }

  async remove(user: JwtUser, id: string) {
    return this.prismaService.$transaction(async (prisma) => {
      const bilingInfo = await prisma.bilingInfo.findUnique({ where: { id } });

      if (!bilingInfo) {
        throw new NotFoundException('Biling info not found');
      }

      if (bilingInfo.userId !== user.id && user.role !== Role.ADMIN) {
        throw new ForbiddenException('You cannot remove this resource');
      }

      await prisma.bilingInfo.delete({
        where: { id },
      });

      return { message: 'Biling info removed' };
    });
  }
}
