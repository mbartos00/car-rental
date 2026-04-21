import {
  BookedRange,
  Car,
  CarFilters,
  FavouritesResponse,
  Location,
  LoginApiResult,
  LoginUserInput,
  Pagination,
  Profile,
  Reservation,
  RegisterFormState,
  RegisterUserInput,
} from "@/types";
import { REFRESH_TOKEN_COOKIE } from "@/utlis/authCookies";
import { notFound } from "next/navigation";
import { cache } from "react";
import apiFetch from "./apiFetch";

export const getLocations = async (): Promise<Location[]> => {
  const res = await fetch(`${process.env.API_URL}/locations`);

  if (!res.ok) {
    throw new Error("Failed to load locations");
  }

  return await res.json();
};

export const getBookedRanges = async (
  carId: string
): Promise<BookedRange[]> => {
  const res = await fetch(
    `${process.env.API_URL}/reservations/car/${carId}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to load booked dates");
  }

  return await res.json();
};

export const getMyReservations = async (): Promise<Reservation[] | null> => {
  try {
    const res = await apiFetch("/reservations");

    if (!res.ok) return null;

    return await res.json();
  } catch (error) {
    console.error("Reservations fetch error:", error);
    return null;
  }
};

export const getMe = async (): Promise<Profile | null> => {
  try {
    const res = await apiFetch("/users/me");

    if (!res.ok) return null;

    return await res.json();
  } catch (error) {
    console.error("Profile fetch error:", error);
    return null;
  }
};

export const getFavourites = cache(async (): Promise<Car[] | null> => {
  try {
    const res = await apiFetch("/favourites");

    if (!res.ok) return null;

    const data: FavouritesResponse = await res.json();

    return data.cars;
  } catch (error) {
    console.error("Favourites fetch error:", error);
    return null;
  }
});

export const getPopularCars = async (limit = 8): Promise<Car[]> => {
  try {
    const res = await apiFetch(`/cars/popular?limit=${limit}`);

    if (!res.ok) return [];

    return await res.json();
  } catch (error) {
    console.error("Popular cars fetch error:", error);
    return [];
  }
};

export const getRecommendedCars = async (limit = 8): Promise<Car[]> => {
  try {
    const res = await apiFetch(`/cars/recommended?limit=${limit}`);

    if (!res.ok) return [];

    return await res.json();
  } catch (error) {
    console.error("Recommended cars fetch error:", error);
    return [];
  }
};

export const getCarFilters = async (): Promise<CarFilters> => {
  const res = await fetch(`${process.env.API_URL}/cars/filters`);

  if (!res.ok) {
    throw new Error("Failed to load car filters");
  }

  return await res.json();
};

export const getCarsWithParams = async (
  queryParams?: Promise<{ [key: string]: string | string[] | undefined }>,
  limit?: number
): Promise<{ data: Car[]; pagination: Pagination }> => {
  const params = queryParams ? await queryParams : {};
  const searchParams = new URLSearchParams();

  for (const key in params) {
    const value = params[key];
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v));
    } else if (value !== undefined) {
      searchParams.set(key, value);
    }
  }

  const res = await fetch(
    `${process.env.API_URL}/cars?${searchParams.toString()}&limit=${limit}`
  );

  if (!res.ok) {
    throw new Error("Failed to load cars");
  }

  return await res.json();
};

export const getCar = async (id: string): Promise<Car> => {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    notFound();
  }

  const res = await fetch(`${process.env.API_URL}/cars/${id}`);

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error("Failed to load the car");
  }

  return await res.json();
};

export const loginUser = async (
  credentials: LoginUserInput
): Promise<LoginApiResult> => {
  try {
    const res = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data };
    }

    const refreshCookie = res.headers
      .getSetCookie()
      .find((cookie) => cookie.startsWith(`${REFRESH_TOKEN_COOKIE}=`));
    const refreshToken = refreshCookie
      ? decodeURIComponent(
          refreshCookie.split(";")[0].slice(REFRESH_TOKEN_COOKIE.length + 1)
        )
      : undefined;

    if (!data.accessToken || !refreshToken) {
      return {
        success: false,
        error: {
          message: "Malformed login response",
          error: "AuthError",
          statusCode: 500,
        },
      };
    }

    return { success: true, accessToken: data.accessToken, refreshToken };
  } catch (error) {
    console.error("Login error:", error);
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

export const registerUser = async (
  userData: RegisterUserInput
): Promise<RegisterFormState> => {
  try {
    const res = await fetch(`${process.env.API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data,
      };
    }

    return {
      success: true,
      message: data?.message || "Account created successfully!",
    };
  } catch (error) {
    console.error("Registration error:", error);
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
