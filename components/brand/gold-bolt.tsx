import { cn } from "@/lib/utils";

export function GoldBolt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 88 28" className={cn("text-gold", className)} aria-hidden="true">
      <path
        d="M2 16 L20 8 L17 16 L36 3 L30 16 L50 6 L42 16 L66 2 L54 16 L86 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="miter"
      />
      <path
        d="M6 22 H28 M36 22 H58 M64 22 H82"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.7"
      />
    </svg>
  );
}
