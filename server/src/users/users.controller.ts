import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ZodPipe } from 'src/shared/zod-pipe/zod.pipe';
import { updateUserSchema, userSchema } from 'src/shared/schemas/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import multerOptions from 'src/config/multer.config';
import { ValidUpdatedUser, ValidUser } from 'src/shared/types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //TODO: Add role guards to allow only admins to use this endpoint
  @Post('create')
  @UseInterceptors(FileInterceptor('avatar', multerOptions))
  async create(
    @Body(new ZodPipe(userSchema)) user: ValidUser,
    @UploadedFile(new ParseFilePipeBuilder().build({ fileIsRequired: false }))
    avatarFile: Express.Multer.File | undefined,
  ) {
    const existingUser = await this.usersService.findOneByEmail(user.email);

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const { repeatPassword: _, ...userPayload } = user;

    return this.usersService.create(userPayload, avatarFile?.filename);
  }

  @Get()
  async findAll() {
    return this.usersService.getAllUsers();
  }

  @Get('user')
  findOne(@Param('email') email: string) {
    return this.usersService.findOneByEmail(email);
  }

  @Patch('update/:id')
  @UseInterceptors(FileInterceptor('avatar', multerOptions))
  async update(
    @Param('id') id: string,
    @Body(new ZodPipe(updateUserSchema)) user: ValidUpdatedUser,
    @UploadedFile(new ParseFilePipeBuilder().build({ fileIsRequired: false }))
    avatarFile: Express.Multer.File | undefined,
  ) {
    const { repeatPassword: _repeat, oldPassword: _old, ...userPayload } = user;

    const updatedUser = await this.usersService.update(
      id,
      userPayload,
      avatarFile?.filename,
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
