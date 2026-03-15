import { getMe } from "@/api/api";
import ProfileForm from "@/components/ProfileForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function User() {
  const profile = await getMe();

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
    <div className="flex min-h-[80svh] items-start justify-center p-4 lg:p-8">
      <Card className="w-full max-w-md">
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
    </div>
  );
}
