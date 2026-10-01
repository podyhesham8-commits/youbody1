import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("hub-shimmer rounded-md bg-fg/6", className)} {...props} />;
}

export { Skeleton };
