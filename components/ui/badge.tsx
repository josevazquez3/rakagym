import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  gold: "border-gold/50 bg-gold/10 text-gold",
  solid: "border-transparent bg-brand-gradient text-black",
  ember: "border-transparent bg-ember text-white",
  muted: "border-border bg-surface-2 text-muted",
} as const;

export function Badge({
  children,
  tone = "gold",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-condensed text-xs font-semibold uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
