import Hero from "@/components/Hero";
import PopularCars from "@/components/PopularCars";
import RecommendedCars from "@/components/RecommendedCars";

export default function Home() {
  return (
    <div>
      <Hero />
      <PopularCars />
      <RecommendedCars />
    </div>
  );
}
