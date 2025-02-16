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

const userSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
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

export default userSchema;
