import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';
import { UserWithoutPassword } from 'src/shared/types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userPayload: Prisma.UserCreateInput,
    avatarName: string | undefined,
  ) {
    const avatar = avatarName
      ? `${process.env.DOMAIN}/${avatarName}`
      : undefined;

    return await this.prisma.user.create({
      data: {
        ...userPayload,
        avatar,
      },
      omit: { password: true },
    });
  }

  async getAllUsers(): Promise<UserWithoutPassword[]> {
    return await this.prisma.user.findMany({ omit: { password: true } });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async findOneById(id: string): Promise<UserWithoutPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: {
        password: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async update(
    id: string,
    updateUserPayload: Prisma.UserUpdateInput,
    avatarName: string | undefined,
  ) {
    const avatar = avatarName
      ? `${process.env.DOMAIN}/${avatarName}`
      : undefined;

    return this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserPayload,
        avatar,
      },
      omit: { password: true },
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
