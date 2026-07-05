"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn, formatPriceToUSD, toTitleCase } from "@/lib/utils";
import { CarFilters as CarFiltersType } from "@/types";
import { CalendarIcon, ListFilterPlus } from "lucide-react";
import Form from "next/form";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useState } from "react";
import { DateRange } from "react-day-picker";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const toISODate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const formatRangeLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

type Props = {
  filters: CarFiltersType;
  className?: string;
};

const NumberInput = (props: React.ComponentProps<typeof Input>) => (
  <Input
    type="number"
    onWheel={(event) => event.currentTarget.blur()}
    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    {...props}
  />
);

const FilterSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-widest text-secondary-300 mb-6">
      {title}
    </p>
    {children}
  </div>
);

const FilterOption = ({
  id,
  value,
  label,
  count,
}: {
  id: string;
  value: string;
  label: string;
  count: number;
}) => (
  <div className="flex items-center gap-3">
    <RadioGroupItem value={value} id={id} />
    <Label
      htmlFor={id}
      className="text-base lg:text-lg font-semibold text-secondary-400"
    >
      {label}
      <span className="text-secondary-300 ml-1 font-medium">({count})</span>
    </Label>
  </div>
);

const AvailabilityFilter = () => {
  const searchParams = useSearchParams();

  const initialFrom = searchParams.get("available_from");
  const initialTo = searchParams.get("available_to");

  const [range, setRange] = useState<DateRange | undefined>(
    initialFrom && initialTo
      ? { from: new Date(initialFrom), to: new Date(initialTo) }
      : undefined
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasRange = !!(range?.from && range?.to);

  return (
    <FilterSection title="Availability">
      {hasRange && (
        <>
          <input
            type="hidden"
            name="available_from"
            value={toISODate(range!.from!)}
          />
          <input
            type="hidden"
            name="available_to"
            value={toISODate(range!.to!)}
          />
        </>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start font-medium text-secondary-400"
          >
            <CalendarIcon className="size-4 text-secondary-300" />
            {hasRange
              ? `${formatRangeLabel(range!.from!)} – ${formatRangeLabel(range!.to!)}`
              : "Any dates"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            disabled={{ before: today }}
            numberOfMonths={1}
          />
          {hasRange && (
            <div className="border-t p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-secondary-400"
                onClick={() => setRange(undefined)}
              >
                Clear dates
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </FilterSection>
  );
};

const CarFilterForm = ({ filters }: { filters: CarFiltersType }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentType = searchParams.get("car_type") || undefined;
  const currentSeats = searchParams.get("seats") || undefined;
  const currentGearbox = searchParams.get("gearbox") || undefined;
  const currentTankCapacityMin = searchParams.get("min_tank_capacity") || "";
  const currentTankCapacityMax = searchParams.get("max_tank_capacity") || "";
  const currentMinPrice = searchParams.get("min_price") || "";
  const currentMaxPrice = searchParams.get("max_price") || "";

  const formKey = searchParams.toString();

  const action = async (formData: FormData) => {
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (!value) continue;

      params.set(key, value.toString());
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    router.replace(pathname);
  };

  return (
    <Form
      key={formKey}
      action={action}
      onReset={resetFilters}
      className="flex flex-col gap-12"
    >
      <AvailabilityFilter />

      <FilterSection title="Type">
        <RadioGroup
          defaultValue={currentType}
          name="car_type"
          className="gap-5"
        >
          {filters.carType.map(({ carType, _count }) => (
            <FilterOption
              key={carType}
              id={carType}
              value={carType}
              label={toTitleCase(carType)}
              count={_count}
            />
          ))}
        </RadioGroup>
      </FilterSection>

      <FilterSection title="Capacity">
        <RadioGroup defaultValue={currentSeats} name="seats" className="gap-5">
          {filters.seats.map(({ seats, _count }) => (
            <FilterOption
              key={seats}
              id={`seats-${seats}`}
              value={String(seats)}
              label={`${seats} Person`}
              count={_count}
            />
          ))}
        </RadioGroup>
      </FilterSection>

      <FilterSection title="Gearbox">
        <RadioGroup
          defaultValue={currentGearbox}
          name="gearbox"
          className="gap-5"
        >
          {filters.gearbox.map(({ gearbox, _count }) => (
            <FilterOption
              key={gearbox}
              id={gearbox}
              value={gearbox}
              label={toTitleCase(gearbox)}
              count={_count}
            />
          ))}
        </RadioGroup>
      </FilterSection>

      <FilterSection title="Tank Capacity">
        <div className="flex gap-3">
          <div>
            <Label
              htmlFor="min_tank_capacity"
              className="text-secondary-400 mb-2"
            >
              Min.
            </Label>
            <NumberInput

              id="min_tank_capacity"
              placeholder={`${filters.tankCapacity.min}L`}
              min={filters.tankCapacity.min}
              name="min_tank_capacity"
              defaultValue={currentTankCapacityMin}
            />
          </div>

          <div>
            <Label
              htmlFor="max_tank_capacity"
              className="text-secondary-400 mb-2"
            >
              Max.
            </Label>
            <NumberInput

              id="max_tank_capacity"
              placeholder={`${filters.tankCapacity.max}L`}
              max={filters.tankCapacity.max}
              name="max_tank_capacity"
              defaultValue={currentTankCapacityMax}
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Price">
        <div className="flex gap-3">
          <div>
            <Label htmlFor="min_price" className="text-secondary-400 mb-2">
              Min. price
            </Label>
            <NumberInput

              id="min_price"
              placeholder={formatPriceToUSD(filters.price.min, 0)}
              min={filters.price.min}
              name="min_price"
              defaultValue={currentMinPrice}
            />
          </div>

          <div>
            <Label htmlFor="max_price" className="text-secondary-400 mb-2">
              Max. price
            </Label>
            <NumberInput

              id="max_price"
              placeholder={formatPriceToUSD(filters.price.max, 0)}
              max={filters.price.max}
              name="max_price"
              defaultValue={currentMaxPrice}
            />
          </div>
        </div>
      </FilterSection>

      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          Filter
        </Button>
        <Button type="reset" variant="outline" className="flex-1">
          Reset
        </Button>
      </div>
    </Form>
  );
};

const CarFilters = ({ filters, className }: Props) => {
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  if (isDesktop) {
    return (
      <div
        className={cn("lg:overflow-y-auto lg:bg-primary-0 lg:px-8", className)}
      >
        <CarFilterForm filters={filters} />
      </div>
    );
  }

  return (
    <div className="pb-4 place-self-end">
      <Drawer>
        <Button asChild>
          <DrawerTrigger>
            <ListFilterPlus aria-describedby="Filter cars" />
          </DrawerTrigger>
        </Button>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filter cars</DrawerTitle>
            <DrawerDescription className="sr-only">
              Filter cars
            </DrawerDescription>
          </DrawerHeader>
          <div className={cn("px-8 pb-8 overflow-y-scroll", className)}>
            <CarFilterForm filters={filters} />
          </div>
          <DrawerClose asChild>
            <Button variant="outline" className="mx-8 mb-8">
              Close
            </Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default CarFilters;
