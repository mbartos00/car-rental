import { getCarFilters, getCarsWithParams } from "@/api/api";
import { getSession } from "@/api/session";
import CarCard from "@/components/CarCard";
import CarFilters from "@/components/CarFilters";
import CarPagination from "@/components/CarPagination";

const DEFAULT_PAGE_SIZE = 9;

export default async function Cars({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  const filters = await getCarFilters();
  const { data: cars, pagination } = await getCarsWithParams(
    searchParams,
    DEFAULT_PAGE_SIZE
  );
  const page = parseInt(
    ((await searchParams).page as string) || String(pagination.page)
  );

  if (pagination.totalPages === 0) {
    return (
      <div className="h-[60svh] w-full flex justify-center mt-20">
        <h1 className="text-secondary-500 font-bold text-3xl">
          Cars not found
        </h1>
      </div>
    );
  }

  if (page > pagination.totalPages) {
    return (
      <div className="h-[60svh] w-full flex justify-center mt-20">
        <h1 className="text-secondary-500 font-bold text-3xl">Invalid page</h1>
      </div>
    );
  }

  return (
    <section className="py-8 px-6 xl:grid xl:grid-cols-10 xl:px-0 xl:py-0">
      <CarFilters
        filters={filters}
        className="xl:col-span-3 xl:row-span-2 2xl:col-span-2 xl:p-8"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-8 xl:col-span-7 2xl:col-span-8 xl:px-6 xl:pt-6">
        {cars.map((car) => (
          <CarCard
            id={car.id}
            carImage={car.images[0]}
            gearbox={car.gearbox}
            price={car.price}
            seats={car.seats}
            name={car.name}
            tankCapacity={car.tankCapacity}
            carType={car.carType}
            key={car.id}
            isLoggedIn={!!session}
            isInFavourites={false}
          />
        ))}
      </div>
      <div className="py-10 xl:col-start-7 2xl:col-start-6 2xl:col-span-2">
        <CarPagination
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          totalCount={pagination.totalPages}
          pageSearchParam="page"
        />
        <p className="h-fit text-sm lg:text-base font-semibold text-secondary-300 justify-self-center mt-4">
          {`${pagination.total} cars`}
        </p>
      </div>
    </section>
  );
}
