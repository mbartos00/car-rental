"use server";

import { registerSchema } from "@/schemas/registerSchema";
import { LoginState, RegisterState } from "@/types";
import validateFormFields from "@/utlis/validateFormFields";

export const loginFormAction = async (
  _: LoginState,
  formData: FormData
): Promise<LoginState> => {
  const errors = validateFormFields(registerSchema, formData);

  if (errors) {
    return { errors };
  }

  return { success: true }; // TODO: Add auth logic
};

export const registerFormAction = async (
  _: RegisterState,
  formData: FormData
): Promise<RegisterState> => {
  const errors = validateFormFields(registerSchema, formData);

  if (errors) {
    return { errors };
  }

  return { success: true }; // TODO: Add auth logic
};
