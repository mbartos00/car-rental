import { getAdminReservations } from "@/api/api";
import { adminCancelReservationAction } from "@/api/adminActions";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import BillingFormDialog from "@/components/admin/BillingFormDialog";
import DeleteButton from "@/components/admin/DeleteButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatPriceToUSD } from "@/lib/utils";
import { Pencil, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const AdminReservationsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const page = Number((await searchParams).page ?? "1");
  const result = await getAdminReservations(page);

  if (!result) {
    return (
      <p className="text-secondary-400">Could not load reservations.</p>
    );
  }

  const { data: reservations, pagination } = result;

  return (
    <div>
      <AdminPageHeader title="Reservations" />

      <div className="overflow-x-auto rounded-lg border border-secondary-200/40 bg-primary-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Car</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>
                  <p className="font-semibold text-secondary-500">
                    {reservation.billingInfo.name}
                  </p>
                  <p className="text-xs text-secondary-300">
                    {reservation.user.email}
                  </p>
                </TableCell>
                <TableCell>{reservation.car.name}</TableCell>
                <TableCell className="whitespace-nowrap text-sm text-secondary-400">
                  {formatDate(reservation.startDate)} –{" "}
                  {formatDate(reservation.endDate)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-secondary-400">
                  {reservation.pickupLocation.name} →{" "}
                  {reservation.dropoffLocation.name}
                </TableCell>
                <TableCell>{formatPriceToUSD(reservation.totalPrice)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      reservation.status === "CANCELLED"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {reservation.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <BillingFormDialog
                      reservation={reservation}
                      trigger={
                        <Button type="button" size="icon" variant="ghost">
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                    {reservation.status === "CONFIRMED" && (
                      <DeleteButton
                        onConfirm={async () => {
                          "use server";
                          return adminCancelReservationAction(reservation.id);
                        }}
                        title="Cancel and refund this reservation?"
                        description="The customer will be refunded via Stripe and the reservation marked as cancelled. This overrides the 72-hour customer limit."
                        trigger={
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                          >
                            <XCircle className="size-4" />
                          </Button>
                        }
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrev}
            asChild={pagination.hasPrev}
          >
            {pagination.hasPrev ? (
              <a href={`?page=${page - 1}`}>Previous</a>
            ) : (
              <span>Previous</span>
            )}
          </Button>
          <span className="text-sm text-secondary-300">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNext}
            asChild={pagination.hasNext}
          >
            {pagination.hasNext ? (
              <a href={`?page=${page + 1}`}>Next</a>
            ) : (
              <span>Next</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminReservationsPage;
