import { getLocations } from "@/api/api";
import { deleteLocationAction } from "@/api/adminActions";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import LocationFormDialog from "@/components/admin/LocationFormDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const AdminLocationsPage = async () => {
  const locations = await getLocations();

  return (
    <div>
      <AdminPageHeader
        title="Locations"
        action={
          <LocationFormDialog
            trigger={
              <Button>
                <Plus className="size-4" /> Add location
              </Button>
            }
          />
        }
      />

      <div className="overflow-x-auto rounded-lg border border-secondary-200/40 bg-primary-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="font-semibold text-secondary-500">
                  {location.name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <LocationFormDialog
                      location={location}
                      trigger={
                        <Button type="button" size="icon" variant="ghost">
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                    <DeleteButton
                      onConfirm={async () => {
                        "use server";
                        return deleteLocationAction(location.id);
                      }}
                      title={`Delete ${location.name}?`}
                      description="This location will no longer be selectable for new reservations."
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

export default AdminLocationsPage;
