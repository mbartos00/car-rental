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
import { updateUserSchema, userSchema } from 'src/shared/schemas/user.schema';
import { JwtUser, ValidUpdatedUser, ValidUser } from 'src/shared/types';
import { ZodPipe } from 'src/shared/zod-pipe/zod.pipe';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/auth/decorators/user.decorator';
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async create(@Body(new ZodPipe(userSchema)) user: ValidUser) {
    const existingUser = await this.usersService.findOneByEmail(user.email);

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const { repeatPassword: _, ...userPayload } = user;

    return this.usersService.create(userPayload);
  }

  @Get()
  async findAll() {
    return this.usersService.getAllUsers();
  }

  @Roles(Role.USER, Role.ADMIN)
  @Get('me')
  async getMe(@User() user: JwtUser) {
    return this.usersService.findOneById(user.id);
  }

  @Roles(Role.USER, Role.ADMIN)
  @Patch('me')
  async updateMe(
    @User() user: JwtUser,
    @Body(new ZodPipe(updateUserSchema)) payload: ValidUpdatedUser,
  ) {
    const { repeatPassword: _repeat, oldPassword, ...userPayload } = payload;

    const updatedUser = await this.usersService.update(
      user.id,
      userPayload,
      oldPassword,
    );

    if (updatedUser) {
      return { message: 'User updated' };
    }
  }

  @Get('user')
  async findOne(@Query('email') email: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body(new ZodPipe(updateUserSchema)) user: ValidUpdatedUser,
  ) {
    const { repeatPassword: _repeat, oldPassword, ...userPayload } = user;

    const updatedUser = await this.usersService.update(
      id,
      userPayload,
      oldPassword,
    );

    if (updatedUser) {
      return { message: 'User updated' };
    }
  }

  @Delete('remove/:id')
  async remove(@Param('id') id: string) {
    const removedUser = await this.usersService.remove(id);

    if (removedUser) {
      return { message: `User ${removedUser.email} removed` };
    }
  }
}
