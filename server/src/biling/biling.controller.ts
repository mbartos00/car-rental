import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  bilingSchema,
  updateBilingSchema,
} from 'src/shared/schemas/biling.schema';
import { BilingSchema, JwtUser, UpdateBilingSchema } from 'src/shared/types';
import { ZodPipe } from 'src/shared/zod-pipe/zod.pipe';
import { BilingService } from './biling.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('biling')
export class BilingController {
  constructor(private readonly bilingService: BilingService) {}

  @Post()
  create(
    @User() user: JwtUser,
    @Body(new ZodPipe(bilingSchema)) createBilingPayload: BilingSchema,
  ) {
    return this.bilingService.addBilingInfo(user.id, createBilingPayload);
  }

  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.bilingService.findAll();
  }

  @Get(':id')
  findOne(@User() user: JwtUser, @Param('id') id: string) {
    return this.bilingService.findOne(user, id);
  }

  @Patch(':id')
  update(
    @User() user: JwtUser,
    @Param('id') id: string,
    @Body(new ZodPipe(updateBilingSchema))
    updateBilingPayload: UpdateBilingSchema,
  ) {
    return this.bilingService.update(user, id, updateBilingPayload);
  }

  @Delete(':id')
  remove(@User() user: JwtUser, @Param('id') id: string) {
    return this.bilingService.remove(user, id);
  }
}
