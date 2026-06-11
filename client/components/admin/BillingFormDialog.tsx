"use client";

import { updateReservationBillingAction } from "@/api/adminActions";
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
import { billingFormSchema, BillingFormValues } from "@/schemas/adminSchemas";
import { AdminReservation } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

const BillingFormDialog = ({
  reservation,
  trigger,
}: {
  reservation: AdminReservation;
  trigger: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const { handleToast } = useToastContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BillingFormValues>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: reservation.billingInfo,
  });

  const onSubmit = async (values: BillingFormValues) => {
    const result = await updateReservationBillingAction(reservation.id, values);
    handleToast(result.success, undefined, result.message);
    if (result.success) setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset(reservation.billingInfo);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit billing details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <RhfFieldInput
            label="Name"
            id="billing-name"
            error={errors.name?.message}
            {...register("name")}
          />
          <RhfFieldInput
            label="Phone number"
            id="billing-phone"
            placeholder="+48123456789"
            error={errors.phoneNumber?.message}
            {...register("phoneNumber")}
          />
          <RhfFieldInput
            label="Address"
            id="billing-address"
            error={errors.address?.message}
            {...register("address")}
          />
          <RhfFieldInput
            label="Town / City"
            id="billing-city"
            error={errors.city?.message}
            {...register("city")}
          />
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save billing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BillingFormDialog;
