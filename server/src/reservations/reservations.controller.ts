import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  createReservationSchema,
  paymentIntentSchema,
} from 'src/shared/schemas/reservations.schema';
import {
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

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(@User() user: JwtUser, @Param('id') id: string) {
    return this.reservationsService.cancel(user.id, id);
  }
}
