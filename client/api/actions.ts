"use server";

import { loginSchema } from "@/schemas/loginSchema";
import { registerSchema } from "@/schemas/registerSchema";
import { LoginFormState, RegisterFormState } from "@/types";
import validateFormFields from "@/utlis/validateFormFields";
import { registerUser } from "./api";

export const loginFormAction = async (
  _: LoginFormState,
  formData: FormData
): Promise<LoginFormState> => {
  const { errors, data } = validateFormFields(loginSchema, formData);

  if (errors) {
    return { errors };
  }

  return { success: true }; // TODO: Add auth logic
};

export const registerFormAction = async (
  _: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> => {
  const { errors: formErrors, data } = validateFormFields(
    registerSchema,
    formData
  );

  if (formErrors) {
    return {
      formErrors,
      success: false,
    };
  }

  return await registerUser(data);
};
