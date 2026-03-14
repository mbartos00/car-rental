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
        <div className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1/2 after:bg-gradient-to-t after:from-white after:to-transparent after:pointer-events-none after:z-10 max-w-xl mx-auto">
          <Image
            src={carImage}
            alt={`${name} image`}
            width={250}
            height={100}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium *:flex *:gap-1 *:items-center *:text-secondary-300 lg:text-sm lg:*:gap-2">
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
      <CardFooter className="justify-between gap-2 flex-wrap">
        <p className="text-secondary-500 font-bold">
          {formattedPrice}/
          <span className="text-xs text-secondary-300">day</span>
        </p>
        <Button size={"lg"} className="text-base" asChild>
          <Link href={`cars/${id}`}>Rent Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CarCard;
