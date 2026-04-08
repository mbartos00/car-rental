"use client";
import { Review } from "@/types";
import { useState } from "react";
import ReviewForm from "./ReviewForm";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

type Props = {
  carId: string;
  carName: string;
  review?: Review;
};

const ReviewReservationButton = ({ carId, carName, review }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {review ? "Edit review" : "Leave a review"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {review ? "Edit your review" : "Review your rental"}
          </DialogTitle>
          <DialogDescription>{carName}</DialogDescription>
        </DialogHeader>
        <ReviewForm
          carId={carId}
          review={review}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ReviewReservationButton;
