"use server";

import { loginSchema } from "@/schemas/loginSchema";
import { profileSchema } from "@/schemas/profileSchema";
import { registerSchema } from "@/schemas/registerSchema";
import {
  ActionResult,
  LoginFormState,
  ProfileFormState,
  RegisterFormState,
} from "@/types";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  tokenCookieOptions,
} from "@/utlis/authCookies";
import decodeJwtPayload from "@/utlis/jwt";
import validateFormFields from "@/utlis/validateFormFields";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ROUTES } from "@/constants/routes";
import { loginUser, registerUser } from "./api";
import apiFetch from "./apiFetch";

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

export const updateProfileFormAction = async (
  _: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> => {
  const { errors: formErrors, data } = validateFormFields(
    profileSchema,
    formData
  );

  if (formErrors) {
    return { formErrors, success: false };
  }

  try {
    const res = await apiFetch("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    const resData = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        error: resData ?? {
          message: "Something went wrong",
          error: "Error",
          statusCode: res.status,
        },
      };
    }

    revalidatePath(ROUTES.USER);

    return { success: true, message: resData?.message ?? "Profile updated" };
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      error: {
        message: "Network error or invalid response",
        error: "NetworkError",
        statusCode: 0,
      },
    };
  }
};

export const toggleFavouriteAction = async (
  carId: string,
  isInFavourites: boolean
): Promise<ActionResult> => {
  try {
    const res = await apiFetch("/favourites", {
      method: isInFavourites ? "DELETE" : "PATCH",
      body: JSON.stringify({ carId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const message =
        typeof data?.message === "string"
          ? data.message
          : "Something went wrong";

      return { success: false, message };
    }

    revalidatePath(ROUTES.CARS);
    revalidatePath(ROUTES.FAVOURITES);

    return {
      success: true,
      message: isInFavourites
        ? "Removed from favourites"
        : "Added to favourites",
    };
  } catch (error) {
    console.error("Favourites toggle error:", error);
    return { success: false, message: "Network error" };
  }
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
