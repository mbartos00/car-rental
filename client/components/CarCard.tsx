import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Fuel, Heart, LifeBuoy, User } from "lucide-react";
import Image from "next/image";
import { cn, toTitleCase } from "@/lib/utils";

type Props = {
  carImage: string;
  title: string;
  type: string;
  price: number;
  tankCapacity: number;
  gearbox: string;
  seats: number;
  isLoggedIn: boolean;
  isInFavourites: boolean;
};

const CarCard = ({
  carImage,
  title,
  type,
  tankCapacity,
  gearbox,
  seats,
  price,
  isLoggedIn,
  isInFavourites,
}: Props) => {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price || 0);

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="text-secondary-500 font-semibold text-base lg:font-bold lg:text-xl">
          {title}
        </CardTitle>
        <CardDescription className="text-secondary-300 font-medium text-sm">
          {type}
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
      <CardContent className="flex flex-col lg:flex-row gap-5">
        <div className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1/2 after:bg-gradient-to-t after:from-white after:to-transparent after:pointer-events-none after:z-10 max-w-xl mx-auto">
          <Image src={carImage} alt={`${title} image`} />
        </div>
        <div className="flex lg:flex-col justify-center gap-4 text-xs font-medium *:flex *:items-center *:gap-1 *:text-secondary-300 lg:text-sm lg:*:gap-2">
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
      <CardFooter className="justify-between">
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
