import { z } from 'zod';
import { CarType, Gearbox } from '@prisma/client';

const priceValidation = z
  .number()
  .positive()
  .superRefine((price, ctx) => {
    const splitted = price.toString().split('.');
    console.log(splitted);
    if (splitted.length > 1 && splitted[1].length > 2)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Max price precision is 2 decimal places',
        path: ['price'],
      });
  });

export const carSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(50),
  price: priceValidation,
  carType: z.nativeEnum(CarType, { message: `Invalid car type` }),
  images: z.array(z.string().url()).min(3),
  tankCapacity: z.number().positive().min(5),
  gearbox: z.nativeEnum(Gearbox),
  seats: z.number().positive().min(1),
});

export const updateCarSchema = carSchema.partial();
