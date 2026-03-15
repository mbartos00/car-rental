import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ChevronDown, Heart, Image as ImageIcon, User } from "lucide-react";

const ImageFrameSkeleton = ({ className }: { className?: string }) => (
  <div
    className={`rounded-lg flex items-center justify-center bg-primary-0 ${className ?? ""}`}
  >
    <ImageIcon className="size-10 text-primary-100 animate-pulse" />
  </div>
);

const ReviewSkeleton = () => (
  <div className="flex flex-col gap-4">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full border border-secondary-100 flex items-center justify-center">
          <User className="size-5 text-primary-100 animate-pulse" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-28 bg-primary-100" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3.5 w-24 bg-primary-100" />
      </div>
    </div>
    <Skeleton className="h-16 w-full md:ml-13" />
  </div>
);

export default function Loading() {
  return (
    <section className="flex flex-col gap-8 py-8 px-6 2xl:w-4/5 2xl:mx-auto opacity-0 [animation:skeleton-appear_0.2s_ease_0.25s_forwards]">
      <div className="flex flex-col gap-8 md:flex-row md:max-w-[1280px] md:mx-auto md:w-full">
        <div className="flex flex-col gap-4 md:w-full">
          <ImageFrameSkeleton className="w-full aspect-[4/3] border-2 border-primary-500" />
          <div className="flex gap-4">
            <ImageFrameSkeleton className="flex-1 aspect-video border border-secondary-100" />
            <ImageFrameSkeleton className="flex-1 aspect-video border border-secondary-100" />
            <ImageFrameSkeleton className="flex-1 aspect-video border border-secondary-100" />
          </div>
        </div>

        <Card className="md:w-3/4">
          <CardHeader>
            <Skeleton className="h-5 w-36 bg-primary-100" />
            <Skeleton className="h-3.5 w-24 mt-2" />
            <CardAction>
              <Heart className="size-6 fill-red-500 stroke-0" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>
            <div className="grid grid-cols-2 gap-x-10 gap-y-4 my-6">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="flex justify-between gap-4" key={index}>
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-3.5 w-16 bg-primary-100" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-between gap-2 md:mt-auto">
            <div className="space-y-2">
              <Skeleton className="h-5 w-28 bg-primary-100" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-12 w-32 bg-primary-500 animate-pulse" />
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-24 bg-primary-100" />
            <Skeleton className="size-3 rounded-full bg-primary-100" />
          </div>
          <ReviewSkeleton />
          <ReviewSkeleton />
          <div className="flex items-center justify-center gap-1 text-secondary-300 font-medium text-sm">
            Show All
            <ChevronDown className="size-4" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
