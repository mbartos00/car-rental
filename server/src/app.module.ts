import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './db/prisma.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'uploads') }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
