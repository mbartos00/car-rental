import { cn, formatPriceToUSD, toTitleCase } from "@/lib/utils";
import { CarType } from "@/types";
import { Fuel, Heart, LifeBuoy, User } from "lucide-react";
import Image from "next/image";
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

type Props = {
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
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="text-secondary-500 font-semibold text-base lg:font-bold lg:text-xl">
          {name}
        </CardTitle>
        <CardDescription className="text-secondary-300 font-medium text-sm">
          {carType}
        </CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 hover:bg-transparent group"
            disabled={!isLoggedIn}
          >
            <Heart
              className={cn(
                "size-6 stroke-secondary-300 transition-all group-hover:fill-red-500 group-hover:stroke-0",
                isInFavourites && "fill-red-500 stroke-0",
                !isLoggedIn && "stroke-secondary-200 fill-secondary-200"
              )}
            />
          </Button>
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
        <Button size={"lg"} className="text-base ">
          Rent Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CarCard;
