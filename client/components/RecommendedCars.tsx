import { getFavourites, getRecommendedCars } from "@/api/api";
import { getSession } from "@/api/session";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import CarCard from "./CarCard";
import { Button } from "./ui/button";

const RecommendedCars = async () => {
  const [cars, session] = await Promise.all([
    getRecommendedCars(8),
    getSession(),
  ]);
  const favourites = session ? await getFavourites() : null;
  const favouriteIds = new Set(favourites?.map((car) => car.id));

  if (cars.length === 0) return null;

  return (
    <section className="px-4 lg:px-16">
      <h3 className="text-sm lg:text-base font-semibold text-secondary-300 mb-5">
        Recommended Cars
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8 items-start">
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
            isLoggedIn={!!session}
            isInFavourites={favouriteIds.has(car.id)}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 py-16 items-end">
        <Button
          asChild
          size="lg"
          className="w-fit rounded-sm col-start-2 justify-self-center"
        >
          <Link href={ROUTES.CARS}>Show more cars</Link>
        </Button>
      </div>
    </section>
  );
};

export default RecommendedCars;
