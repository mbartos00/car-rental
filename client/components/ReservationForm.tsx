"use client";
import {
  createPaymentIntentAction,
  finalizeReservationAction,
} from "@/api/actions";
import { ROUTES } from "@/constants/routes";
import useToastContext from "@/hooks/useToastContext";
import { combineDateTime } from "@/lib/utils";
import {
  ReservationFormValues,
  reservationSchema,
} from "@/schemas/reservationSchema";
import { AppliedPromo, BookedRange, Car, Location } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ReservationBillingSection from "./ReservationBillingSection";
import ReservationConfirmationSection from "./ReservationConfirmationSection";
import ReservationPaymentSection from "./ReservationPaymentSection";
import ReservationRentalSection from "./ReservationRentalSection";
import ReservationSummary from "./ReservationSummary";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type Props = {
  car: Car;
  locations: Location[];
  bookedRanges: BookedRange[];
};

const ReservationFormInner = ({ car, locations, bookedRanges }: Props) => {
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      billingInfo: { name: "", phoneNumber: "", address: "", city: "" },
      pickupLocationId: "",
      pickupTime: "",
      dropoffLocationId: "",
      dropoffTime: "",
      marketingConsent: false,
      terms: false,
    },
  });

  const { handleToast } = useToastContext();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

  const onSubmit = async (values: ReservationFormValues) => {
    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);

    if (!card) {
      setCardError("Payment form is not ready");
      return;
    }

    const base = {
      carId: car.id,
      startDate: combineDateTime(
        values.pickupDate,
        values.pickupTime
      ).toISOString(),
      endDate: combineDateTime(
        values.dropoffDate,
        values.dropoffTime
      ).toISOString(),
      pickupLocationId: values.pickupLocationId,
      dropoffLocationId: values.dropoffLocationId,
      promoCode: promo?.code,
    };

    const intent = await createPaymentIntentAction(base);

    if (!intent.success) {
      handleToast(false, intent.error);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      intent.clientSecret,
      {
        payment_method: {
          card,
          billing_details: {
            name: values.billingInfo.name,
            phone: values.billingInfo.phoneNumber,
            address: {
              line1: values.billingInfo.address,
              city: values.billingInfo.city,
            },
          },
        },
      }
    );

    if (error || paymentIntent?.status !== "succeeded") {
      setCardError(error?.message ?? "Payment failed");
      handleToast(false, undefined, error?.message ?? "Payment failed");
      return;
    }

    const result = await finalizeReservationAction({
      ...base,
      paymentIntentId: paymentIntent.id,
      billingInfo: values.billingInfo,
      marketingConsent: values.marketingConsent,
    });

    if (!result.success) {
      handleToast(false, undefined, result.message);
      return;
    }

    handleToast(true, undefined, result.message);
    router.push(ROUTES.USER);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-6 items-start lg:grid-cols-[1fr_minmax(340px,420px)]"
      >
        <div className="flex flex-col gap-6 lg:order-1">
          <ReservationBillingSection />
          <ReservationRentalSection
            locations={locations}
            bookedRanges={bookedRanges}
          />
          <ReservationPaymentSection
            cardError={cardError}
            onCardChange={() => setCardError(null)}
          />
          <ReservationConfirmationSection
            submitting={form.formState.isSubmitting}
          />
        </div>
        <div className="lg:order-2">
          <ReservationSummary
            car={car}
            promo={promo}
            onApplyPromo={setPromo}
          />
        </div>
      </form>
    </FormProvider>
  );
};

const ReservationForm = (props: Props) => {
  return (
    <Elements stripe={stripePromise}>
      <ReservationFormInner {...props} />
    </Elements>
  );
};

export default ReservationForm;
