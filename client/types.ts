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
};

export type CarType = "SEDAN" | "SUV" | "CONVERTIBLE" | "COUPE" | "HATCHBACK";

export type Gearbox = "MANUAL" | "AUTOMATIC";

export type Review = {
  id: string;
  description: string;
  rating: number;
  carId: string;
  createdAt: string;
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
  errors?: {
    email?: string[];
    password?: string[];
  };
  error?: ApiErrorResponse;
  success?: boolean;
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

export type UserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
};

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
