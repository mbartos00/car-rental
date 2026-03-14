"use client";
import { ROUTES } from "@/constants/routes";
import { FAVOURITE_ADDED_EVENT } from "@/constants/events";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

const FavouritesHeartLink = () => {
  const [popped, setPopped] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onFavouriteAdded = () => {
      setPopped(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setPopped(false), 400);
    };

    window.addEventListener(FAVOURITE_ADDED_EVENT, onFavouriteAdded);

    return () => {
      window.removeEventListener(FAVOURITE_ADDED_EVENT, onFavouriteAdded);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Button variant="ghost" asChild className="size-10 group lg:mr-4">
      <Link href={ROUTES.FAVOURITES}>
        <Heart
          className={cn(
            "stroke-secondary-400 fill-secondary-400 size-6 transition-all duration-300 group-hover:fill-red-500 group-hover:stroke-red-500",
            popped && "scale-125 fill-red-500 stroke-red-500"
          )}
        />
      </Link>
    </Button>
  );
};

export default FavouritesHeartLink;
