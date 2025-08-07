"use client";
import { ToastContext } from "@/context/ToastContext";
import { useContext } from "react";

const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within ErrorProvider");
  }
  return context;
};

export default useToastContext;
