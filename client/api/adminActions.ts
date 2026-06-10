"use server";

import { ROUTES } from "@/constants/routes";
import { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";
import apiFetch from "./apiFetch";

type CarPayload = {
  name: string;
  description: string;
  price: number;
  carType: string;
  gearbox: string;
  seats: number;
  tankCapacity: number;
  images: string[];
};

type BillingPayload = {
  name: string;
  phoneNumber: string;
  address: string;
  city: string;
};

const adminMutation = async (
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  revalidate: string[],
  body?: Record<string, unknown>
): Promise<ActionResult> => {
  try {
    const res = await apiFetch(path, {
      method,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        typeof data?.message === "string"
          ? data.message
          : "Something went wrong";

      return { success: false, message };
    }

    for (const path of revalidate) {
      revalidatePath(path);
    }

    return { success: true, message: "" };
  } catch (error) {
    console.error("Admin mutation error:", error);
    return { success: false, message: "Network error" };
  }
};

const withMessage = (result: ActionResult, message: string): ActionResult =>
  result.success ? { ...result, message } : result;

export const createCarAction = async (
  payload: CarPayload
): Promise<ActionResult> =>
  withMessage(
    await adminMutation("/cars/create", "POST", [ROUTES.ADMIN_CARS, ROUTES.CARS], payload),
    "Car created"
  );

export const updateCarAction = async (
  id: string,
  payload: CarPayload
): Promise<ActionResult> =>
  withMessage(
    await adminMutation(`/cars/${id}`, "PATCH", [ROUTES.ADMIN_CARS, ROUTES.CARS, `${ROUTES.CARS}/${id}`], payload),
    "Car updated"
  );

export const deleteCarAction = async (id: string): Promise<ActionResult> =>
  withMessage(
    await adminMutation(`/cars/${id}`, "DELETE", [ROUTES.ADMIN_CARS, ROUTES.CARS]),
    "Car deleted"
  );

export const createLocationAction = async (
  name: string
): Promise<ActionResult> =>
  withMessage(
    await adminMutation("/locations", "POST", [ROUTES.ADMIN_LOCATIONS], { name }),
    "Location created"
  );

export const updateLocationAction = async (
  id: string,
  name: string
): Promise<ActionResult> =>
  withMessage(
    await adminMutation(`/locations/${id}`, "PATCH", [ROUTES.ADMIN_LOCATIONS], { name }),
    "Location updated"
  );

export const deleteLocationAction = async (
  id: string
): Promise<ActionResult> =>
  withMessage(
    await adminMutation(`/locations/${id}`, "DELETE", [ROUTES.ADMIN_LOCATIONS]),
    "Location deleted"
  );

export const createPromoAction = async (payload: {
  code: string;
  discountPercent: number;
  active: boolean;
}): Promise<ActionResult> =>
  withMessage(
    await adminMutation("/promo-codes", "POST", [ROUTES.ADMIN_PROMOS], payload),
    "Promo code created"
  );

export const updatePromoAction = async (
  id: string,
  payload: { code?: string; discountPercent?: number; active?: boolean }
): Promise<ActionResult> =>
  withMessage(
    await adminMutation(`/promo-codes/${id}`, "PATCH", [ROUTES.ADMIN_PROMOS], payload),
    "Promo code updated"
  );

export const deletePromoAction = async (id: string): Promise<ActionResult> =>
  withMessage(
    await adminMutation(`/promo-codes/${id}`, "DELETE", [ROUTES.ADMIN_PROMOS]),
    "Promo code deleted"
  );

export const updateReservationBillingAction = async (
  id: string,
  payload: BillingPayload
): Promise<ActionResult> =>
  withMessage(
    await adminMutation(`/reservations/${id}/billing`, "PATCH", [ROUTES.ADMIN_RESERVATIONS], payload),
    "Billing details updated"
  );

export const adminCancelReservationAction = async (
  id: string
): Promise<ActionResult> =>
  withMessage(
    await adminMutation(`/reservations/${id}/admin-cancel`, "PATCH", [
      ROUTES.ADMIN_RESERVATIONS,
      ROUTES.ADMIN,
    ]),
    "Reservation cancelled and refunded"
  );

export const updateUserAction = async (
  id: string,
  payload: { firstName: string; lastName: string; email: string }
): Promise<ActionResult> =>
  withMessage(
    await adminMutation(`/users/update/${id}`, "PATCH", [ROUTES.ADMIN_USERS], payload),
    "User updated"
  );

export const deleteUserAction = async (id: string): Promise<ActionResult> =>
  withMessage(
    await adminMutation(`/users/remove/${id}`, "DELETE", [ROUTES.ADMIN_USERS]),
    "User deleted"
  );
