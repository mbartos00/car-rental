import { ACCESS_TOKEN_COOKIE } from "@/utlis/authCookies";
import { cookies } from "next/headers";

const apiFetch = async (
  path: string,
  init: RequestInit = {}
): Promise<Response> => {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${process.env.API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers,
  });
};

export default apiFetch;
