import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Props = {
  label: string;
  fieldName: string;
  errors: string[] | undefined;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "name">;

const FormFieldInput = ({ label, fieldName, errors, ...props }: Props) => {
  const fieldHasError = errors?.length;

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldName}>{label}</Label>
      <Input
        id={fieldName}
        name={fieldName}
        className={cn(
          "border-secondary-200/40 p-5 placeholder:text-sm placeholder:text-secondary-400 placeholder:font-medium",
          fieldHasError && "border-red-500"
        )}
        {...props}
      />
      {fieldHasError && (
        <ul>
          {errors?.map((error) => (
            <li
              aria-live="polite"
              className="text-center text-red-500 text-sm"
              key={error}
            >
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FormFieldInput;
