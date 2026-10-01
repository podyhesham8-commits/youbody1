import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-border bg-fg/4 px-3 text-sm text-fg shadow-none outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-subtle",
        "focus-visible:border-blue/60 focus-visible:ring-2 focus-visible:ring-blue/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
