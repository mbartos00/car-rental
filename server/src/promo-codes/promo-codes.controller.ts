import {
  Body,
  Controller,
  Delete,
  Get,
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
  promoCodeSchema,
  updatePromoCodeSchema,
  validatePromoQuerySchema,
} from 'src/shared/schemas/promo-codes.schema';
import {
  PromoCodeSchema,
  UpdatePromoCodeSchema,
  ValidatePromoQuery,
} from 'src/shared/types';
import { ZodPipe } from 'src/shared/zod-pipe/zod.pipe';
import { PromoCodesService } from './promo-codes.service';

@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Get('validate')
  validate(
    @Query(new ZodPipe(validatePromoQuerySchema)) query: ValidatePromoQuery,
  ) {
    return this.promoCodesService.validate(query.code);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.promoCodesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body(new ZodPipe(promoCodeSchema)) payload: PromoCodeSchema) {
    return this.promoCodesService.create(payload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodPipe(updatePromoCodeSchema)) payload: UpdatePromoCodeSchema,
  ) {
    return this.promoCodesService.update(id, payload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promoCodesService.remove(id);
  }
}
