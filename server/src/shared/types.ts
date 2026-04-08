import { Prisma, Role, User } from '@prisma/client';
import { z } from 'zod';
import {
  carQuerySchema,
  limitQuerySchema,
  carSchema,
  updateCarSchema,
} from './schemas/cars.schema';
import {
  loginSchema,
  updateUserSchema,
  userSchema,
} from './schemas/user.schema';
import { addToFavouritesSchema } from './schemas/favourites.schema';
import { reviewSchema, updateReviewSchema } from './schemas/reviews.schema';
import {
  createReservationSchema,
  paymentIntentSchema,
} from './schemas/reservations.schema';
import { locationSchema } from './schemas/locations.schema';
import {
  promoCodeSchema,
  updatePromoCodeSchema,
  validatePromoQuerySchema,
} from './schemas/promo-codes.schema';

declare module 'express' {
  interface Request {
    cookies: { [key: string]: string };
  }
}

export type UserWithoutPassword = Omit<User, 'password'>;

export type ValidUser = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ValidUpdatedUser = z.infer<typeof updateUserSchema>;

export type PaymentIntentSchema = z.infer<typeof paymentIntentSchema>;
export type CreateReservationSchema = z.infer<typeof createReservationSchema>;
export type LocationSchema = z.infer<typeof locationSchema>;
export type PromoCodeSchema = z.infer<typeof promoCodeSchema>;
export type UpdatePromoCodeSchema = z.infer<typeof updatePromoCodeSchema>;
export type ValidatePromoQuery = z.infer<typeof validatePromoQuerySchema>;

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
};

export type JwtUser = {
  id: string;
  email: string;
  role: Role;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type CarInput = z.infer<typeof carSchema>;
export type CarUpdateInput = z.infer<typeof updateCarSchema>;
export type CarQuerySchema = z.infer<typeof carQuerySchema>;
export type LimitQuery = z.infer<typeof limitQuerySchema>;
export enum CarQueryParam {
  min_price = 'min_price',
  max_price = 'max_price',
  car_type = 'car_type',
  gearbox = 'gearbox',
  seats = 'seats',
  min_tank_capacity = 'min_tank_capacity',
  max_tank_capacity = 'max_tank_capacity',
  search = 'search',
}

export type AddToFavouritesSchema = z.infer<typeof addToFavouritesSchema>;

export type ReviewSchema = z.infer<typeof reviewSchema>;
export type UpdateReviewSchema = z.infer<typeof updateReviewSchema>;

export type PrismaError = Prisma.PrismaClientKnownRequestError;
