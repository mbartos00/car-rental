import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SectionSkeleton = ({ rows }: { rows: number }) => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-32 bg-primary-100" />
      <Skeleton className="h-3 w-48" />
    </CardHeader>
    <CardContent className="grid gap-6 sm:grid-cols-2">
      {Array.from({ length: rows }, (_, index) => (
        <div className="space-y-2" key={index}>
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-11 w-full" />
        </div>
      ))}
    </CardContent>
  </Card>
);

export default function Loading() {
  return (
    <section className="py-8 px-6 lg:px-16 2xl:w-4/5 2xl:mx-auto opacity-0 [animation:skeleton-appear_0.2s_ease_0.25s_forwards]">
      <div className="grid gap-6 items-start lg:grid-cols-[1fr_minmax(340px,420px)]">
        <div className="flex flex-col gap-6 lg:order-1">
          <SectionSkeleton rows={4} />
          <SectionSkeleton rows={6} />
          <SectionSkeleton rows={2} />
        </div>
        <Card className="lg:order-2">
          <CardHeader>
            <Skeleton className="h-5 w-36 bg-primary-100" />
            <Skeleton className="h-3 w-full" />
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-24 h-16 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 bg-primary-100" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-11 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-36 bg-primary-100" />
              <Skeleton className="h-7 w-24 bg-primary-100" />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
