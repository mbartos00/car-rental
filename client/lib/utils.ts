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

export const combineDateTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);

  return combined;
};

export const calculateRentalDays = (start: Date, end: Date) => {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000));
};

export const formatDate = (inputDate: string) => {
  const date = new Date(inputDate);

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };

  return date.toLocaleDateString("en-GB", options);
};
