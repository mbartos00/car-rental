"use client";

import { createLocationAction, updateLocationAction } from "@/api/adminActions";
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
import useToastContext from "@/hooks/useToastContext";
import { locationFormSchema, LocationFormValues } from "@/schemas/adminSchemas";
import { Location } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

const LocationFormDialog = ({
  location,
  trigger,
}: {
  location?: Location;
  trigger: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const { handleToast } = useToastContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: { name: location?.name ?? "" },
  });

  const onSubmit = async (values: LocationFormValues) => {
    const result = location
      ? await updateLocationAction(location.id, values.name)
      : await createLocationAction(values.name);

    handleToast(result.success, undefined, result.message);
    if (result.success) setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset({ name: location?.name ?? "" });
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {location ? "Edit location" : "Add location"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <RhfFieldInput
            label="Name"
            id="location-name"
            error={errors.name?.message}
            {...register("name")}
          />
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : location ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LocationFormDialog;
