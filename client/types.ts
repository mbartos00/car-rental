import z from "zod";
import { loginSchema } from "./schemas/loginSchema";
import { registerSchema } from "./schemas/registerSchema";

export type Car = {
  id: string;
  name: string;
  description: string;
  price: number;
  carType: CarType;
  images: string[];
  tankCapacity: number;
  gearbox: Gearbox;
  seats: number;
  reviews: Review[];
  favouritesListId?: string;
  createdAt: string;
  reviewCount?: number;
  averageReview?: number;
};

export type CarType = "SEDAN" | "SUV" | "CONVERTIBLE" | "COUPE" | "HATCHBACK";

export type Gearbox = "MANUAL" | "AUTOMATIC";

export type Review = {
  id: string;
  userId: string;
  description: string;
  rating: number;
  carId: string;
  createdAt: string;
  user: Pick<User, "firstName" | "lastName">;
};

export type CarFilters = {
  price: {
    min: number;
    max: number;
  };
  tankCapacity: {
    min: number;
    max: number;
  };
  carType: {
    _count: number;
    carType: CarType;
  }[];

  gearbox: {
    _count: number;
    gearbox: Gearbox;
  }[];
  seats: {
    _count: number;
    seats: number;
  }[];
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type LoginFormState = {
  formErrors?: {
    email?: string[];
    password?: string[];
  };
  success?: boolean;
  error?: ApiErrorResponse;
  message?: string;
};

export type RegisterFormState = {
  formErrors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    password?: string[];
    repeatPassword?: string[];
  };
  error?: ApiErrorResponse;
  success?: boolean;
  message?: string;
};

export type RegisterUserInput = z.infer<typeof registerSchema>;

export type LoginUserInput = z.infer<typeof loginSchema>;

export type ApiErrorResponse = {
  message: string | ZodError;
  error: string;
  statusCode: number;
};

export type ApiResponse<T> = {
  data?: T;
  success: boolean;
  error?: ApiErrorResponse;
};

export type ZodError = {
  path: string;
  message: string;
  code: string;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  reservations?: Reservation[];
  reviews?: Review[];
  favouritesList: FavouritesList;
};

export type UserRole = "USER" | "ADMIN";

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
};

export type Session = {
  id: string;
  email: string;
  role: UserRole;
};

export type LoginApiResult =
  | { success: true; accessToken: string; refreshToken: string }
  | { success: false; error: ApiErrorResponse };

export type ReservationStatus = "CONFIRMED" | "CANCELLED";

export type Reservation = {
  id: string;
  startDate: string;
  endDate: string;
  status: ReservationStatus;
  totalPrice: number;
  promoCode: string | null;
  discountPercent: number | null;
  marketingConsent: boolean;
  billingInfo: {
    name: string;
    phoneNumber: string;
    address: string;
    city: string;
  };
  car: Car;
  pickupLocation: Location;
  dropoffLocation: Location;
  createdAt: string;
};

export type FavouritesList = {
  id: string;
  user: User;
  cars: Car[];
};

export type FavouritesResponse = {
  id: string;
  userId: string;
  cars: Car[];
  createdAt: string;
};

export type ActionResult = {
  success: boolean;
  message: string;
};

export type Location = {
  id: string;
  name: string;
};

export type BookedRange = {
  startDate: string;
  endDate: string;
};

export type PromoValidationResult =
  | { valid: true; discountPercent: number }
  | { valid: false };

export type AppliedPromo = {
  code: string;
  discountPercent: number;
};

export type PaymentIntentPayload = {
  carId: string;
  startDate: string;
  endDate: string;
  pickupLocationId: string;
  dropoffLocationId: string;
  promoCode?: string;
};

export type PaymentIntentResult =
  | {
      success: true;
      clientSecret: string;
      paymentIntentId: string;
      days: number;
      subtotal: number;
      discountPercent: number;
      totalPrice: number;
    }
  | { success: false; error: ApiErrorResponse };

export type FinalizeReservationPayload = PaymentIntentPayload & {
  paymentIntentId: string;
  marketingConsent: boolean;
  billingInfo: {
    name: string;
    phoneNumber: string;
    address: string;
    city: string;
  };
};

export type Profile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
};

export type ProfileFormState = {
  formErrors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    oldPassword?: string[];
    password?: string[];
    repeatPassword?: string[];
  };
  error?: ApiErrorResponse;
  success?: boolean;
  message?: string;
};
