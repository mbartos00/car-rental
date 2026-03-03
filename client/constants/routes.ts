export const ROUTES = {
  HOME: "/",
  CARS: "/cars",
  LOGIN: "/login",
  REGISTER: "/register",
  FAVOURITES: "/favourites",
  USER: "/user",
} as const;

export const PROTECTED_ROUTES: string[] = [ROUTES.FAVOURITES, ROUTES.USER];

export const AUTH_ROUTES: string[] = [ROUTES.LOGIN, ROUTES.REGISTER];
