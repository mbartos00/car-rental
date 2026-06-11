import { getSession } from "@/api/session";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ROUTES } from "@/constants/routes";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect(ROUTES.HOME);
  }

  return (
    <div className="flex min-h-svh">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-4 lg:p-8">{children}</main>
    </div>
  );
}
