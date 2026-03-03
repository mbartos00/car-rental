"use server";

import { loginSchema } from "@/schemas/loginSchema";
import { registerSchema } from "@/schemas/registerSchema";
import { LoginFormState, RegisterFormState } from "@/types";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  tokenCookieOptions,
} from "@/utlis/authCookies";
import decodeJwtPayload from "@/utlis/jwt";
import validateFormFields from "@/utlis/validateFormFields";
import { cookies } from "next/headers";
import { loginUser, registerUser } from "./api";

export const loginFormAction = async (
  _: LoginFormState,
  formData: FormData
): Promise<LoginFormState> => {
  const { errors, data } = validateFormFields(loginSchema, formData);

  if (errors) {
    return { formErrors: errors };
  }

  const result = await loginUser(data);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const accessPayload = decodeJwtPayload(result.accessToken);
  const refreshPayload = decodeJwtPayload(result.refreshToken);

  if (!accessPayload || !refreshPayload) {
    return {
      success: false,
      error: {
        message: "Malformed login response",
        error: "AuthError",
        statusCode: 500,
      },
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(
    ACCESS_TOKEN_COOKIE,
    result.accessToken,
    tokenCookieOptions(accessPayload.exp)
  );
  cookieStore.set(
    REFRESH_TOKEN_COOKIE,
    result.refreshToken,
    tokenCookieOptions(refreshPayload.exp)
  );

  return { success: true, message: "Logged in successfully" };
};

export const logoutAction = async (): Promise<void> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (accessToken) {
    try {
      await fetch(`${process.env.API_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    }
  }

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
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
