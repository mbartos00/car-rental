"use server";

import { loginSchema } from "@/schemas/loginSchema";
import { LoginState } from "@/types";
import { z } from "zod";

export const loginFormAction = async (
  _: LoginState,
  formData: FormData
): Promise<LoginState> => {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    const errorTree = z.treeifyError(validatedFields.error);
    return {
      errors: {
        email: errorTree.properties?.email?.errors,
        password: errorTree.properties?.password?.errors,
      },
    };
  }

  return { success: true }; // TODO: Add auth logic
};
