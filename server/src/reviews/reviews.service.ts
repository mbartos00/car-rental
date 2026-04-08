import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';
import { ReviewSchema, UpdateReviewSchema } from 'src/shared/types';

@Injectable()
export class ReviewsService {
  constructor(private prismaService: PrismaService) {}

  async create(userId: string, reviewPayload: ReviewSchema) {
    const completedReservations = await this.prismaService.reservation.count({
      where: {
        userId,
        carId: reviewPayload.carId,
        status: ReservationStatus.CONFIRMED,
        endDate: { lt: new Date() },
      },
    });

    if (completedReservations === 0) {
      throw new ForbiddenException(
        'You can review a car only after your reservation ends',
      );
    }

    const isReviewExist = await this.prismaService.review.count({
      where: {
        userId,
        carId: reviewPayload.carId,
      },
    });

    if (isReviewExist > 0) {
      throw new ConflictException('Review already exist');
    }

    return await this.prismaService.review.create({
      data: {
        userId,
        ...reviewPayload,
        rating: Math.round(reviewPayload.rating),
      },
      omit: {
        userId: true,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    updateReviewPayload: UpdateReviewSchema,
  ) {
    return this.prismaService.$transaction(async (prisma) => {
      const review = await prisma.review.findUnique({ where: { id } });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      if (review.userId !== userId) {
        throw new ForbiddenException('You cannot update this review');
      }

      return prisma.review.update({
        where: { id },
        data: { ...updateReviewPayload },
        omit: {
          userId: true,
        },
      });
    });
  }

  async remove(id: string, userId: string) {
    return this.prismaService.$transaction(async (prisma) => {
      const review = await prisma.review.findUnique({ where: { id } });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      if (review.userId !== userId) {
        throw new ForbiddenException('You cannot delete this review');
      }

      await prisma.review.delete({
        where: { id },
      });

      return { message: 'Review deleted successfully' };
    });
  }
}
