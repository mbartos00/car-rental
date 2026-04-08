"use client";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

const StarRatingInput = ({ value, onChange }: Props) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;

        return (
          <button
            key={starValue}
            type="button"
            aria-label={`Rate ${starValue} ${starValue === 1 ? "star" : "stars"}`}
            onClick={() => onChange(starValue)}
            className="cursor-pointer transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "size-6 stroke-secondary-300",
                value >= starValue && "fill-accent stroke-transparent"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRatingInput;
