import { getReservationStats } from "@/api/api";
import CarTypeDonut from "@/components/admin/CarTypeDonut";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatPriceToUSD } from "@/lib/utils";
import { CalendarRange, Car, DollarSign, Users } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

const AdminDashboard = async () => {
  const stats = await getReservationStats();

  if (!stats) {
    return (
      <p className="text-secondary-400">
        Could not load dashboard stats. Try again later.
      </p>
    );
  }

  const cards = [
    {
      label: "Total revenue",
      value: formatPriceToUSD(stats.totalRevenue),
      icon: DollarSign,
    },
    {
      label: "Reservations",
      value: stats.totalReservations,
      icon: CalendarRange,
    },
    { label: "Cars", value: stats.totalCars, icon: Car },
    { label: "Users", value: stats.totalUsers, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-500">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary-100/60 text-primary-500">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-sm text-secondary-300">{label}</p>
                <p className="text-xl font-bold text-secondary-500">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-secondary-500">
              Rentals by car type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CarTypeDonut data={stats.byCarType} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-secondary-500">
              Recent transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recent.length === 0 && (
              <p className="text-secondary-300 text-sm">No reservations yet</p>
            )}
            {stats.recent.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-center gap-3 border-b border-secondary-200/40 pb-3 last:border-0 last:pb-0"
              >
                <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={reservation.car.images[0]}
                    alt={reservation.car.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-secondary-500">
                    {reservation.car.name}
                  </p>
                  <p className="truncate text-xs text-secondary-300">
                    {reservation.user.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-secondary-500">
                    {formatPriceToUSD(reservation.totalPrice)}
                  </p>
                  <p className="text-xs text-secondary-300">
                    {formatDate(reservation.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
