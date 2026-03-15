import { Heart, Image as ImageIcon } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "./ui/card";
import { Skeleton } from "./ui/skeleton";

const CarCardSkeleton = () => {
  return (
    <Card className="border-none">
      <CardHeader>
        <Skeleton className="h-4 w-28 bg-primary-100" />
        <Skeleton className="h-3 w-20" />
        <CardAction>
          <Heart className="size-6 fill-red-500 stroke-0" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="w-full aspect-video rounded-lg flex items-center justify-center">
          <ImageIcon className="size-10 text-primary-100 animate-pulse" />
        </div>
        <div className="flex justify-between gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-primary-100" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-10 w-28 bg-primary-500 animate-pulse" />
      </CardFooter>
    </Card>
  );
};

export default CarCardSkeleton;
