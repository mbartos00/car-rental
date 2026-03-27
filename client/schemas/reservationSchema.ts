import { combineDateTime } from "@/lib/utils";
import { z } from "zod";

export const reservationSchema = z
  .object({
    billingInfo: z.object({
      name: z.string().min(2, "Name should have at least 2 characters"),
      phoneNumber: z.e164("Invalid phone number, use +48... format"),
      address: z.string().min(6, "Address should have at least 6 characters"),
      city: z.string().min(2, "City should have at least 2 characters"),
    }),
    pickupLocationId: z.string().min(1, "Select a pick-up location"),
    pickupDate: z.date({ message: "Select a pick-up date" }),
    pickupTime: z.string().min(1, "Select a pick-up time"),
    dropoffLocationId: z.string().min(1, "Select a drop-off location"),
    dropoffDate: z.date({ message: "Select a drop-off date" }),
    dropoffTime: z.string().min(1, "Select a drop-off time"),
    marketingConsent: z.boolean(),
    terms: z
      .boolean()
      .refine((value) => value === true, {
        message: "You must accept the terms and conditions",
      }),
  })
  .refine(
    (data) =>
      combineDateTime(data.dropoffDate, data.dropoffTime) >
      combineDateTime(data.pickupDate, data.pickupTime),
    {
      path: ["dropoffDate"],
      message: "Drop-off must be after pick-up",
    }
  );

export type ReservationFormValues = z.infer<typeof reservationSchema>;
