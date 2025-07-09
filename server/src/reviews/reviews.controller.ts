import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/auth/decorators/user.decorator';
import {
  reviewSchema,
  updateReviewSchema,
} from 'src/shared/schemas/reviews.schema';
import { JwtUser, ReviewSchema, UpdateReviewSchema } from 'src/shared/types';
import { ZodPipe } from 'src/shared/zod-pipe/zod.pipe';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('/add')
  create(
    @User() user: JwtUser,
    @Body(new ZodPipe(reviewSchema)) reviewPayload: ReviewSchema,
  ) {
    return this.reviewsService.create(user.id, reviewPayload);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @User() user: JwtUser,
    @Body(new ZodPipe(updateReviewSchema))
    updateReviewPayload: UpdateReviewSchema,
  ) {
    return this.reviewsService.update(id, user.id, updateReviewPayload);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: JwtUser) {
    return this.reviewsService.remove(id, user.id);
  }
}
