import { NextRequest, NextResponse } from "next/server";
import { AUTH_ROUTES, PROTECTED_ROUTES, ROUTES } from "@/constants/routes";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  TOKEN_EXP_SKEW_SECONDS,
  tokenCookieOptions,
} from "@/utlis/authCookies";
import decodeJwtPayload from "@/utlis/jwt";

const isProtectedPath = (pathname: string) =>
  PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

const isAdminPath = (pathname: string) =>
  pathname === ROUTES.ADMIN || pathname.startsWith(`${ROUTES.ADMIN}/`);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const isProtected = isProtectedPath(pathname);

  const payload = accessToken ? decodeJwtPayload(accessToken) : null;
  const isAccessTokenValid =
    !!payload &&
    payload.exp * 1000 > Date.now() + TOKEN_EXP_SKEW_SECONDS * 1000;
  const isAuthRoute =
    AUTH_ROUTES.includes(pathname) && request.method === "GET";

  if (isAccessTokenValid) {
    if (isAuthRoute) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
    }

    if (isAdminPath(pathname) && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
    }

    return NextResponse.next();
  }

  if (refreshToken) {
    try {
      const res = await fetch(`${process.env.API_URL}/auth/refresh`, {
        method: "POST",
        headers: { Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}` },
        cache: "no-store",
      });

      if (res.ok) {
        const { accessToken: newAccessToken } = (await res.json()) as {
          accessToken: string;
        };
        const newPayload = decodeJwtPayload(newAccessToken);
        const rotatedRefreshToken = res.headers
          .getSetCookie()
          .find((cookie) => cookie.startsWith(`${REFRESH_TOKEN_COOKIE}=`))
          ?.split(";")[0]
          .slice(REFRESH_TOKEN_COOKIE.length + 1);
        const rotatedPayload = rotatedRefreshToken
          ? decodeJwtPayload(rotatedRefreshToken)
          : null;

        if (newPayload) {
          const requestHeaders = new Headers(request.headers);
          const otherCookies = (requestHeaders.get("cookie") ?? "")
            .split("; ")
            .filter(
              (cookie) =>
                cookie && !cookie.startsWith(`${ACCESS_TOKEN_COOKIE}=`)
            );
          requestHeaders.set(
            "cookie",
            [...otherCookies, `${ACCESS_TOKEN_COOKIE}=${newAccessToken}`].join(
              "; "
            )
          );

          const shouldBounceHome =
            isAuthRoute ||
            (isAdminPath(pathname) && newPayload.role !== "ADMIN");
          const response = shouldBounceHome
            ? NextResponse.redirect(new URL(ROUTES.HOME, request.url))
            : NextResponse.next({
                request: { headers: requestHeaders },
              });
          response.cookies.set(
            ACCESS_TOKEN_COOKIE,
            newAccessToken,
            tokenCookieOptions(newPayload.exp)
          );

          if (rotatedRefreshToken && rotatedPayload) {
            response.cookies.set(
              REFRESH_TOKEN_COOKIE,
              rotatedRefreshToken,
              tokenCookieOptions(rotatedPayload.exp)
            );
          }

          return response;
        }
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }

    const response = isProtected
      ? NextResponse.redirect(
          new URL(`${ROUTES.LOGIN}?from=${encodeURIComponent(pathname)}`, request.url)
        )
      : NextResponse.next();
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);

    return response;
  }

  if (isProtected) {
    return NextResponse.redirect(
      new URL(`${ROUTES.LOGIN}?from=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)).*)",
  ],
};
