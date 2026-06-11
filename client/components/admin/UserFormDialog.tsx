"use client";

import { updateUserAction } from "@/api/adminActions";
import RhfFieldInput from "@/components/RhfFieldInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useToastContext from "@/hooks/useToastContext";
import {
  adminUserFormSchema,
  AdminUserFormValues,
} from "@/schemas/adminSchemas";
import { AdminUser } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

const UserFormDialog = ({
  user,
  trigger,
}: {
  user: AdminUser;
  trigger: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const { handleToast } = useToastContext();

  const defaults: AdminUserFormValues = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserFormSchema),
    defaultValues: defaults,
  });

  const onSubmit = async (values: AdminUserFormValues) => {
    const result = await updateUserAction(user.id, values);
    handleToast(result.success, undefined, result.message);
    if (result.success) setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset(defaults);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <RhfFieldInput
            label="First name"
            id="user-first"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <RhfFieldInput
            label="Last name"
            id="user-last"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
          <RhfFieldInput
            label="Email"
            id="user-email"
            error={errors.email?.message}
            {...register("email")}
          />
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
