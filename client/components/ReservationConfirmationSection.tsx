"use client";
import { ReservationFormValues } from "@/schemas/reservationSchema";
import { ShieldCheck } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { Button } from "./ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

type Props = {
  submitting: boolean;
};

type ConsentFieldProps = {
  name: "marketingConsent" | "terms";
  id: string;
  label: string;
};

const ConsentField = ({ name, id, label }: ConsentFieldProps) => {
  const { control } = useFormContext<ReservationFormValues>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-md bg-primary-100/25 border border-secondary-200/40 p-4">
            <Checkbox
              id={id}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <Label
              htmlFor={id}
              className="text-sm font-medium text-secondary-500"
            >
              {label}
            </Label>
          </div>
          {fieldState.error && (
            <p aria-live="polite" className="text-red-500 text-sm">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
};

const ReservationConfirmationSection = ({ submitting }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-secondary-500 font-bold text-xl">
          Confirmation
        </CardTitle>
        <CardDescription className="text-secondary-300 text-sm">
          We are getting to the end. Just a few clicks and your rental is
          ready!
        </CardDescription>
        <CardAction className="text-sm font-medium text-secondary-300">
          Step 4 of 4
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ConsentField
          name="marketingConsent"
          id="marketing-consent"
          label="I agree with sending marketing and newsletter emails. No spam, promised!"
        />
        <ConsentField
          name="terms"
          id="terms-consent"
          label="I agree with our terms and conditions and privacy policy."
        />
        <Button
          type="submit"
          size="lg"
          className="w-fit text-base"
          disabled={submitting}
        >
          {submitting ? "Processing..." : "Rent Now"}
        </Button>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1">
        <ShieldCheck className="size-6 text-secondary-500" />
        <p className="text-sm font-semibold text-secondary-500">
          All your data are safe
        </p>
        <p className="text-xs text-secondary-300">
          We are using the most advanced security to provide you the best
          experience ever.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ReservationConfirmationSection;
