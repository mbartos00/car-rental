export const ROUTES = {
  HOME: "/",
  CARS: "/cars",
  LOGIN: "/login",
  REGISTER: "/register",
  FAVOURITES: "/favourites",
  USER: "/user",
  RESERVATION: "/reservation",
} as const;

export const PROTECTED_ROUTES: string[] = [
  ROUTES.FAVOURITES,
  ROUTES.USER,
  ROUTES.RESERVATION,
];

export const AUTH_ROUTES: string[] = [ROUTES.LOGIN, ROUTES.REGISTER];
