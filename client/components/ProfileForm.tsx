"use client";
import { updateProfileAction } from "@/api/actions";
import useToastContext from "@/hooks/useToastContext";
import { profileSchema, ProfileFormValues } from "@/schemas/profileSchema";
import { Profile, ProfileUpdateInput } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import RhfFieldInput from "./RhfFieldInput";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

const ProfileForm = ({ profile }: { profile: Profile }) => {
  const { handleToast } = useToastContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      oldPassword: "",
      password: "",
      repeatPassword: "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    const payload: ProfileUpdateInput = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
    };

    if (values.oldPassword && values.password) {
      payload.oldPassword = values.oldPassword;
      payload.password = values.password;
      payload.repeatPassword = values.repeatPassword;
    }

    const result = await updateProfileAction(payload);

    handleToast(result.success, result.error, result.message);

    if (result.success) {
      reset({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        oldPassword: "",
        password: "",
        repeatPassword: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <RhfFieldInput
        label="First Name"
        id="firstName"
        error={errors.firstName?.message}
        {...register("firstName")}
      />
      <RhfFieldInput
        label="Last Name"
        id="lastName"
        error={errors.lastName?.message}
        {...register("lastName")}
      />
      <RhfFieldInput
        label="Email"
        id="email"
        type="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <Separator className="my-6" />

      <p className="text-sm font-semibold text-secondary-400">
        Change password
      </p>
      <RhfFieldInput
        label="Current password"
        id="oldPassword"
        type="password"
        placeholder="Leave empty to keep your password"
        error={errors.oldPassword?.message}
        {...register("oldPassword")}
      />
      <RhfFieldInput
        label="New password"
        id="password"
        type="password"
        error={errors.password?.message}
        {...register("password")}
      />
      <RhfFieldInput
        label="Repeat new password"
        id="repeatPassword"
        type="password"
        error={errors.repeatPassword?.message}
        {...register("repeatPassword")}
      />

      <Button className="w-full mt-2" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
};

export default ProfileForm;
