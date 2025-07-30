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
import { ListFilterPlus } from "lucide-react";
import Form from "next/form";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

type Props = {
  filters: CarFiltersType;
  className?: string;
};

const CarFilters = ({ filters, className }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isDesktop = useMediaQuery("(min-width: 1280px)");

  const currentType = searchParams.get("car_type") || undefined;
  const currentSeats = searchParams.get("seats") || undefined;
  const currentGearbox = searchParams.get("gearbox") || undefined;
  const currentMinPrice = searchParams.get("min_price") || "";
  const currentMaxPrice = searchParams.get("max_price") || "";
  const currentTankCapacityMin = searchParams.get("min_tank_capacity") || "";
  const currentTankCapacityMax = searchParams.get("max_tank_capacity") || "";

  const formKey = searchParams.toString();

  const action = async (formData: FormData) => {
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (value) {
        params.set(key, value.toString());
      }
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    router.replace(pathname);
  };

  if (isDesktop) {
    return (
      <div className={cn("lg:overflow-y-auto lg:bg-primary-0", className)}>
        <Form
          key={formKey}
          action={action}
          onReset={resetFilters}
          className="flex flex-col gap-6"
        >
          <div>
            <p className="font-semibold text-secondary-300 text-lg mb-4">
              Type
            </p>
            <RadioGroup defaultValue={currentType} name="car_type">
              {filters.carType.map(({ carType, _count }) => (
                <div
                  className="flex items-center gap-3 lg:text-xl"
                  key={carType}
                >
                  <RadioGroupItem value={carType} id={carType} />
                  <Label htmlFor={carType} className="text-secondary-400">
                    {toTitleCase(carType)}
                    <span className="text-secondary-300 ml-1">({_count})</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div>
            <p className="font-semibold text-secondary-300 text-lg mb-4">
              Seats
            </p>
            <RadioGroup defaultValue={currentSeats} name="seats">
              {filters.seats.map(({ seats, _count }) => (
                <div className="flex items-center gap-3 lg:text-xl" key={seats}>
                  <RadioGroupItem value={String(seats)} id={String(seats)} />
                  <Label htmlFor={String(seats)} className="text-secondary-400">
                    {seats} Seats
                    <span className="text-secondary-300 ml-1">({_count})</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div>
            <p className="font-semibold text-secondary-300 text-lg mb-4">
              Gearbox
            </p>
            <RadioGroup defaultValue={currentGearbox} name="gearbox">
              {filters.gearbox.map(({ gearbox, _count }) => (
                <div
                  className="flex items-center gap-3 lg:text-xl"
                  key={gearbox}
                >
                  <RadioGroupItem value={gearbox} id={gearbox} />
                  <Label htmlFor={gearbox} className="text-secondary-400">
                    {toTitleCase(gearbox)}
                    <span className="text-secondary-300 ml-1">({_count})</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="py-4">
            <p className="font-semibold text-secondary-300 text-lg mb-4">
              Tank Capacity
            </p>
            <div className="flex gap-3">
              <div>
                <Label htmlFor="min_tank_capacity">Min.</Label>
                <Input
                  type="number"
                  id="min_tank_capacity"
                  placeholder={`${filters.tankCapacity.min}L`}
                  min={filters.price.min}
                  name="min_tank_capacity"
                  defaultValue={currentTankCapacityMin}
                />
              </div>

              <div>
                <Label htmlFor="max_tank_capacity">Max.</Label>
                <Input
                  type="number"
                  id="max_tank_capacity"
                  placeholder={`${filters.tankCapacity.max}L`}
                  name="max_tank_capacity"
                  defaultValue={currentTankCapacityMax}
                />
              </div>
            </div>
          </div>
          <div className="py-4">
            <p className="font-semibold text-secondary-300 text-lg mb-4">
              Price
            </p>
            <div className="flex gap-3">
              <div>
                <Label htmlFor="min_price">Min. price</Label>
                <Input
                  type="number"
                  id="min_price"
                  placeholder={`${formatPriceToUSD(filters.price.min, 0)}`}
                  min={filters.price.min}
                  name="min_price"
                  defaultValue={currentMinPrice}
                />
              </div>

              <div>
                <Label htmlFor="max_price">Max. price</Label>
                <Input
                  type="number"
                  id="max_price"
                  placeholder={`${formatPriceToUSD(filters.price.max, 0)}`}
                  name="max_price"
                  defaultValue={currentMaxPrice}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button type="submit">Filter</Button>
            <Button type="reset">Reset filters</Button>
          </div>
        </Form>
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
            <Form
              key={formKey}
              action={action}
              onReset={resetFilters}
              className="flex flex-col gap-6"
            >
              <div>
                <p className="font-semibold text-secondary-300 text-lg mb-4">
                  Type
                </p>
                <RadioGroup defaultValue={currentType} name="type">
                  {filters.carType.map(({ carType, _count }) => (
                    <div
                      className="flex items-center gap-3 lg:text-xl"
                      key={carType}
                    >
                      <RadioGroupItem value={carType} id={carType} />
                      <Label htmlFor={carType} className="text-secondary-400">
                        {toTitleCase(carType)}
                        <span className="text-secondary-300 ml-1">
                          ({_count})
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <p className="font-semibold text-secondary-300 text-lg mb-4">
                  Seats
                </p>
                <RadioGroup defaultValue={currentSeats} name="seats">
                  {filters.seats.map(({ seats, _count }) => (
                    <div
                      className="flex items-center gap-3 lg:text-xl"
                      key={seats}
                    >
                      <RadioGroupItem
                        value={String(seats)}
                        id={String(seats)}
                      />
                      <Label
                        htmlFor={String(seats)}
                        className="text-secondary-400"
                      >
                        {seats} Seats
                        <span className="text-secondary-300 ml-1">
                          ({_count})
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <p className="font-semibold text-secondary-300 text-lg mb-4">
                  Gearbox
                </p>
                <RadioGroup defaultValue={currentGearbox} name="gearbox">
                  {filters.gearbox.map(({ gearbox, _count }) => (
                    <div
                      className="flex items-center gap-3 lg:text-xl"
                      key={gearbox}
                    >
                      <RadioGroupItem value={gearbox} id={gearbox} />
                      <Label htmlFor={gearbox} className="text-secondary-400">
                        {toTitleCase(gearbox)}
                        <span className="text-secondary-300 ml-1">
                          ({_count})
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="py-4">
                <p className="font-semibold text-secondary-300 text-lg mb-4">
                  Tank Capacity
                </p>
                <div className="flex gap-3">
                  <div>
                    <Label htmlFor="min_tank_capacity">Min.</Label>
                    <Input
                      type="number"
                      id="min_tank_capacity"
                      placeholder={`${filters.tankCapacity.min}L`}
                      min={filters.price.min}
                      name="min_tank_capacity"
                      defaultValue={currentTankCapacityMin}
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_tank_capacity">Max.</Label>
                    <Input
                      type="number"
                      id="max_tank_capacity"
                      placeholder={`${filters.tankCapacity.max}L`}
                      name="max_tank_capacity"
                      defaultValue={currentTankCapacityMax}
                    />
                  </div>
                </div>
              </div>
              <div className="py-4">
                <p className="font-semibold text-secondary-300 text-lg mb-4">
                  Price
                </p>
                <div className="flex gap-3">
                  <div>
                    <Label htmlFor="min_price">Min. price</Label>
                    <Input
                      type="number"
                      id="min_price"
                      placeholder={`${formatPriceToUSD(filters.price.min, 0)}`}
                      min={filters.price.min}
                      name="min_price"
                      defaultValue={currentMinPrice}
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_price">Max. price</Label>
                    <Input
                      type="number"
                      id="max_price"
                      placeholder={`${formatPriceToUSD(filters.price.max, 0)}`}
                      name="max_price"
                      defaultValue={currentMaxPrice}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <Button type="submit" asChild>
                  <DrawerClose>Filter</DrawerClose>
                </Button>
                <Button type="reset" asChild onClick={resetFilters}>
                  <DrawerClose>Reset filters</DrawerClose>
                </Button>
              </div>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default CarFilters;
