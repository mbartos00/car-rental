"use client";
import { loginAction } from "@/api/actions";
import { ROUTES } from "@/constants/routes";
import useToastContext from "@/hooks/useToastContext";
import { loginSchema, LoginFormValues } from "@/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import RhfFieldInput from "./RhfFieldInput";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

const LoginForm = ({ from }: { from?: string }) => {
  const { handleToast } = useToastContext();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    const result = await loginAction(values);

    handleToast(result.success, result.error, result.message);

    if (result.success) {
      router.push(from ?? ROUTES.HOME);
    }
  };

  return (
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <RhfFieldInput
            label="Email"
            id="email"
            type="email"
            placeholder="john.doe@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <RhfFieldInput
            label="Password"
            id="password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in" : "Sign In"}
          </Button>
        </form>
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
  );
};

export default LoginForm;
