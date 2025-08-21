import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import React from "react";

const RatingStars = ({
  starsCount = 5,
  rating,
}: {
  starsCount?: number;
  rating: number;
}) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: starsCount }).map((_, i) => (
        <Star
          className={`size-4 stroke-secondary-300 ${cn(
            (rating || 0) > i && "fill-accent stroke-transparent size-5"
          )}`}
          key={i}
        />
      ))}
    </div>
  );
};

export default RatingStars;
