import { z } from "zod";

export const carFormSchema = z.object({
  name: z.string().min(2, "Name should have at least 2 characters"),
  description: z
    .string()
    .min(50, "Description should have at least 50 characters"),
  price: z.coerce
    .number<number>()
    .positive("Price must be greater than 0")
    .multipleOf(0.01, "Max price precision is 2 decimal places"),
  carType: z.enum(["SEDAN", "SUV", "CONVERTIBLE", "COUPE", "HATCHBACK"], {
    message: "Select a car type",
  }),
  gearbox: z.enum(["MANUAL", "AUTOMATIC"], { message: "Select a gearbox" }),
  seats: z.coerce.number<number>().min(1, "At least 1 seat"),
  tankCapacity: z.coerce.number<number>().min(5, "At least 5 liters"),
  images: z
    .array(z.object({ url: z.url("Invalid image URL") }))
    .min(3, "Provide at least 3 image URLs"),
});

export type CarFormValues = z.infer<typeof carFormSchema>;

export const locationFormSchema = z.object({
  name: z.string().min(2, "Name should have at least 2 characters"),
});

export type LocationFormValues = z.infer<typeof locationFormSchema>;

export const promoFormSchema = z.object({
  code: z
    .string()
    .min(3, "Code should have at least 3 characters")
    .toUpperCase(),
  discountPercent: z.coerce
    .number<number>()
    .int("Whole percentages only")
    .min(1, "Minimum 1%")
    .max(100, "Maximum 100%"),
  active: z.boolean(),
});

export type PromoFormValues = z.infer<typeof promoFormSchema>;

export const billingFormSchema = z.object({
  name: z.string().min(2, "Name should have at least 2 characters"),
  phoneNumber: z.e164("Invalid phone number, use +48... format"),
  address: z.string().min(6, "Address should have at least 6 characters"),
  city: z.string().min(2, "City should have at least 2 characters"),
});

export type BillingFormValues = z.infer<typeof billingFormSchema>;

export const adminUserFormSchema = z.object({
  firstName: z.string().min(2, "First name should have at least 2 characters"),
  lastName: z.string().min(2, "Last name should have at least 2 characters"),
  email: z.email("Invalid email address"),
});

export type AdminUserFormValues = z.infer<typeof adminUserFormSchema>;
