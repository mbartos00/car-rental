import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Select a rating")
    .max(5, "Rating cannot exceed 5 stars"),
  description: z
    .string()
    .min(10, "Review should have at least 10 characters")
    .max(150, "Review should have at most 150 characters"),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
