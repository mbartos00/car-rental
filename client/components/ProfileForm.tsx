"use client";
import { updateProfileFormAction } from "@/api/actions";
import useToastContext from "@/hooks/useToastContext";
import { Profile, ProfileFormState } from "@/types";
import Form from "next/form";
import { useActionState, useEffect } from "react";
import FormFieldInput from "./FormFieldInput";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

const initialState: ProfileFormState = {
  formErrors: {
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    oldPassword: undefined,
    password: undefined,
    repeatPassword: undefined,
  },
  success: undefined,
};

const ProfileForm = ({ profile }: { profile: Profile }) => {
  const [state, formAction, pending] = useActionState(
    updateProfileFormAction,
    initialState
  );

  const { handleToast } = useToastContext();

  useEffect(() => {
    handleToast(state.success, state.error, state.message);
  }, [state.success, state.error, state.message, handleToast]);

  return (
    <Form action={formAction} className="space-y-4">
      <FormFieldInput
        label="First Name"
        fieldName="firstName"
        required
        defaultValue={profile.firstName}
        errors={state.formErrors?.firstName}
      />
      <FormFieldInput
        label="Last Name"
        fieldName="lastName"
        required
        defaultValue={profile.lastName}
        errors={state.formErrors?.lastName}
      />
      <FormFieldInput
        label="Email"
        fieldName="email"
        required
        type="email"
        defaultValue={profile.email}
        errors={state.formErrors?.email}
      />

      <Separator className="my-6" />

      <p className="text-sm font-semibold text-secondary-400">
        Change password
      </p>
      <FormFieldInput
        label="Current password"
        fieldName="oldPassword"
        type="password"
        placeholder="Leave empty to keep your password"
        errors={state.formErrors?.oldPassword}
      />
      <FormFieldInput
        label="New password"
        fieldName="password"
        type="password"
        errors={state.formErrors?.password}
      />
      <FormFieldInput
        label="Repeat new password"
        fieldName="repeatPassword"
        type="password"
        errors={state.formErrors?.repeatPassword}
      />

      <Button className="w-full mt-2" type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </Form>
  );
};

export default ProfileForm;
