import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60svh] w-full flex flex-col items-center justify-center gap-6 px-6">
      <p className="text-primary-500 font-bold text-7xl">404</p>
      <h1 className="text-secondary-500 font-bold text-3xl text-center">
        We could not find that page
      </h1>
      <p className="text-secondary-300 font-medium text-center">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg" className="rounded-sm">
          <Link href={ROUTES.HOME}>Back to home</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-sm">
          <Link href={ROUTES.CARS}>Browse cars</Link>
        </Button>
      </div>
    </div>
  );
}
