"use client";
import { Session } from "@/types";
import { createContext, ReactNode } from "react";

export const SessionContext = createContext<Session | null | undefined>(
  undefined
);

const SessionProvider = ({
  session,
  children,
}: {
  session: Session | null;
  children: ReactNode;
}) => {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
