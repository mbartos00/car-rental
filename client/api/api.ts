import { Car, CarFilters, Pagination } from "@/types";

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
