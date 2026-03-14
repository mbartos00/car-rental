import { formatPriceToUSD, toTitleCase } from "@/lib/utils";
import { CarType } from "@/types";
import { Fuel, LifeBuoy, User } from "lucide-react";
import Image from "next/image";
import FavouriteButton from "./FavouriteButton";
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
import Link from "next/link";

type Props = {
  id: string;
  carImage: string;
  name: string;
  carType: CarType;
  price: number;
  tankCapacity: number;
  gearbox: string;
  seats: number;
  isLoggedIn: boolean;
  isInFavourites: boolean;
};

const CarCard = ({
  id,
  carImage,
  name,
  carType,
  tankCapacity,
  gearbox,
  seats,
  price,
  isLoggedIn,
  isInFavourites,
}: Props) => {
  const formattedPrice = formatPriceToUSD(price);

  return (
    <Card className="border-none transition-opacity has-[[data-pending]]:opacity-60 has-[[data-pending]]:pointer-events-none">
      <CardHeader>
        <CardTitle className="text-secondary-500 font-semibold text-base lg:font-bold lg:text-xl">
          {name}
        </CardTitle>
        <CardDescription className="text-secondary-300 font-medium text-sm">
          {carType}
        </CardDescription>
        <CardAction>
          <FavouriteButton
            carId={id}
            isLoggedIn={isLoggedIn}
            isInFavourites={isInFavourites}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="relative w-full aspect-video overflow-hidden rounded-lg">
          <Image
            src={carImage}
            alt={`${name} image`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-wrap justify-between gap-2 text-xs font-medium *:flex *:gap-1 *:items-center *:text-secondary-300 xl:text-sm xl:*:gap-2">
          <p>
            <span>
              <Fuel />
            </span>
            {tankCapacity}L
          </p>
          <p>
            <span>
              <LifeBuoy />
            </span>
            {toTitleCase(gearbox)}
          </p>
          <p>
            <span>
              <User />
            </span>
            {seats} People
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <p className="text-secondary-500 font-bold whitespace-nowrap">
          {formattedPrice}/
          <span className="text-xs text-secondary-300">day</span>
        </p>
        <Button size={"lg"} className="text-base shrink-0" asChild>
          <Link href={`cars/${id}`}>Rent Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CarCard;
