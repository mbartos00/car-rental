import { cars } from "@/public/data"; //TODO: Replace with logic
import Link from "next/link";
import CarCard from "./CarCard";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

const PopularCars = () => {
  return (
    <section className="py-8 px-4 lg:p-16">
      <div className="flex w-full justify-between mb-5 pr-6">
        <h3 className="text-sm lg:text-base font-semibold text-secondary-300">
          Popular Cars
        </h3>
        <Link
          href={"/cars"}
          className="text-sm lg:text-base text-primary-500 font-semibold"
        >
          View All
        </Link>
      </div>
      <Carousel className="w-full" autoplay={true} autoplayInterval={4000}>
        <CarouselContent className="-ml-6">
          {cars.map(
            (
              car, //TODO: Replace with logic
              index
            ) => (
              <CarouselItem
                key={index}
                className="pl-6 basis-8/10 sm:basis-6/10 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
              >
                <CarCard
                  carImage={car.images[0]}
                  gearbox={car.gearbox}
                  price={car.price}
                  seats={car.seats}
                  title={car.name}
                  tankCapacity={car.tankCapacity}
                  type={car.carType}
                  key={car.id}
                  isLoggedIn={false}
                  isInFavourites={false}
                />
              </CarouselItem>
            )
          )}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default PopularCars;
