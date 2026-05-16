import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/db/prisma.service';
import { UserWithoutPassword } from 'src/shared/types';

const SALT_ROUNDS = 10;

export const SENSITIVE_USER_FIELDS = {
  password: true,
  refreshTokenHash: true,
  prevRefreshTokenHash: true,
  refreshRotatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userPayload: Prisma.UserCreateInput) {
    return await this.prisma.user.create({
      data: {
        ...userPayload,
        favouritesList: {
          create: {},
        },
      },
      omit: SENSITIVE_USER_FIELDS,
    });
  }

  async getAllUsers(): Promise<UserWithoutPassword[]> {
    return await this.prisma.user.findMany({ omit: SENSITIVE_USER_FIELDS });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOneById(id: string): Promise<UserWithoutPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: SENSITIVE_USER_FIELDS,
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async update(
    id: string,
    updateUserPayload: Prisma.UserUpdateInput,
    oldPassword?: string,
  ) {
    const data = { ...updateUserPayload };

    if (typeof data.password === 'string') {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) throw new NotFoundException('User not found');

      if (!oldPassword || !bcrypt.compareSync(oldPassword, user.password)) {
        throw new BadRequestException('Old password is incorrect');
      }

      data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      omit: SENSITIVE_USER_FIELDS,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
