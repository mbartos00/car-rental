"use client";
import { deleteReviewAction } from "@/api/actions";
import useToastContext from "@/hooks/useToastContext";
import { formatDate } from "@/lib/utils";
import { Review } from "@/types";
import { useState, useTransition } from "react";
import RatingStars from "./RatingStars";
import ReviewForm from "./ReviewForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

type Props = {
  carId: string;
  myReview?: Review;
  canReview: boolean;
};

const MyReviewSection = ({ carId, myReview, canReview }: Props) => {
  const { handleToast } = useToastContext();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!myReview && !canReview) return null;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteReviewAction(myReview!.id, carId);

      handleToast(result.success, undefined, result.message);
    });
  };

  return (
    <div className="rounded-md bg-primary-100/25 border border-secondary-200/40 p-4">
      {!myReview && (
        <>
          <p className="font-bold text-secondary-500 mb-3">Write a review</p>
          <ReviewForm carId={carId} />
        </>
      )}

      {myReview && editing && (
        <>
          <p className="font-bold text-secondary-500 mb-3">Edit your review</p>
          <ReviewForm
            carId={carId}
            review={myReview}
            onDone={() => setEditing(false)}
          />
        </>
      )}

      {myReview && !editing && (
        <>
          <div className="flex justify-between items-center">
            <p className="font-bold text-secondary-500 text-base">
              Your review
            </p>
            <div>
              <p className="text-secondary-300 font-medium text-sm">
                {formatDate(myReview.createdAt)}
              </p>
              <RatingStars rating={myReview.rating} />
            </div>
          </div>
          <p className="font-regular text-secondary-400 text-base">
            {myReview.description}
          </p>
          <Separator className="my-3 bg-secondary-300/30" />
          <div className="flex gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  className="text-red-500 hover:text-red-600"
                >
                  {pending ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your review?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep review</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete review
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  );
};

export default MyReviewSection;
