import { getBookedRanges, getCar, getLocations } from "@/api/api";
import ReservationForm from "@/components/ReservationForm";

export default async function Reservation({
  params,
}: {
  params: Promise<{ carId: string }>;
}) {
  const { carId } = await params;

  const [car, locations, bookedRanges] = await Promise.all([
    getCar(carId),
    getLocations(),
    getBookedRanges(carId),
  ]);

  return (
    <section className="py-8 px-6 lg:px-16 2xl:w-4/5 2xl:mx-auto">
      <ReservationForm
        car={car}
        locations={locations}
        bookedRanges={bookedRanges}
      />
    </section>
  );
}
