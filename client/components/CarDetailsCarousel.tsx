"use client";
import { cn } from "@/lib/utils";
import Fade from "embla-carousel-fade";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel";

const CarDetailsCarousel = ({ images }: { images: string[] }) => {
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbnailApi, setThumbnailApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const mainImage = useMemo(
    () =>
      images.map((image, index) => (
        <CarouselItem key={index} className="relative aspect-square w-full">
          <Image
            src={image}
            alt={`Carousel Main Image ${index + 1}`}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-2xl"
          />
        </CarouselItem>
      )),
    [images]
  );

  const handleClick = useCallback(
    (index: number) => {
      if (!mainApi || !thumbnailApi) {
        return;
      }

      thumbnailApi.scrollTo(index);
      mainApi.scrollTo(index);
      setCurrent(index);
    },
    [mainApi, thumbnailApi]
  );

  const thumbnailImages = useMemo(
    () =>
      images.map((image, index) => (
        <CarouselItem
          key={index}
          className="pl-0 relative aspect-square sm:h-[120px] md:h-[100px] md:max-w-[100px] lg:max-w-[140px] 2xl:max-w-[160px] w-full basis-1/4 md:basis-1/3"
        >
          <Image
            onClick={() => handleClick(index)}
            className={`rounded-2xl ${cn(
              index === current ? "ring-2 ring-offset-2 ring-primary-500" : ""
            )}`}
            src={image}
            fill
            alt={`Carousel Thumbnail Image ${index + 1}`}
            style={{ objectFit: "cover" }}
          />
        </CarouselItem>
      )),
    [images, current, handleClick]
  );

  useEffect(() => {
    if (!mainApi || !thumbnailApi) {
      return;
    }

    const handleTopSelect = () => {
      const selected = mainApi.selectedScrollSnap();
      setCurrent(selected);
      thumbnailApi.scrollTo(selected);
    };

    const handleBottomSelect = () => {
      const selected = thumbnailApi.selectedScrollSnap();
      setCurrent(selected);
      mainApi.scrollTo(selected);
    };

    mainApi.on("select", handleTopSelect);
    thumbnailApi.on("select", handleBottomSelect);

    return () => {
      mainApi.off("select", handleTopSelect);
      thumbnailApi.off("select", handleBottomSelect);
    };
  }, [mainApi, thumbnailApi]);

  return (
    <div className="w-full space-y-4 md:w-2/3">
      <Carousel setApi={setMainApi} className="w-full" plugins={[Fade()]}>
        <CarouselContent className="-ml-0">{mainImage}</CarouselContent>
      </Carousel>
      <Carousel opts={{ active: false }} setApi={setThumbnailApi}>
        <CarouselContent className="ml-0 gap-8 p-2 justify-center sm:justify-between md:gap-2">
          {thumbnailImages}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default CarDetailsCarousel;
