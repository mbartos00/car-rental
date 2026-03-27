import { z } from 'zod';

export const locationSchema = z.object({
  name: z.string().trim().min(2),
});
