import { z } from 'zod';

export const reviewSchema = z.object({
  description: z.string().min(10).max(150),
  rating: z.number().positive().min(1).max(5),
  carId: z.string().regex(/^[a-f\d]{24}$/i, { message: 'Invalid ObjectId' }),
});

export const updateReviewSchema = z.object({
  description: z.string().min(10).max(150).optional(),
  rating: z.number().positive().min(1).max(5).optional(),
  carId: z.string().regex(/^[a-f\d]{24}$/i, { message: 'Invalid ObjectId' }),
});
