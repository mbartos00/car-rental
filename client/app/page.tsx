import Hero from "@/components/Hero";
import CarsSectionSkeleton from "@/components/CarsSectionSkeleton";
import PopularCars from "@/components/PopularCars";
import RecommendedCars from "@/components/RecommendedCars";
import { Suspense } from "react";

export default function Home() {
  return (
    <div>
      <Hero />
      <Suspense fallback={<CarsSectionSkeleton />}>
        <PopularCars />
      </Suspense>
      <Suspense fallback={<CarsSectionSkeleton />}>
        <RecommendedCars />
      </Suspense>
    </div>
  );
}
