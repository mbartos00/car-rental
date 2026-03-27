import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Props = {
  label: string;
  error?: string;
} & React.ComponentProps<typeof Input>;

const RhfFieldInput = ({ label, error, id, ...props }: Props) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        className={cn(
          "border-secondary-200/40 p-5 placeholder:text-sm placeholder:text-secondary-400 placeholder:font-medium bg-primary-100/25",
          error && "border-red-500"
        )}
        {...props}
      />
      {error && (
        <p aria-live="polite" className="text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  );
};

export default RhfFieldInput;
