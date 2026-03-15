import { z } from "zod";
import { passwordSchema } from "./loginSchema";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

export const profileSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name should have at least 2 characters"),
    lastName: z.string().min(2, "Last name should have at least 2 characters"),
    email: z.email("Invalid email"),
    oldPassword: z.preprocess(emptyToUndefined, passwordSchema.optional()),
    password: z.preprocess(emptyToUndefined, passwordSchema.optional()),
    repeatPassword: z.preprocess(emptyToUndefined, z.string().optional()),
  })
  .superRefine((data, ctx) => {
    if (data.password && !data.oldPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Old password is required to set a new password",
        path: ["oldPassword"],
      });
    }

    if (data.oldPassword && !data.password) {
      ctx.addIssue({
        code: "custom",
        message: "Please provide a new password",
        path: ["password"],
      });
    }

    if (data.password && data.password !== data.repeatPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords did not match",
        path: ["repeatPassword"],
      });
    }
  });
