import { User } from '@prisma/client';
import { z } from 'zod';
import { updateUserSchema, userSchema } from './schemas/user.schema';

export type UserWithoutPassword = Omit<User, 'password'>;

export type ValidUser = z.infer<typeof userSchema>;

export type ValidUpdatedUser = z.infer<typeof updateUserSchema>;
