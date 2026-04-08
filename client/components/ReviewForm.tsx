"use client";
import { createReviewAction, updateReviewAction } from "@/api/actions";
import useToastContext from "@/hooks/useToastContext";
import { reviewSchema } from "@/schemas/reviewSchema";
import { Review } from "@/types";
import { useState, useTransition } from "react";
import StarRatingInput from "./StarRatingInput";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

type Props = {
  carId: string;
  review?: Review;
  onDone?: () => void;
};

const ReviewForm = ({ carId, review, onDone }: Props) => {
  const { handleToast } = useToastContext();
  const [pending, startTransition] = useTransition();
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [description, setDescription] = useState(review?.description ?? "");
  const [errors, setErrors] = useState<{
    rating?: string;
    description?: string;
  }>({});

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = reviewSchema.safeParse({ rating, description });

    if (!parsed.success) {
      const tree = parsed.error.flatten().fieldErrors;
      setErrors({
        rating: tree.rating?.[0],
        description: tree.description?.[0],
      });
      return;
    }

    setErrors({});

    startTransition(async () => {
      const result = review
        ? await updateReviewAction(review.id, carId, parsed.data)
        : await createReviewAction(carId, parsed.data);

      handleToast(result.success, undefined, result.message);

      if (result.success) {
        if (!review) {
          setRating(0);
          setDescription("");
        }

        onDone?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label>Your rating</Label>
        <StarRatingInput value={rating} onChange={setRating} />
        {errors.rating && (
          <p aria-live="polite" className="text-red-500 text-sm">
            {errors.rating}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-description">Your review</Label>
        <textarea
          id="review-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Tell others how the car worked out for you"
          rows={3}
          maxLength={150}
          className="w-full rounded-md border border-secondary-200/40 bg-primary-100/25 p-3 text-sm placeholder:text-secondary-400 placeholder:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
        />
        {errors.description && (
          <p aria-live="polite" className="text-red-500 text-sm">
            {errors.description}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button type="submit" className="w-fit" disabled={pending}>
          {pending
            ? "Saving..."
            : review
              ? "Update review"
              : "Submit review"}
        </Button>
        {review && onDone && (
          <Button
            type="button"
            variant="outline"
            onClick={onDone}
            disabled={pending}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
