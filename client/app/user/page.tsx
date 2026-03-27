import { getMe, getMyReservations } from "@/api/api";
import ProfileForm from "@/components/ProfileForm";
import ReservationListItem from "@/components/ReservationListItem";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function User() {
  const [profile, reservations] = await Promise.all([
    getMe(),
    getMyReservations(),
  ]);

  if (!profile) {
    return (
      <div className="h-[60svh] w-full flex justify-center mt-20">
        <h1 className="text-secondary-500 font-bold text-3xl">
          Could not load your profile
        </h1>
      </div>
    );
  }

  return (
    <section className="py-8 px-6 lg:px-16 2xl:w-4/5 2xl:mx-auto grid gap-6 items-start lg:grid-cols-[minmax(340px,420px)_1fr]">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-secondary-500 text-2xl font-bold text-center">
            My Profile
          </CardTitle>
          <CardDescription className="text-center text-secondary-400">
            Member since {formatDate(profile.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-secondary-500 text-2xl font-bold">
            My Reservations
          </CardTitle>
          <CardDescription className="text-secondary-400">
            Reservations can be cancelled up to 72 hours before pick-up
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {reservations === null && (
            <p className="text-secondary-300 font-medium">
              Could not load your reservations
            </p>
          )}
          {reservations?.length === 0 && (
            <p className="text-secondary-300 font-medium">
              No reservations yet
            </p>
          )}
          {reservations?.map((reservation) => (
            <ReservationListItem
              key={reservation.id}
              reservation={reservation}
            />
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
