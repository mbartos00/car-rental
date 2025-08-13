import { Module } from '@nestjs/common';
import { BilingService } from './biling.service';
import { BilingController } from './biling.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [BilingController],
  providers: [BilingService, UsersService],
})
export class BilingModule {}
