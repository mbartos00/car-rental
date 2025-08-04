"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { loginFormAction } from "@/api/actions";
import { useActionState, useEffect } from "react";
import Link from "next/link";
import Form from "next/form";
import { cn } from "@/lib/utils";
import { LoginState } from "@/types";
import { toast } from "sonner";

const initialState: LoginState = {
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
  const emailHasError = state.errors?.email;
  const passwordHasError = state.errors?.password;

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
            <div className="space-y-2">
              <Label htmlFor="email" className="text-secondary-500">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className={cn(
                  "border-secondary-200/40 p-5 placeholder:text-sm placeholder:text-secondary-400 placeholder:font-medium",
                  emailHasError && "border-r-red-500"
                )}
              />
              <ul>
                {state?.errors?.email?.map((error) => (
                  <li
                    aria-live="polite"
                    className="text-center text-red-500 text-sm"
                    key={error}
                  >
                    {error}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-secondary-500">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                required
                className={cn(
                  "border-secondary-200/40 p-5 placeholder:text-sm placeholder:text-secondary-400 placeholder:font-medium",
                  passwordHasError && "border-red-500"
                )}
              />
              <ul>
                {state?.errors?.password?.map((error) => (
                  <li
                    aria-live="polite"
                    className="text-center text-red-500 text-sm"
                    key={error}
                  >
                    {error}
                  </li>
                ))}
              </ul>
            </div>
            <Button className="w-full" type="submit" disabled={pending}>
              {pending ? "Logging in" : "Sign In"}
            </Button>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-600">
            {"Don't have an account? "}
            <Button variant="link" asChild className="p-0 text-primary-500">
              <Link href="#">Sign up</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default LoginForm;
