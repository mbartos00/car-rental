"use client";
import { validatePromoCodeAction } from "@/api/actions";
import useToastContext from "@/hooks/useToastContext";
import {
  calculateRentalDays,
  combineDateTime,
  formatPriceToUSD,
} from "@/lib/utils";
import { ReservationFormValues } from "@/schemas/reservationSchema";
import { AppliedPromo, Car } from "@/types";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import RatingStars from "./RatingStars";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";

type Props = {
  car: Car;
  promo: AppliedPromo | null;
  onApplyPromo: (promo: AppliedPromo | null) => void;
};

const ReservationSummary = ({ car, promo, onApplyPromo }: Props) => {
  const { control } = useFormContext<ReservationFormValues>();
  const { handleToast } = useToastContext();
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();

  const [pickupDate, pickupTime, dropoffDate, dropoffTime] = useWatch({
    control,
    name: ["pickupDate", "pickupTime", "dropoffDate", "dropoffTime"],
  });

  const hasDates = pickupDate && pickupTime && dropoffDate && dropoffTime;
  const days = hasDates
    ? calculateRentalDays(
        combineDateTime(pickupDate, pickupTime),
        combineDateTime(dropoffDate, dropoffTime)
      )
    : 1;
  const subtotal = Math.round(days * car.price * 100) / 100;
  const totalPrice = promo
    ? Math.round(subtotal * (1 - promo.discountPercent / 100) * 100) / 100
    : subtotal;

  const handleApply = () => {
    if (!code.trim()) return;

    startTransition(async () => {
      const result = await validatePromoCodeAction(code.trim());

      if (!result.valid) {
        onApplyPromo(null);
        handleToast(false, undefined, "Invalid promo code");
        return;
      }

      onApplyPromo({
        code: code.trim().toUpperCase(),
        discountPercent: result.discountPercent,
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-secondary-500 font-bold text-xl">
          Rental Summary
        </CardTitle>
        <p className="text-secondary-300 text-sm">
          Prices may change depending on the length of the rental and the
          price of your rental car.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0">
            <Image
              src={car.images[0]}
              alt={`${car.name} image`}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-secondary-500 font-bold text-xl">{car.name}</p>
            <div className="flex items-center gap-2">
              <RatingStars rating={car.averageReview || 0} />
              <p className="text-xs font-medium text-secondary-300">
                {car.reviewCount === 0 || car.reviewCount === undefined
                  ? "No reviews"
                  : `${car.reviewCount} ${car.reviewCount <= 1 ? "Review" : "Reviews"}`}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <p className="text-secondary-300 font-medium text-sm">
              {`Subtotal (${days} ${days === 1 ? "day" : "days"})`}
            </p>
            <p className="text-secondary-500 font-semibold">
              {formatPriceToUSD(subtotal)}
            </p>
          </div>
          {promo && (
            <div className="flex justify-between">
              <p className="text-secondary-300 font-medium text-sm">
                {`Discount (${promo.code} -${promo.discountPercent}%)`}
              </p>
              <p className="text-secondary-500 font-semibold">
                -{formatPriceToUSD(subtotal - totalPrice)}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Apply promo code"
            className="border-secondary-200/40 bg-primary-100/25 placeholder:text-sm placeholder:text-secondary-400"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={handleApply}
            disabled={pending}
            className="font-semibold"
          >
            Apply now
          </Button>
        </div>

        <div className="flex justify-between items-center gap-4">
          <div>
            <p className="text-secondary-500 font-bold text-xl">
              Total Rental Price
            </p>
            <p className="text-xs text-secondary-300">
              Overall price and includes rental discount
            </p>
          </div>
          <p className="text-secondary-500 font-bold text-2xl lg:text-3xl">
            {formatPriceToUSD(totalPrice)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationSummary;
