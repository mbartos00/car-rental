"use client";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

const LoginLink = () => {
  const pathname = usePathname();

  return (
    <Button size="sm" asChild>
      <Link href={`${ROUTES.LOGIN}?from=${encodeURIComponent(pathname)}`}>
        Log In
      </Link>
    </Button>
  );
};

export default LoginLink;
