import { getAllCars } from "@/api/api";
import { deleteCarAction } from "@/api/adminActions";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CarFormDialog from "@/components/admin/CarFormDialog";
import DeleteButton from "@/components/admin/DeleteButton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPriceToUSD, toTitleCase } from "@/lib/utils";
import { Pencil, Plus } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

const AdminCarsPage = async () => {
  const cars = await getAllCars();

  return (
    <div>
      <AdminPageHeader
        title="Cars"
        action={
          <CarFormDialog
            trigger={
              <Button>
                <Plus className="size-4" /> Add car
              </Button>
            }
          />
        }
      />

      <div className="overflow-x-auto rounded-lg border border-secondary-200/40 bg-primary-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Car</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Gearbox</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Price/day</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.map((car) => (
              <TableRow key={car.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={car.images[0]}
                        alt={car.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <span className="font-semibold text-secondary-500">
                      {car.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{car.carType}</TableCell>
                <TableCell>{toTitleCase(car.gearbox)}</TableCell>
                <TableCell>{car.seats}</TableCell>
                <TableCell>{formatPriceToUSD(car.price)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <CarFormDialog
                      car={car}
                      trigger={
                        <Button type="button" size="icon" variant="ghost">
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                    <DeleteButton
                      onConfirm={async () => {
                        "use server";
                        return deleteCarAction(car.id);
                      }}
                      title={`Delete ${car.name}?`}
                      description="This permanently removes the car along with its reviews and past reservation history. Cars with active or upcoming reservations cannot be deleted."
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminCarsPage;
