import { getAllUsers } from "@/api/api";
import { getSession } from "@/api/session";
import { deleteUserAction } from "@/api/adminActions";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import UserFormDialog from "@/components/admin/UserFormDialog";
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
import { Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

const AdminUsersPage = async () => {
  const [users, session] = await Promise.all([getAllUsers(), getSession()]);

  if (!users) {
    return <p className="text-secondary-400">Could not load users.</p>;
  }

  return (
    <div>
      <AdminPageHeader title="Users" />

      <div className="overflow-x-auto rounded-lg border border-secondary-200/40 bg-primary-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-semibold text-secondary-500">
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "ADMIN" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <UserFormDialog
                      user={user}
                      trigger={
                        <Button type="button" size="icon" variant="ghost">
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                    {session?.id !== user.id && (
                      <DeleteButton
                        onConfirm={async () => {
                          "use server";
                          return deleteUserAction(user.id);
                        }}
                        title={`Delete ${user.firstName} ${user.lastName}?`}
                        description="This permanently removes the user and cascades to their reservations and reviews."
                      />
                    )}
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

export default AdminUsersPage;
