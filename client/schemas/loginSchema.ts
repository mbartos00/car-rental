import { z } from "zod";

const passwordSchema = z
  .string()
  .min(6, { message: "Password should have minumum 6 characters" })
  .max(20, { message: "Password should have maximum 20 characters" })
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password should have at least one uppercase letter",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "Password should have at least one lowercase letter",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Password should have at least one number",
  })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    message: "Password should have at least one special character",
  });

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: passwordSchema,
});
