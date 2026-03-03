"use client";
import { loginFormAction } from "@/api/actions";
import { ROUTES } from "@/constants/routes";
import useToastContext from "@/hooks/useToastContext";
import { LoginFormState } from "@/types";
import Form from "next/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import FormFieldInput from "./FormFieldInput";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

const initialState: LoginFormState = {
  formErrors: {
    email: undefined,
    password: undefined,
  },
  success: undefined,
};

const LoginForm = ({ from }: { from?: string }) => {
  const [state, formAction, pending] = useActionState(
    loginFormAction,
    initialState
  );

  const { handleToast } = useToastContext();
  const router = useRouter();

  useEffect(() => {
    handleToast(state.success, state.error, state.message);

    if (state.success) {
      router.push(from ?? ROUTES.HOME);
    }
  }, [state.success, state.error, state.message, handleToast, router, from]);

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-secondary-500 text-2xl font-bold text-center">
            Sign In
          </CardTitle>
          <CardDescription className="text-center text-secondary-400">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form action={formAction} className="space-y-4">
            <FormFieldInput
              label="Email"
              fieldName="email"
              placeholder="john.doe@example.com"
              required
              type="email"
              errors={state.formErrors?.email}
            />
            <FormFieldInput
              label="Password"
              fieldName="password"
              placeholder="Enter your password"
              required
              type="password"
              errors={state.formErrors?.password}
            />
            <Button className="w-full" type="submit" disabled={pending}>
              {pending ? "Logging in" : "Sign In"}
            </Button>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-600">
            {"Don't have an account? "}
            <Button variant="link" asChild className="p-0 text-primary-500">
              <Link href={ROUTES.REGISTER}>Sign up</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default LoginForm;
