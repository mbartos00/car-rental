"use client";
import { SessionContext } from "@/context/SessionContext";
import { useContext } from "react";

const useSession = () => {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
};

export default useSession;
