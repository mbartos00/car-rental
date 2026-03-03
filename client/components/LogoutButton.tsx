"use client";
import { logoutAction } from "@/api/actions";
import { ROUTES } from "@/constants/routes";
import useToastContext from "@/hooks/useToastContext";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "./ui/button";

const LogoutButton = () => {
  const { handleToast } = useToastContext();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      handleToast(true, undefined, "Logged out");
      router.push(ROUTES.HOME);
    });
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      className="size-10 group"
      onClick={handleLogout}
      disabled={pending}
    >
      <LogOut className="stroke-secondary-400 size-6 group-hover:stroke-primary-500" />
    </Button>
  );
};

export default LogoutButton;
