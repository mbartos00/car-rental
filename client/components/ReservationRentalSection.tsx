"use client";
import { TIME_OPTIONS } from "@/constants/reservation";
import { cn, formatDate } from "@/lib/utils";
import { ReservationFormValues } from "@/schemas/reservationSchema";
import { BookedRange, Location } from "@/types";
import { CalendarIcon } from "lucide-react";
import { Controller, FieldPath, useFormContext } from "react-hook-form";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Props = {
  locations: Location[];
  bookedRanges: BookedRange[];
};

type PointProps = {
  title: string;
  locationField: FieldPath<ReservationFormValues>;
  dateField: "pickupDate" | "dropoffDate";
  timeField: FieldPath<ReservationFormValues>;
  locations: Location[];
  disabledDates: ({ before: Date } | { from: Date; to: Date })[];
};

const RentalPoint = ({
  title,
  locationField,
  dateField,
  timeField,
  locations,
  disabledDates,
}: PointProps) => {
  const { control } = useFormContext<ReservationFormValues>();

  return (
    <div className="flex flex-col gap-5">
      <p className="font-semibold text-secondary-500">{title}</p>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Locations</Label>
          <Controller
            control={control}
            name={locationField}
            render={({ field, fieldState }) => (
              <>
                <Select
                  value={(field.value as string) || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full bg-primary-100/25 border-secondary-200/40",
                      fieldState.error && "border-red-500"
                    )}
                  >
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <p className="text-red-500 text-sm">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Controller
            control={control}
            name={dateField}
            render={({ field, fieldState }) => (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-between font-normal bg-primary-100/25 border-secondary-200/40 text-secondary-400",
                        fieldState.error && "border-red-500"
                      )}
                    >
                      {field.value
                        ? formatDate(field.value.toISOString())
                        : "Select your date"}
                      <CalendarIcon className="size-4 text-secondary-300" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={disabledDates}
                    />
                  </PopoverContent>
                </Popover>
                {fieldState.error && (
                  <p className="text-red-500 text-sm">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Time</Label>
          <Controller
            control={control}
            name={timeField}
            render={({ field, fieldState }) => (
              <>
                <Select
                  value={(field.value as string) || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full bg-primary-100/25 border-secondary-200/40",
                      fieldState.error && "border-red-500"
                    )}
                  >
                    <SelectValue placeholder="Select your time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <p className="text-red-500 text-sm">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
};

const ReservationRentalSection = ({ locations, bookedRanges }: Props) => {
  const { watch } = useFormContext<ReservationFormValues>();
  const pickupDate = watch("pickupDate");

  const bookedMatchers = bookedRanges.map((range) => ({
    from: new Date(range.startDate),
    to: new Date(range.endDate),
  }));

  const pickupDisabled = [{ before: new Date() }, ...bookedMatchers];
  const dropoffDisabled = [
    { before: pickupDate ?? new Date() },
    ...bookedMatchers,
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-secondary-500 font-bold text-xl">
          Rental Info
        </CardTitle>
        <CardDescription className="text-secondary-300 text-sm">
          Please select your rental date
        </CardDescription>
        <CardAction className="text-sm font-medium text-secondary-300">
          Step 2 of 4
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <RentalPoint
          title="Pick – Up"
          locationField="pickupLocationId"
          dateField="pickupDate"
          timeField="pickupTime"
          locations={locations}
          disabledDates={pickupDisabled}
        />
        <RentalPoint
          title="Drop – Off"
          locationField="dropoffLocationId"
          dateField="dropoffDate"
          timeField="dropoffTime"
          locations={locations}
          disabledDates={dropoffDisabled}
        />
      </CardContent>
    </Card>
  );
};

export default ReservationRentalSection;
