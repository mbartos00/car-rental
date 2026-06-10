export const ROUTES = {
  HOME: "/",
  CARS: "/cars",
  LOGIN: "/login",
  REGISTER: "/register",
  FAVOURITES: "/favourites",
  USER: "/user",
  RESERVATION: "/reservation",
  ADMIN: "/admin",
  ADMIN_CARS: "/admin/cars",
  ADMIN_RESERVATIONS: "/admin/reservations",
  ADMIN_LOCATIONS: "/admin/locations",
  ADMIN_PROMOS: "/admin/promos",
  ADMIN_USERS: "/admin/users",
} as const;

export const PROTECTED_ROUTES: string[] = [
  ROUTES.FAVOURITES,
  ROUTES.USER,
  ROUTES.RESERVATION,
  ROUTES.ADMIN,
];

export const AUTH_ROUTES: string[] = [ROUTES.LOGIN, ROUTES.REGISTER];
