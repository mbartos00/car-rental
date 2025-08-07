import { z } from 'zod';
import { CarType, Gearbox } from '@prisma/client';

const priceValidation = z
  .number()
  .positive()
  .superRefine((price, ctx) => {
    const splitted = price.toString().split('.');
    if (splitted.length > 1 && splitted[1].length > 2)
      ctx.addIssue({
        code: 'custom',
        message: 'Max price precision is 2 decimal places',
        path: ['price'],
      });
  });

export const carSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(50),
  price: priceValidation,
  carType: z.enum(CarType, { message: `Invalid car type` }),
  images: z.array(z.url()).min(3),
  tankCapacity: z.number().positive().min(5),
  gearbox: z.enum(Gearbox),
  seats: z.number().positive().min(1),
});

export const updateCarSchema = carSchema.partial();

export const carQuerySchema = z.object({
  name: z.string().optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  car_type: z.enum(CarType).optional(),
  gearbox: z.enum(Gearbox).optional(),
  seats: z.coerce.number().min(1).optional(),
  min_tank_capacity: z.coerce.number().min(1).optional(),
  max_tank_capacity: z.coerce.number().min(1).optional(),
  sort_by: z
    .enum(['name', 'price', 'seats', 'tankCapacity', 'createdAt'])
    .default('createdAt'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
});
