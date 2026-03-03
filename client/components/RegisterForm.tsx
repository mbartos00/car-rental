"use client";
import { registerFormAction } from "@/api/actions";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useToastContext from "@/hooks/useToastContext";
import { RegisterFormState } from "@/types";
import Form from "next/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import FormFieldInput from "./FormFieldInput";

const initialState: RegisterFormState = {
  formErrors: {
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    password: undefined,
    repeatPassword: undefined,
  },
  success: undefined,
};

const RegisterForm = () => {
  const [state, formAction, pending] = useActionState(
    registerFormAction,
    initialState
  );

  const { handleToast } = useToastContext();
  const router = useRouter();

  useEffect(() => {
    handleToast(state.success, state.error, state?.message);

    if (state.success) {
      router.push(ROUTES.LOGIN);
    }
  }, [state.success, state.error, state.message, handleToast, router]);

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-secondary-500 text-2xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-secondary-400">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form action={formAction} className="space-y-4">
            <FormFieldInput
              label="First Name"
              fieldName="firstName"
              placeholder="John"
              required
              errors={state?.formErrors?.firstName}
            />
            <FormFieldInput
              label="Last Name"
              fieldName="lastName"
              placeholder="Doe"
              required
              errors={state?.formErrors?.lastName}
            />
            <FormFieldInput
              label="Email"
              fieldName="email"
              placeholder="john.doe@example.com"
              required
              type="email"
              errors={state?.formErrors?.email}
            />
            <FormFieldInput
              label="Password"
              fieldName="password"
              placeholder="Enter your password"
              required
              type="password"
              errors={state?.formErrors?.password}
            />
            <FormFieldInput
              label="Repeat password"
              fieldName="repeatPassword"
              placeholder="Repeat password"
              required
              type="password"
              errors={state?.formErrors?.repeatPassword}
            />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Creating Account..." : "Create Account"}
            </Button>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-600">
            {"Already have an account? "}
            <Button variant="link" asChild className="p-0 text-primary-500">
              <Link href={ROUTES.LOGIN}>Log in</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default RegisterForm;
