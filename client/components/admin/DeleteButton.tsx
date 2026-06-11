"use client";

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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import useToastContext from "@/hooks/useToastContext";
import { ActionResult } from "@/types";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

type Props = {
  onConfirm: () => Promise<ActionResult>;
  title: string;
  description: string;
  trigger?: React.ReactNode;
};

const DeleteButton = ({ onConfirm, title, description, trigger }: Props) => {
  const { handleToast } = useToastContext();
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await onConfirm();
      handleToast(result.success, undefined, result.message);
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-red-500 hover:text-red-600"
            disabled={pending}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClick}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteButton;
