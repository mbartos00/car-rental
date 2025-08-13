"use client";
import { loginFormAction } from "@/api/actions";
import { LoginFormState } from "@/types";
import Form from "next/form";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
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
  errors: {
    email: undefined,
    password: undefined,
  },
  success: undefined,
};

const LoginForm = () => {
  const [state, formAction, pending] = useActionState(
    loginFormAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Login Successful");
    }
  }, [state.success]);

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
              errors={state.errors?.email}
            />
            <FormFieldInput
              label="Password"
              fieldName="password"
              placeholder="Enter your password"
              required
              type="password"
              errors={state.errors?.password}
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
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default LoginForm;
