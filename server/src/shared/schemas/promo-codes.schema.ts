import { z } from 'zod';

export const promoCodeSchema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(20),
  discountPercent: z.number().int().min(1).max(100),
  active: z.boolean().default(true),
});

export const updatePromoCodeSchema = promoCodeSchema.partial();

export const validatePromoQuerySchema = z.object({
  code: z.string().trim().toUpperCase(),
});
