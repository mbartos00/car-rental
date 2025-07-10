import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import Form from "next/form";

type Props = {
  className?: string;
};

const Searchbar = ({ className }: Props) => {
  return (
    <Form action="/cars" className={cn("relative", className)}>
      <Input
        className={
          "border-secondary-200/40 pl-10 py-6 placeholder:text-sm placeholder:text-secondary-400 placeholder:font-medium lg:rounded-4xl lg:py-5"
        }
        name="search"
        placeholder="Search something here"
      />
      <Search className="absolute top-1/2 -translate-y-1/2 left-3 stroke-secondary-400" />
    </Form>
  );
};

export default Searchbar;
