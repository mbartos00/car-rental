import { getCar, getMyReservations } from "@/api/api";
import { getSession } from "@/api/session";
import CarDescription from "@/components/CarDescription";
import CarDetailsCarousel from "@/components/CarDetailsCarousel";
import CarReviews from "@/components/CarReviews";
import PopularCars from "@/components/PopularCars";

export default async function Car({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [car, session] = await Promise.all([getCar(id), getSession()]);

  const reservations = session ? await getMyReservations() : null;
  const canReview = !!reservations?.some(
    (reservation) =>
      reservation.car.id === id &&
      reservation.status === "CONFIRMED" &&
      new Date(reservation.endDate) < new Date()
  );

  return (
    <section className="flex flex-col gap-8 py-8 px-6 2xl:w-4/5 2xl:mx-auto">
      <div className="flex flex-col gap-8 md:flex-row md:max-w-[1280px] md:mx-auto ">
        <CarDetailsCarousel images={car.images} />
        <CarDescription
          id={car.id}
          carType={car.carType}
          description={car.description}
          gearbox={car.gearbox}
          price={car.price}
          name={car.name}
          tankCapacity={car.tankCapacity}
          seats={car.seats}
          reviewCount={car.reviewCount}
          averageReview={car.averageReview}
        />
      </div>
      <CarReviews
        reviews={car.reviews}
        reviewCount={car.reviewCount}
        carId={car.id}
        sessionUserId={session?.id}
        canReview={canReview}
      />
      <PopularCars wrapperClassName="lg:px-0" excludeId={car.id} />
    </section>
  );
}
