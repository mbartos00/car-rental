"use client";
import { CardElement } from "@stripe/react-stripe-js";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

type Props = {
  cardError: string | null;
  onCardChange: () => void;
};

const ReservationPaymentSection = ({ cardError, onCardChange }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-secondary-500 font-bold text-xl">
          Payment Method
        </CardTitle>
        <CardDescription className="text-secondary-300 text-sm">
          Please enter your payment method
        </CardDescription>
        <CardAction className="text-sm font-medium text-secondary-300">
          Step 3 of 4
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="font-semibold text-secondary-500">Credit Card</p>
        <div className="rounded-md bg-primary-100/25 border border-secondary-200/40 p-4">
          <CardElement
            options={{ hidePostalCode: true }}
            onChange={onCardChange}
          />
        </div>
        {cardError && (
          <p aria-live="polite" className="text-red-500 text-sm">
            {cardError}
          </p>
        )}
        <p className="text-xs text-secondary-300">
          Test mode – use card 4242 4242 4242 4242 with any future expiry and
          CVC.
        </p>
      </CardContent>
    </Card>
  );
};

export default ReservationPaymentSection;
