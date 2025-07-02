import { z } from 'zod';

export const addToFavouritesSchema = z.object({
  carId: z.string().regex(/^[a-f\d]{24}$/i, { message: 'Invalid ObjectId' }),
});
