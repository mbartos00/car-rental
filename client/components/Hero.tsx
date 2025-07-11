import heroBg from "@/public/HeroBg.png";
import heroBg2 from "@/public/HeroBg2.png";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="px-4 py-6 lg:px-16 lg:py-8 w-full">
      <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8 max-w-[1600px] ">
        <div className="relative bg-info-500 rounded-2xl p-4 lg:p-6 overflow-hidden aspect-[3/2]">
          <div className="relative z-10 text-primary-0 space-y-4 xl:space-y-8">
            <h2 className="text-primary-0 font-semibold text-base md:text-xl lg:text-3xl lg:max-w-[12ch]">
              The Best Platform for Car Rental
            </h2>
            <p className="text-primary-0 font-medium text-xs md:text-sm lg:text-base max-w-[25ch]">
              Ease of doing a car rental safely and reliably. Of course at a low
              price.
            </p>
            <Button size="lg" asChild className="rounded-sm lg:px-8 lg:py-6">
              <Link href="/cars">Rent Car</Link>
            </Button>
          </div>
          <Image
            src={heroBg}
            alt="White car"
            fill
            className="absolute object-cover z-0 bottom-0 right-0"
          />
        </div>

        <div className="relative bg-blue-600 rounded-2xl p-4 lg:p-6 overflow-hidden aspect-[3/2]">
          <div className="relative z-10 text-primary space-y-4 xl:space-y-8">
            <h2 className="text-primary-0 font-semibold text-base md:text-xl lg:text-3xl lg:max-w-[12ch]">
              Easy way to rent a car at a low price
            </h2>
            <p className="text-primary-0 font-medium text-xs md:text-sm lg:text-base max-w-[25ch]">
              Providing cheap car rental services and safe and comfortable
              facilities.
            </p>
            <Button
              size="lg"
              asChild
              className="rounded-sm bg-info-500 lg:px-8 lg:py-6"
            >
              <Link href="/cars">Rent Car</Link>
            </Button>
          </div>
          <Image
            src={heroBg2}
            alt="Gray car"
            fill
            className="absolute object-cover z-0 bottom-0 right-0"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
