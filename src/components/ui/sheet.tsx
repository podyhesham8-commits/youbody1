import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function Sheet({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

function SheetContent({
  className,
  side = "left",
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "left" | "right" | "bottom";
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-70 bg-bg/70 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-80 glass outline-none",
          side === "left" && "inset-y-0 left-0 w-[min(20rem,88vw)] border-r border-border",
          side === "right" && "inset-y-0 right-0 w-[min(22rem,88vw)] border-l border-border",
          side === "bottom" && "inset-x-0 bottom-0 max-h-[78dvh] rounded-t-xl border-t border-border",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-3 right-3 inline-flex size-10 items-center justify-center rounded-md text-muted hover:bg-fg/8 hover:text-fg">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("font-display text-base font-semibold", className)}
      {...props}
    />
  );
}

export { Sheet, SheetContent, SheetTitle };
