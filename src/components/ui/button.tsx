import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,box-shadow,transform,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
  {
    variants: {
      variant: {
        default: "bg-fg text-bg hover:bg-fg/90",
        ghost: "text-fg hover:bg-fg/8",
        outline: "hairline bg-transparent hover:bg-fg/6",
        glass: "glass text-fg hover:bg-fg/10",
        blue: "bg-blue text-fg hover:bg-blue/90 glow-blue",
        crimson: "bg-crimson text-fg hover:bg-crimson/90 glow-crimson",
        orange: "bg-orange text-bg hover:bg-orange/90 glow-orange",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-sm px-3 text-xs",
        lg: "h-11 px-5",
        icon: "size-10",
        "icon-sm": "size-8 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
