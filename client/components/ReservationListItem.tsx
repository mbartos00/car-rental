/* eslint-disable react-hooks/purity -- request-time cutoffs in a server component */
import { cn, formatDate, formatPriceToUSD } from "@/lib/utils";
import { Reservation } from "@/types";
import Image from "next/image";
import CancelReservationButton from "./CancelReservationButton";
import ReviewReservationButton from "./ReviewReservationButton";

const CANCELLATION_WINDOW_MS = 72 * 60 * 60 * 1000;

const ReservationListItem = ({ reservation }: { reservation: Reservation }) => {
  const isCancelled = reservation.status === "CANCELLED";
  const canCancel =
    !isCancelled &&
    new Date(reservation.startDate).getTime() - Date.now() >
      CANCELLATION_WINDOW_MS;
  const hasEnded =
    !isCancelled && new Date(reservation.endDate).getTime() < Date.now();

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-md border border-secondary-200/40 bg-primary-100/25 p-4",
        isCancelled && "opacity-60"
      )}
    >
      <div className="relative w-20 h-14 rounded-md overflow-hidden shrink-0">
        <Image
          src={reservation.car.images[0]}
          alt={`${reservation.car.name} image`}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-40">
        <p className="text-secondary-500 font-bold">{reservation.car.name}</p>
        <p className="text-sm text-secondary-300 font-medium">
          {`${formatDate(reservation.startDate)} – ${formatDate(reservation.endDate)}`}
        </p>
        <p className="text-xs text-secondary-300">
          {`${reservation.pickupLocation.name} → ${reservation.dropoffLocation.name}`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <p className="text-secondary-500 font-bold">
          {formatPriceToUSD(reservation.totalPrice)}
        </p>
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            isCancelled ? "text-red-500" : "text-primary-500"
          )}
        >
          {reservation.status}
        </span>
        {canCancel && <CancelReservationButton id={reservation.id} />}
        {hasEnded && (
          <ReviewReservationButton
            carId={reservation.car.id}
            carName={reservation.car.name}
            review={reservation.car.reviews?.[0]}
          />
        )}
      </div>
    </div>
  );
};

export default ReservationListItem;
