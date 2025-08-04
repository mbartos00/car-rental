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

export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  success?: boolean;
};

export type RegisterState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    password?: string[];
    repeatPassword?: string[];
  };
  success?: boolean;
};
