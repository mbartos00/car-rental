import { cn, formatPriceToUSD, toTitleCase } from "@/lib/utils";
import { Car } from "@/types";
import { Heart } from "lucide-react";
import Link from "next/link";
import RatingStars from "./RatingStars";
import { Button } from "./ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { getSession } from "@/api/session";

const CarDescription = async ({
  id,
  carType,
  description,
  gearbox,
  name,
  price,
  seats,
  tankCapacity,
  reviewCount,
  averageReview,
}: Omit<Car, "images" | "reviews" | "createdAt">) => {
  const formattedPrice = formatPriceToUSD(price);
  const session = await getSession();
  const isLoggedIn = !!session;

  const isInFavourites = false; //TODO:Replace with logic

  return (
    <Card className="md:w-3/4">
      <CardHeader>
        <CardTitle className="font-bold text-2xl text-secondary-500 lg:text-3xl lg:mb-2">
          {name}
        </CardTitle>
        <div className="flex items-center">
          <RatingStars rating={averageReview || 0} />
          <p className="text-sm font-medium text-secondary-300 ml-2">
            {reviewCount === 0 || reviewCount === undefined
              ? "No reviews"
              : `${reviewCount} ${reviewCount <= 1 ? "Review" : "Reviews"}`}
          </p>
        </div>
        <CardAction>
          <Tooltip>
            <TooltipTrigger className="size-6 hover:bg-transparent group">
              <Button
                variant="ghost"
                size="icon"
                disabled={!isLoggedIn}
                asChild
                className="size-6 hover:bg-transparent group"
              >
                <Heart
                  className={cn(
                    "size-6 stroke-secondary-300 transition-all",
                    isInFavourites && "fill-red-500 stroke-0",
                    isLoggedIn &&
                      "group-hover:fill-red-500 group-hover:stroke-0",
                    !isLoggedIn && "stroke-secondary-100 fill-secondary-100",
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isLoggedIn && !isInFavourites && <p>Add to favourites</p>}

              {isLoggedIn && isInFavourites && <p>Remove from favourites</p>}

              {!isLoggedIn && <p>Please log in</p>}
            </TooltipContent>
          </Tooltip>
        </CardAction>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm font-regular text-secondary-400 leading-loose md:text-base lg:text-xl">
          {description}
        </CardDescription>
        <div className="grid grid-cols-2 gap-x-10 gap-y-4 my-4">
          <p className="flex flex-wrap justify-between text-sm font-semibold text-secondary-500 md:text-base lg:text-xl">
            <span className="text-secondary-300 font-medium">Car Type</span>
            {toTitleCase(carType)}
          </p>
          <p className="flex flex-wrap justify-between text-sm font-semibold text-secondary-500 md:text-base lg:text-xl">
            <span className="text-secondary-300 font-medium">Seats</span>
            {seats}
          </p>
          <p className="flex flex-wrap justify-between text-sm font-semibold text-secondary-500 md:text-base lg:text-xl">
            <span className="text-secondary-300 font-medium">Gearbox</span>
            {toTitleCase(gearbox)}
          </p>
          <p className="flex flex-wrap justify-between text-sm font-semibold text-secondary-500 md:text-base lg:text-xl">
            <span className="text-secondary-300 font-medium">
              Tank Capacity
            </span>
            {tankCapacity}
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-2 flex-wrap md:mt-auto">
        <p className="text-xl text-secondary-500 font-bold md:text-3xl">
          {formattedPrice}/
          <span className="text-xs text-secondary-300">day</span>
        </p>
        <Button size={"lg"} className="text-base md:p-8" asChild>
          <Link href={`reservation/${id}`}>Rent Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CarDescription;
