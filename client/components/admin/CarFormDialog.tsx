"use client";

import { createCarAction, updateCarAction } from "@/api/adminActions";
import RhfFieldInput from "@/components/RhfFieldInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useToastContext from "@/hooks/useToastContext";
import { carFormSchema, CarFormValues } from "@/schemas/adminSchemas";
import { Car } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";

const CAR_TYPES = ["SEDAN", "SUV", "CONVERTIBLE", "COUPE", "HATCHBACK"];
const GEARBOXES = ["MANUAL", "AUTOMATIC"];

const toDefaults = (car?: Car): CarFormValues => ({
  name: car?.name ?? "",
  description: car?.description ?? "",
  price: car?.price ?? 0,
  carType: (car?.carType as CarFormValues["carType"]) ?? "SEDAN",
  gearbox: (car?.gearbox as CarFormValues["gearbox"]) ?? "AUTOMATIC",
  seats: car?.seats ?? 4,
  tankCapacity: car?.tankCapacity ?? 40,
  images: car?.images.length
    ? car.images.map((url) => ({ url }))
    : [{ url: "" }, { url: "" }, { url: "" }],
});

const CarFormDialog = ({
  car,
  trigger,
}: {
  car?: Car;
  trigger: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const { handleToast } = useToastContext();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: toDefaults(car),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "images" });
  const images = useWatch({ control, name: "images" });

  const onSubmit = async (values: CarFormValues) => {
    const payload = { ...values, images: values.images.map((i) => i.url) };
    const result = car
      ? await updateCarAction(car.id, payload)
      : await createCarAction(payload);

    handleToast(result.success, undefined, result.message);
    if (result.success) setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset(toDefaults(car));
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{car ? "Edit car" : "Add car"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <RhfFieldInput
            label="Name"
            id="car-name"
            error={errors.name?.message}
            {...register("name")}
          />

          <div className="space-y-2">
            <Label htmlFor="car-description">Description</Label>
            <Textarea
              id="car-description"
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <RhfFieldInput
              label="Price per day ($)"
              id="car-price"
              type="number"
              step="0.01"
              error={errors.price?.message}
              {...register("price")}
            />
            <RhfFieldInput
              label="Seats"
              id="car-seats"
              type="number"
              error={errors.seats?.message}
              {...register("seats")}
            />
            <RhfFieldInput
              label="Tank capacity (L)"
              id="car-tank"
              type="number"
              error={errors.tankCapacity?.message}
              {...register("tankCapacity")}
            />

            <div className="space-y-2">
              <Label>Car type</Label>
              <Controller
                control={control}
                name="carType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAR_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Gearbox</Label>
              <Controller
                control={control}
                name="gearbox"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GEARBOXES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Image URLs (min 3)</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => append({ url: "" })}
              >
                <Plus className="size-4" /> Add
              </Button>
            </div>
            {typeof errors.images?.message === "string" && (
              <p className="text-red-500 text-sm">{errors.images.message}</p>
            )}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3">
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-primary-100/40">
                    {images?.[index]?.url ? (
                      <Image
                        src={images[index].url}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <RhfFieldInput
                      label=""
                      id={`car-image-${index}`}
                      placeholder="https://images.unsplash.com/..."
                      error={errors.images?.[index]?.url?.message}
                      {...register(`images.${index}.url`)}
                    />
                  </div>
                  {fields.length > 3 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(index)}
                      className="text-red-500"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : car ? "Save changes" : "Create car"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CarFormDialog;
