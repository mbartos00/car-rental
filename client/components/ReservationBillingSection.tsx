"use client";
import { ReservationFormValues } from "@/schemas/reservationSchema";
import { useFormContext } from "react-hook-form";
import RhfFieldInput from "./RhfFieldInput";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

const ReservationBillingSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ReservationFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-secondary-500 font-bold text-xl">
          Billing Info
        </CardTitle>
        <CardDescription className="text-secondary-300 text-sm">
          Please enter your billing info
        </CardDescription>
        <CardAction className="text-sm font-medium text-secondary-300">
          Step 1 of 4
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <RhfFieldInput
          label="Name"
          id="billing-name"
          placeholder="Your name or company name"
          error={errors.billingInfo?.name?.message}
          {...register("billingInfo.name")}
        />
        <RhfFieldInput
          label="Phone Number"
          id="billing-phone"
          placeholder="+48123456789"
          error={errors.billingInfo?.phoneNumber?.message}
          {...register("billingInfo.phoneNumber")}
        />
        <RhfFieldInput
          label="Address"
          id="billing-address"
          placeholder="Address"
          error={errors.billingInfo?.address?.message}
          {...register("billingInfo.address")}
        />
        <RhfFieldInput
          label="Town / City"
          id="billing-city"
          placeholder="Town or city"
          error={errors.billingInfo?.city?.message}
          {...register("billingInfo.city")}
        />
      </CardContent>
    </Card>
  );
};

export default ReservationBillingSection;
