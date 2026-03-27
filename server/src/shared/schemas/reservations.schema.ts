import { z } from 'zod';

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, { message: 'Invalid identifier' });

export const billingDetailsSchema = z.object({
  name: z.string().min(2),
  phoneNumber: z.e164({ message: 'Invalid phone number' }),
  address: z.string().min(6),
  city: z.string().min(2),
});

const reservationBaseSchema = z.object({
  carId: objectId,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  pickupLocationId: objectId,
  dropoffLocationId: objectId,
  promoCode: z.string().trim().toUpperCase().optional(),
});

const hasValidDates = (data: { startDate: Date; endDate: Date }) =>
  data.endDate > data.startDate && data.startDate > new Date();

export const paymentIntentSchema = reservationBaseSchema.refine(hasValidDates, {
  path: ['endDate'],
  message: 'Invalid reservation dates',
});

export const createReservationSchema = reservationBaseSchema
  .extend({
    paymentIntentId: z.string().startsWith('pi_'),
    billingInfo: billingDetailsSchema,
    marketingConsent: z.boolean(),
  })
  .refine(hasValidDates, {
    path: ['endDate'],
    message: 'Invalid reservation dates',
  });
