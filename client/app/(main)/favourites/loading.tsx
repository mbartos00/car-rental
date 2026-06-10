import CarCardSkeleton from "@/components/CarCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const CARDS_COUNT = 4;

export default function Loading() {
  return (
    <section className="py-8 px-6 lg:px-16 opacity-0 [animation:skeleton-appear_0.2s_ease_0.25s_forwards]">
      <div className="flex w-full justify-between mb-5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 xl:gap-8 items-start">
        {Array.from({ length: CARDS_COUNT }, (_, index) => (
          <CarCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
