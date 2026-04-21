"use client";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60svh] w-full flex flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-secondary-500 font-bold text-3xl text-center">
        Something went wrong
      </h1>
      <p className="text-secondary-300 font-medium text-center">
        We could not load this page. Please try again in a moment.
      </p>
      <div className="flex gap-4">
        <Button size="lg" className="rounded-sm" onClick={reset}>
          Try again
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-sm">
          <Link href={ROUTES.HOME}>Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
