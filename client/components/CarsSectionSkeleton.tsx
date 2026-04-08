import CarCardSkeleton from "./CarCardSkeleton";
import { Skeleton } from "./ui/skeleton";

const CarsSectionSkeleton = ({ cards = 4 }: { cards?: number }) => {
  return (
    <section className="py-8 px-4 lg:px-16 opacity-0 [animation:skeleton-appear_0.2s_ease_0.25s_forwards]">
      <Skeleton className="h-4 w-32 mb-5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8 items-start">
        {Array.from({ length: cards }, (_, index) => (
          <CarCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
};

export default CarsSectionSkeleton;
