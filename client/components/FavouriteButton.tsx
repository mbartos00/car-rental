"use client";
import { toggleFavouriteAction } from "@/api/actions";
import { FAVOURITE_ADDED_EVENT } from "@/constants/events";
import useToastContext from "@/hooks/useToastContext";
import { cn } from "@/lib/utils";
import { Heart, Loader2 } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type Props = {
  carId: string;
  isLoggedIn: boolean;
  isInFavourites: boolean;
};

const FavouriteButton = ({ carId, isLoggedIn, isInFavourites }: Props) => {
  const { handleToast } = useToastContext();
  const [pending, startTransition] = useTransition();
  const [optimisticFavourite, setOptimisticFavourite] =
    useOptimistic(isInFavourites);

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticFavourite(!isInFavourites);

      const result = await toggleFavouriteAction(carId, isInFavourites);

      if (!result.success) {
        handleToast(false, undefined, result.message);
        return;
      }

      if (!isInFavourites) {
        window.dispatchEvent(new CustomEvent(FAVOURITE_ADDED_EVENT));
      }
    });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={!isLoggedIn || pending}
          onClick={handleToggle}
          data-pending={pending || undefined}
          className="size-6 hover:bg-transparent group"
        >
          {pending ? (
            <Loader2 className="size-6 stroke-secondary-300 animate-spin" />
          ) : (
            <Heart
              className={cn(
                "size-6 stroke-secondary-300 transition-all",
                optimisticFavourite && "fill-red-500 stroke-0",
                isLoggedIn && "group-hover:fill-red-500 group-hover:stroke-0",
                !isLoggedIn && "stroke-secondary-100 fill-secondary-100"
              )}
            />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isLoggedIn && !optimisticFavourite && <p>Add to favourites</p>}

        {isLoggedIn && optimisticFavourite && <p>Remove from favourites</p>}

        {!isLoggedIn && <p>Please log in</p>}
      </TooltipContent>
    </Tooltip>
  );
};

export default FavouriteButton;
