import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  interactive = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-surface",
        interactive && "transition duration-200 hover:-translate-y-0.5 hover:border-gold/70 hover:shadow-gold",
        className,
      )}
      {...props}
    />
  );
}
