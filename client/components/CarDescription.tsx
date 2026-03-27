import { getFavourites } from "@/api/api";
import { ROUTES } from "@/constants/routes";
import { getSession } from "@/api/session";
import { formatPriceToUSD, toTitleCase } from "@/lib/utils";
import { Car } from "@/types";
import Link from "next/link";
import FavouriteButton from "./FavouriteButton";
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

  const favourites = isLoggedIn ? await getFavourites() : null;
  const isInFavourites = !!favourites?.some((car) => car.id === id);

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
          <FavouriteButton
            carId={id}
            isLoggedIn={isLoggedIn}
            isInFavourites={isInFavourites}
          />
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
          <Link href={`${ROUTES.RESERVATION}/${id}`}>Rent Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CarDescription;
