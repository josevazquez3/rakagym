import type { ReactNode } from "react";
import { GoldBolt } from "@/components/brand/gold-bolt";
import { cn } from "@/lib/utils";

export function SectionTitle({
  children,
  className,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <GoldBolt className="h-6 w-12 shrink-0" />
      <Tag className="font-display text-3xl uppercase tracking-wide sm:text-4xl">{children}</Tag>
    </div>
  );
}
