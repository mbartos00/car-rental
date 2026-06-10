import { getFavourites } from "@/api/api";
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

export default async function Favourites() {
  const cars = await getFavourites();

  if (cars === null) {
    return (
      <div className="h-[60svh] w-full flex justify-center mt-20">
        <h1 className="text-secondary-500 font-bold text-3xl">
          Could not load your favourites
        </h1>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="h-[60svh] w-full flex flex-col items-center gap-6 mt-20">
        <h1 className="text-secondary-500 font-bold text-3xl">
          No favourite cars yet
        </h1>
        <Button asChild size="lg" className="w-fit rounded-sm">
          <Link href={ROUTES.CARS}>Browse cars</Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="py-8 px-6 lg:px-16">
      <div className="flex w-full justify-between mb-5">
        <h3 className="text-sm lg:text-base font-semibold text-secondary-300">
          Favourite Cars
        </h3>
        <p className="text-sm lg:text-base font-semibold text-secondary-300">
          {cars.length === 1 ? `${cars.length} car` : `${cars.length} cars`}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 xl:gap-8 items-start">
        {cars.map((car) => (
          <CarCard
            id={car.id}
            carImage={car.images[0]}
            gearbox={car.gearbox}
            price={car.price}
            seats={car.seats}
            name={car.name}
            tankCapacity={car.tankCapacity}
            carType={car.carType}
            key={car.id}
            isLoggedIn={true}
            isInFavourites={true}
          />
        ))}
      </div>
    </section>
  );
}
