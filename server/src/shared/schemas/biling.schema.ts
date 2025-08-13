import { z } from 'zod';

export const bilingSchema = z.object({
  phoneNumber: z.e164('Invalid phone number').min(6),
  address: z.string().min(6),
  city: z.string(),
  postalCode: z.string('Invalid postal code (xx-xxx)').regex(/^\d{2}-\d{3}$/),
});

export const updateBilingSchema = z
  .object({
    phoneNumber: z.e164('Invalid phone number').min(6),
    address: z.string().min(6),
    city: z.string(),
    postalCode: z.string('Invalid postal code (xx-xxx)').regex(/^\d{2}-\d{3}$/),
  })
  .partial();
