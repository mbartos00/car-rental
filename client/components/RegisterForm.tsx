"use client";
import { registerAction } from "@/api/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import useToastContext from "@/hooks/useToastContext";
import { registerSchema, RegisterFormValues } from "@/schemas/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import RhfFieldInput from "./RhfFieldInput";

const RegisterForm = () => {
  const { handleToast } = useToastContext();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      repeatPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    const result = await registerAction(values);

    handleToast(result.success, result.error, result.message);

    if (result.success) {
      router.push(ROUTES.LOGIN);
    }
  };

  return (
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <RhfFieldInput
            label="First Name"
            id="firstName"
            placeholder="John"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <RhfFieldInput
            label="Last Name"
            id="lastName"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
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
          <RhfFieldInput
            label="Repeat password"
            id="repeatPassword"
            type="password"
            placeholder="Repeat password"
            error={errors.repeatPassword?.message}
            {...register("repeatPassword")}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
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
  );
};

export default RegisterForm;
