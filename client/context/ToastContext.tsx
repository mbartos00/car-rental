"use client";
import { ApiErrorResponse } from "@/types";
import { createContext, ReactNode, useCallback, useMemo } from "react";
import { toast } from "sonner";

interface ToastContextType {
  handleToast: (
    success?: boolean,
    error?: ApiErrorResponse,
    message?: string
  ) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

const getPosition = () =>
  window.matchMedia("(min-width: 1024px)").matches
    ? ("bottom-right" as const)
    : ("top-center" as const);

const ToastProvider = ({ children }: { children: ReactNode }) => {
  const handleToast = useCallback(
    (success?: boolean, error?: ApiErrorResponse, message?: string) => {
      if (success === undefined) return;

      const position = getPosition();

      switch (success) {
        case true:
          toast.success(message, { position });
          break;
        case false:
          if (!error && !message) return;

          if (Array.isArray(error?.message)) {
            error.message.forEach((err) => {
              toast.error(error?.error, {
                description: err.message,
                position,
              });
            });
          } else {
            toast.error(error?.error ?? "Error", {
              description: (error?.message as string) ?? message,
              position,
            });
          }

          break;
        default:
          toast.error((error?.message as string) || "Something went wrong", {
            position,
          });
      }
    },
    []
  );

  const value = useMemo(() => ({ handleToast }), [handleToast]);

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

export default ToastProvider;
