"use client";

import { logoutAction } from "@/api/actions";
import { ROUTES } from "@/constants/routes";
import useToastContext from "@/hooks/useToastContext";
import { cn } from "@/lib/utils";
import {
  CalendarRange,
  Car,
  Home,
  LogOut,
  MapPin,
  TicketPercent,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.ADMIN, icon: Home },
  { label: "Cars", href: ROUTES.ADMIN_CARS, icon: Car },
  {
    label: "Reservations",
    href: ROUTES.ADMIN_RESERVATIONS,
    icon: CalendarRange,
  },
  { label: "Locations", href: ROUTES.ADMIN_LOCATIONS, icon: MapPin },
  { label: "Promo codes", href: ROUTES.ADMIN_PROMOS, icon: TicketPercent },
  { label: "Users", href: ROUTES.ADMIN_USERS, icon: Users },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { handleToast } = useToastContext();
  const [pending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      handleToast(true, undefined, "Logged out");
      router.push(ROUTES.HOME);
    });
  };

  return (
    <aside className="sticky top-0 h-svh w-16 lg:w-64 shrink-0 bg-primary-0 border-r border-secondary-200/40 flex flex-col p-3 lg:p-6">
      <Link
        href={ROUTES.HOME}
        className="font-bold text-2xl text-primary-500 mb-8 hidden lg:block"
      >
        MORENT
      </Link>
      <Link
        href={ROUTES.HOME}
        className="font-bold text-xl text-primary-500 mb-8 text-center lg:hidden"
      >
        M
      </Link>

      <p className="hidden lg:block text-xs font-semibold tracking-widest text-secondary-300 uppercase mb-4">
        Main menu
      </p>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === ROUTES.ADMIN
              ? pathname === ROUTES.ADMIN
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors justify-center lg:justify-start",
                isActive
                  ? "bg-primary-500 text-white"
                  : "text-secondary-300 hover:bg-primary-100/40 hover:text-secondary-500"
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-secondary-300 hover:bg-primary-100/40 hover:text-secondary-500 transition-colors justify-center lg:justify-start disabled:opacity-50"
      >
        <LogOut className="size-5 shrink-0" />
        <span className="hidden lg:inline">
          {pending ? "Logging out..." : "Log out"}
        </span>
      </button>
    </aside>
  );
};

export default AdminSidebar;
