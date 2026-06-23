import { z } from "zod";
import { passwordSchema } from "./loginSchema";

export const profileSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name should have at least 2 characters"),
    lastName: z.string().min(2, "Last name should have at least 2 characters"),
    email: z.email("Invalid email"),
    oldPassword: z.string().optional(),
    password: z.string().optional(),
    repeatPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const isChangingPassword = !!(
      data.oldPassword ||
      data.password ||
      data.repeatPassword
    );

    if (!isChangingPassword) return;

    if (!data.oldPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Old password is required to set a new password",
        path: ["oldPassword"],
      });
    }

    if (!data.password) {
      ctx.addIssue({
        code: "custom",
        message: "Please provide a new password",
        path: ["password"],
      });
    } else {
      const result = passwordSchema.safeParse(data.password);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({ code: "custom", message: issue.message, path: ["password"] });
        }
      }
    }

    if (data.password && data.password !== data.repeatPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords did not match",
        path: ["repeatPassword"],
      });
    }
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
