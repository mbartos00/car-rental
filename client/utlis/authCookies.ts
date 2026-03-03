export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const TOKEN_EXP_SKEW_SECONDS = 30;

const base = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const tokenCookieOptions = (exp: number) => ({
  ...base,
  maxAge: Math.max(exp - Math.floor(Date.now() / 1000), 0),
});
