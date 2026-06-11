import { getPromoCodes } from "@/api/api";
import { deletePromoAction } from "@/api/adminActions";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import PromoFormDialog from "@/components/admin/PromoFormDialog";
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
import { Pencil, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const AdminPromosPage = async () => {
  const promos = (await getPromoCodes()) ?? [];

  return (
    <div>
      <AdminPageHeader
        title="Promo codes"
        action={
          <PromoFormDialog
            trigger={
              <Button>
                <Plus className="size-4" /> Add promo code
              </Button>
            }
          />
        }
      />

      <div className="overflow-x-auto rounded-lg border border-secondary-200/40 bg-primary-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promos.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-semibold text-secondary-500">
                  {promo.code}
                </TableCell>
                <TableCell>{promo.discountPercent}%</TableCell>
                <TableCell>
                  <Badge variant={promo.active ? "default" : "secondary"}>
                    {promo.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <PromoFormDialog
                      promo={promo}
                      trigger={
                        <Button type="button" size="icon" variant="ghost">
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                    <DeleteButton
                      onConfirm={async () => {
                        "use server";
                        return deletePromoAction(promo.id);
                      }}
                      title={`Delete ${promo.code}?`}
                      description="This promo code will no longer be usable at checkout."
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

export default AdminPromosPage;
