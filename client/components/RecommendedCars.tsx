import { cars } from "@/public/data";
import React from "react";
import CarCard from "./CarCard";
import { Button } from "./ui/button";
import Link from "next/link";

const RecommendedCars = () => {
  return (
    <section className="px-4 lg:px-16">
      <h3 className="text-sm lg:text-base font-semibold text-secondary-300 mb-5">
        Recommended Cars
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
        {cars.map((car) => (
          <CarCard
            carImage={car.images[0]}
            gearbox={car.gearbox}
            price={car.price}
            seats={car.seats}
            name={car.name}
            tankCapacity={car.tankCapacity}
            carType={car.carType}
            key={car.id}
            isLoggedIn={false}
            isInFavourites={false}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 py-16 items-end">
        <Button
          asChild
          size="lg"
          className="w-fit rounded-sm col-start-2 justify-self-center"
        >
          <Link href={"/cars"}>Show more cars</Link>
        </Button>
        <p className="h-fit text-sm lg:text-base font-semibold text-secondary-300 col-start-3 justify-self-end ">
          {cars.length === 1 ? `${cars.length} car` : `${cars.length} cars`}
        </p>
      </div>
    </section>
  );
};

export default RecommendedCars;
