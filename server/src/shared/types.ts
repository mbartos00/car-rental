import { User } from '@prisma/client';
import { z } from 'zod';
import {
  loginSchema,
  updateUserSchema,
  userSchema,
} from './schemas/user.schema';

declare module 'express' {
  interface Request {
    cookies: { [key: string]: string };
  }
}

export type UserWithoutPassword = Omit<User, 'password'>;

export type ValidUser = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ValidUpdatedUser = z.infer<typeof updateUserSchema>;

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};
