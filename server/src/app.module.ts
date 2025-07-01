import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './db/prisma.module';
import { UsersModule } from './users/users.module';
import { CarsModule } from './cars/cars.module';

@Module({
  imports: [AuthModule, UsersModule, PrismaModule, CarsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
