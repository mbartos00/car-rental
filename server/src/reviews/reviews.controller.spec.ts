import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ZodPipe } from 'src/shared/zod-pipe/zod.pipe';
import { BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: jest.Mocked<ReviewsService>;

  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    role: Role.USER,
  };

  const mockReview = {
    id: 'review1',
    description: 'Great car!',
    rating: 5,
    carId: 'car123',
    userId: 'user123',
    createdAt: new Date(),
  };

  const mockReviewPayload = {
    description: 'Great car!',
    rating: 5,
    carId: 'car123',
  };

  const mockUpdateReviewPayload = {
    carId: 'car123',
    description: 'Updated review text',
    rating: 4,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: ZodPipe,
          useValue: {
            transform: jest.fn((value) => value),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get(ReviewsService);
  });

  describe('create', () => {
    it('should create a review successfully', async () => {
      service.create.mockResolvedValue(mockReview);

      const result = await controller.create(mockUser, mockReviewPayload);

      expect(result).toEqual(mockReview);
      expect(service.create).toHaveBeenCalledWith(
        mockUser.id,
        mockReviewPayload,
      );
    });

    it('should throw error when creation fails', async () => {
      service.create.mockRejectedValue(new Error('Create failed'));

      await expect(
        controller.create(mockUser, mockReviewPayload),
      ).rejects.toThrow('Create failed');

      expect(service.create).toHaveBeenCalledWith(
        mockUser.id,
        mockReviewPayload,
      );
    });
  });

  describe('update', () => {
    it('should update review successfully', async () => {
      const updatedReview = {
        ...mockReview,
        ...mockUpdateReviewPayload,
      };

      service.update.mockResolvedValue(updatedReview);

      const result = await controller.update(
        mockReview.id,
        mockUser,
        mockUpdateReviewPayload,
      );

      expect(result).toEqual(updatedReview);
      expect(service.update).toHaveBeenCalledWith(
        mockReview.id,
        mockUser.id,
        mockUpdateReviewPayload,
      );
    });

    it('should throw error on failed update', async () => {
      service.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        controller.update(mockReview.id, mockUser, mockUpdateReviewPayload),
      ).rejects.toThrow('Update failed');

      expect(service.update).toHaveBeenCalledWith(
        mockReview.id,
        mockUser.id,
        mockUpdateReviewPayload,
      );
    });
  });

  describe('remove', () => {
    it('should delete review successfully', async () => {
      service.remove.mockResolvedValue({ message: 'Review deleted' });

      const result = await controller.remove(mockReview.id, mockUser);

      expect(result).toEqual({ message: 'Review deleted' });
      expect(service.remove).toHaveBeenCalledWith(mockReview.id, mockUser.id);
    });

    it('should throw error when deletion fails', async () => {
      service.remove.mockRejectedValue(new Error('Delete failed'));

      await expect(controller.remove(mockReview.id, mockUser)).rejects.toThrow(
        'Delete failed',
      );

      expect(service.remove).toHaveBeenCalledWith(mockReview.id, mockUser.id);
    });
  });
});
