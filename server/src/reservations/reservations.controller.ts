import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  adminReservationsQuerySchema,
  billingDetailsSchema,
  createReservationSchema,
  paymentIntentSchema,
} from 'src/shared/schemas/reservations.schema';
import {
  AdminReservationsQuery,
  BillingDetailsSchema,
  CreateReservationSchema,
  JwtUser,
  PaymentIntentSchema,
} from 'src/shared/types';
import { ZodPipe } from 'src/shared/zod-pipe/zod.pipe';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('payment-intent')
  createPaymentIntent(
    @User() user: JwtUser,
    @Body(new ZodPipe(paymentIntentSchema)) payload: PaymentIntentSchema,
  ) {
    return this.reservationsService.createPaymentIntent(user, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @User() user: JwtUser,
    @Body(new ZodPipe(createReservationSchema))
    payload: CreateReservationSchema,
  ) {
    return this.reservationsService.create(user.id, payload);
  }

  @Get('car/:carId')
  getBookedRanges(@Param('carId') carId: string) {
    return this.reservationsService.getBookedRanges(carId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findMine(@User() user: JwtUser) {
    return this.reservationsService.findMine(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('all')
  findAll(
    @Query(new ZodPipe(adminReservationsQuerySchema))
    query: AdminReservationsQuery,
  ) {
    return this.reservationsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('stats')
  getStats() {
    return this.reservationsService.getStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/billing')
  updateBilling(
    @Param('id') id: string,
    @Body(new ZodPipe(billingDetailsSchema)) billingInfo: BillingDetailsSchema,
  ) {
    return this.reservationsService.updateBilling(id, billingInfo);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/admin-cancel')
  adminCancel(@Param('id') id: string) {
    return this.reservationsService.adminCancel(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(@User() user: JwtUser, @Param('id') id: string) {
    return this.reservationsService.cancel(user.id, id);
  }
}
