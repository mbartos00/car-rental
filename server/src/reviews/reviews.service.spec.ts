import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/db/prisma.service';
import { ReviewsService } from './reviews.service';
import { PrismaClient, Review } from '@prisma/client';

describe('ReviewsService', () => {
  let reviewsService: ReviewsService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  const mockReview: Review = {
    id: 'review1',
    description: 'Excellent car, very comfortable.',
    rating: 5,
    carId: 'car1',
    userId: 'user1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    reviewsService = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a review', async () => {
      prismaMock.review.create.mockResolvedValue(mockReview);

      const result = await reviewsService.create('user1', {
        carId: 'car1',
        description: 'Excellent car, very comfortable.',
        rating: 5,
      });

      expect(result).toEqual(mockReview);
      expect(prismaMock.review.create).toHaveBeenCalledWith({
        data: {
          carId: 'car1',
          description: 'Excellent car, very comfortable.',
          rating: 5,
          userId: 'user1',
        },
        omit: {
          userId: true,
        },
      });
    });

    it('should throw ConflictException if review already exists', async () => {
      prismaMock.review.count.mockResolvedValue(1);

      await expect(reviewsService.create('user1', mockReview)).rejects.toThrow(
        ConflictException,
      );

      expect(prismaMock.review.count).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          carId: mockReview.carId,
        },
      });

      expect(prismaMock.review.create).not.toHaveBeenCalled();
    });

    it('should round rating before saving', async () => {
      prismaMock.review.count.mockResolvedValue(0);
      prismaMock.review.create.mockResolvedValue({ ...mockReview, rating: 4 });

      await reviewsService.create('user1', {
        carId: 'car1',
        description: 'Good car',
        rating: 4.2,
      });

      expect(prismaMock.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ rating: 4 }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update review when user owns it', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb(prismaMock);
      });

      prismaMock.review.findUnique.mockResolvedValue(mockReview);
      prismaMock.review.update.mockResolvedValue({
        ...mockReview,
        rating: 4,
      });

      const result = await reviewsService.update('review1', 'user1', {
        rating: 4,
        carId: 'car1',
      });

      expect(result).toEqual({
        ...mockReview,
        rating: 4,
      });
      expect(prismaMock.review.findUnique).toHaveBeenCalledWith({
        where: { id: 'review1' },
      });
      expect(prismaMock.review.update).toHaveBeenCalledWith({
        where: { id: 'review1' },
        data: { rating: 4, carId: 'car1' },
        omit: {
          userId: true,
        },
      });
    });

    it('should throw NotFoundException if review not found', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb(prismaMock);
      });

      prismaMock.review.findUnique.mockResolvedValue(null);

      await expect(
        reviewsService.update('review1', 'user1', {
          rating: 4,
          carId: 'car1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the review', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb(prismaMock);
      });

      prismaMock.review.findUnique.mockResolvedValue({
        ...mockReview,
        userId: 'otherUser',
      });

      await expect(
        reviewsService.update('review1', 'user1', {
          rating: 4,
          carId: 'car1',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete review if user owns it', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb(prismaMock);
      });

      prismaMock.review.findUnique.mockResolvedValue(mockReview);

      const result = await reviewsService.remove('review1', 'user1');

      expect(result).toEqual({ message: 'Review deleted successfully' });
      expect(prismaMock.review.delete).toHaveBeenCalledWith({
        where: { id: 'review1' },
      });
    });

    it('should throw NotFoundException if review not found', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb(prismaMock);
      });

      prismaMock.review.findUnique.mockResolvedValue(null);

      await expect(reviewsService.remove('review1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own the review', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb(prismaMock);
      });

      prismaMock.review.findUnique.mockResolvedValue({
        ...mockReview,
        userId: 'anotherUser',
      });

      await expect(reviewsService.remove('review1', 'user1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
