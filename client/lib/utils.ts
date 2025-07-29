import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toTitleCase = (str: string) => {
  return (
    str.substring(0, 1).toUpperCase() +
    str.substring(1, str.length).toLowerCase()
  );
};

export const formatPriceToUSD = (price: number, fractionDigits = 2) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(price || 0);
};
