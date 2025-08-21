import {
  Car,
  CarFilters,
  Pagination,
  RegisterFormState,
  RegisterUserInput,
} from "@/types";

export const getCarFilters = async (): Promise<CarFilters> => {
  const res = await fetch(`${process.env.API_URL}/cars/filters`);

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

  return await res.json();
};

export const getCar = async (id: string): Promise<Car> => {
  const res = await fetch(`${process.env.API_URL}/cars/${id}`);

  return await res.json();
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
