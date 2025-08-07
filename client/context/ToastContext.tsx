"use client";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ApiErrorResponse } from "@/types";
import { createContext, ReactNode } from "react";
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

const ToastProvider = ({ children }: { children: ReactNode }) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const handleToast = (
    success?: boolean,
    error?: ApiErrorResponse,
    message?: string
  ) => {
    if (success === undefined) return;

    switch (success) {
      case true:
        toast.success(message, {
          position: isDesktop ? "bottom-right" : "top-center",
        });
        break;
      case false:
        if (!error && !message) return;

        if (Array.isArray(error?.message)) {
          error.message.forEach((err) => {
            toast.error(error?.error, {
              description: err.message,
              position: isDesktop ? "bottom-right" : "top-center",
            });
          });
        } else {
          toast.error(error?.error, {
            description: error?.message as string,
            position: isDesktop ? "bottom-right" : "top-center",
          });
        }

        break;
      default:
        toast.error((error?.message as string) || "Something went wrong", {
          position: isDesktop ? "bottom-right" : "top-center",
        });
    }
  };

  return (
    <ToastContext.Provider value={{ handleToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
