import { z } from "zod";
import { passwordSchema } from "./loginSchema";

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name should have at least 2 characters"),
    lastName: z.string().min(2, "Last name should have at least 2 characters"),
    email: z.email("Invalid email"),
    password: passwordSchema,
    repeatPassword: z.string(),
  })
  .superRefine(({ repeatPassword, password }, ctx) => {
    if (repeatPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords did not match",
        path: ["repeatPassword"],
      });
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
