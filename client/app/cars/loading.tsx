import CarCardSkeleton from "@/components/CarCardSkeleton";
import CarFiltersSkeleton from "@/components/CarFiltersSkeleton";

const CARDS_COUNT = 9;

export default function Loading() {
  return (
    <section className="py-8 px-6 xl:grid xl:grid-cols-10 xl:px-0 xl:py-0">
      <div className="hidden xl:block xl:col-span-3 2xl:col-span-2 bg-primary-0 xl:p-8">
        <CarFiltersSkeleton />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-8 xl:col-span-7 2xl:col-span-8 xl:px-6 xl:pt-6 items-start">
        {Array.from({ length: CARDS_COUNT }, (_, index) => (
          <CarCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
