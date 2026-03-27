"use client";
import { cancelReservationAction } from "@/api/actions";
import useToastContext from "@/hooks/useToastContext";
import { useTransition } from "react";
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

const CancelReservationButton = ({ id }: { id: string }) => {
  const { handleToast } = useToastContext();
  const [pending, startTransition] = useTransition();

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelReservationAction(id);

      handleToast(result.success, undefined, result.message);
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          className="text-red-500 hover:text-red-600"
        >
          {pending ? "Cancelling..." : "Cancel"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this reservation?</AlertDialogTitle>
          <AlertDialogDescription>
            Your payment will be fully refunded. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep reservation</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Cancel reservation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelReservationButton;
