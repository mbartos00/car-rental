import { Skeleton } from "./ui/skeleton";

const FilterOptionSkeleton = () => (
  <div className="flex items-center gap-3">
    <Skeleton className="size-4 rounded-full bg-primary-100" />
    <Skeleton className="h-3.5 w-24 bg-primary-100" />
  </div>
);

const FilterSectionSkeleton = ({
  title,
  rows,
}: {
  title: string;
  rows: number;
}) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-widest text-secondary-300 mb-6">
      {title}
    </p>
    <div className="flex flex-col gap-5">
      {Array.from({ length: rows }, (_, index) => (
        <FilterOptionSkeleton key={index} />
      ))}
    </div>
  </div>
);

const FilterInputsSkeleton = ({ title }: { title: string }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-widest text-secondary-300 mb-6">
      {title}
    </p>
    <div className="flex gap-3">
      <Skeleton className="h-9 flex-1" />
      <Skeleton className="h-9 flex-1" />
    </div>
  </div>
);

const CarFiltersSkeleton = () => {
  return (
    <div className="flex flex-col gap-12">
      <FilterSectionSkeleton title="Type" rows={5} />
      <FilterSectionSkeleton title="Capacity" rows={4} />
      <FilterSectionSkeleton title="Gearbox" rows={2} />
      <FilterInputsSkeleton title="Tank Capacity" />
      <FilterInputsSkeleton title="Price" />
    </div>
  );
};

export default CarFiltersSkeleton;
