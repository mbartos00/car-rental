"use client";

import { createPromoAction, updatePromoAction } from "@/api/adminActions";
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
import { Switch } from "@/components/ui/switch";
import useToastContext from "@/hooks/useToastContext";
import { promoFormSchema, PromoFormValues } from "@/schemas/adminSchemas";
import { PromoCode } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

const PromoFormDialog = ({
  promo,
  trigger,
}: {
  promo?: PromoCode;
  trigger: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const { handleToast } = useToastContext();

  const defaults: PromoFormValues = {
    code: promo?.code ?? "",
    discountPercent: promo?.discountPercent ?? 10,
    active: promo?.active ?? true,
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PromoFormValues>({
    resolver: zodResolver(promoFormSchema),
    defaultValues: defaults,
  });

  const onSubmit = async (values: PromoFormValues) => {
    const result = promo
      ? await updatePromoAction(promo.id, values)
      : await createPromoAction(values);

    handleToast(result.success, undefined, result.message);
    if (result.success) setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset(defaults);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {promo ? "Edit promo code" : "Add promo code"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <RhfFieldInput
            label="Code"
            id="promo-code"
            error={errors.code?.message}
            {...register("code")}
          />
          <RhfFieldInput
            label="Discount (%)"
            id="promo-discount"
            type="number"
            error={errors.discountPercent?.message}
            {...register("discountPercent")}
          />
          <div className="flex items-center justify-between">
            <Label htmlFor="promo-active">Active</Label>
            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <Switch
                  id="promo-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : promo ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PromoFormDialog;
