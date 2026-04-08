import { getFavourites, getPopularCars } from "@/api/api";
import { getSession } from "@/api/session";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import Link from "next/link";
import CarCard from "./CarCard";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

type Props = {
  wrapperClassName?: string;
  excludeId?: string;
};

const PopularCars = async ({ wrapperClassName, excludeId }: Props) => {
  const [cars, session] = await Promise.all([getPopularCars(9), getSession()]);
  const favourites = session ? await getFavourites() : null;
  const favouriteIds = new Set(favourites?.map((car) => car.id));

  const visibleCars = cars.filter((car) => car.id !== excludeId).slice(0, 8);

  if (visibleCars.length === 0) return null;

  return (
    <section className={cn("py-8 px-4 lg:p-16", wrapperClassName)}>
      <div className="flex w-full justify-between mb-5 pr-6">
        <h3 className="text-sm lg:text-base font-semibold text-secondary-300">
          Popular Cars
        </h3>
        <Link
          href={ROUTES.CARS}
          className="text-sm lg:text-base text-primary-500 font-semibold"
        >
          View All
        </Link>
      </div>
      <Carousel className="w-full" autoplay={true} autoplayInterval={4000}>
        <CarouselContent className="-ml-6 py-2">
          {visibleCars.map((car) => (
            <CarouselItem
              key={car.id}
              className="pl-6 basis-8/10 sm:basis-6/10 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
            >
              <CarCard
                id={car.id}
                carImage={car.images[0]}
                gearbox={car.gearbox}
                price={car.price}
                seats={car.seats}
                name={car.name}
                tankCapacity={car.tankCapacity}
                carType={car.carType}
                isLoggedIn={!!session}
                isInFavourites={favouriteIds.has(car.id)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default PopularCars;
