import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './db/prisma.module';
import { UsersModule } from './users/users.module';
import { CarsModule } from './cars/cars.module';
import { FavouritesModule } from './favourites/favourites.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ReservationsModule } from './reservations/reservations.module';
import { LocationsModule } from './locations/locations.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PrismaModule,
    CarsModule,
    FavouritesModule,
    ReviewsModule,
    ReservationsModule,
    LocationsModule,
    PromoCodesModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
