import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { stripeProvider } from './stripe.provider';

@Module({
  controllers: [ReservationsController],
  providers: [ReservationsService, stripeProvider],
})
export class ReservationsModule {}
