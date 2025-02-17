import { Role } from '@prisma/client';
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(6, { message: 'Password should have minumum 6 characters' })
  .max(20, { message: 'Password should have maximum 20 characters' })
  .refine((password) => /[A-Z]/.test(password), {
    message: 'Password should have at least one uppercase letter',
  })
  .refine((password) => /[a-z]/.test(password), {
    message: 'Password should have at least one lowercase letter',
  })
  .refine((password) => /[0-9]/.test(password), {
    message: 'Password should have at least one number',
  })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    message: 'Password should have at least one special character',
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
});

export const userSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    avatar: z.string(),
    password: passwordSchema,
    repeatPassword: passwordSchema,
    role: z.enum([Role.ADMIN, Role.USER]).default(Role.USER),
  })
  .superRefine(({ repeatPassword, password }, ctx) => {
    if (repeatPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['repeatPassword'],
      });
    }
  });

export const updateUserSchema = z
  .object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    avatar: z.string().optional(),
    oldPassword: passwordSchema.optional(),
    password: passwordSchema.optional(),
    repeatPassword: passwordSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const hasNonAvatarField = [
      'firstName',
      'lastName',
      'email',
      'password',
      'oldPassword',
      'repeatPassword',
    ].some((field) => data[field] !== undefined);

    if (!hasNonAvatarField && !data.avatar) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one field must be provided for update',
        path: [],
      });
    }

    if (data.oldPassword && (!data.password || !data.repeatPassword)) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Please provide old password, new password, and repeat password',
        path: ['oldPassword', 'password', 'repeatPassword'],
      });
    }

    if (data.password && data.repeatPassword === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please repeat password',
        path: ['repeatPassword'],
      });
    }

    if (data.repeatPassword && data.password !== data.repeatPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['password', 'repeatPassword'],
      });
    }
  });
