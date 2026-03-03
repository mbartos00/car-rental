import { ACCESS_TOKEN_COOKIE } from "@/utlis/authCookies";
import decodeJwtPayload from "@/utlis/jwt";
import { Session } from "@/types";
import { cookies } from "next/headers";
import { cache } from "react";

export const getSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) return null;

  const payload = decodeJwtPayload(token);

  if (!payload || payload.exp * 1000 <= Date.now()) return null;

  return { id: payload.sub, email: payload.email, role: payload.role };
});
