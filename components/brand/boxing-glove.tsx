import { cn } from "@/lib/utils";

export function BoxingGlove({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-6 w-6", className)} aria-hidden="true" fill="none">
      <path
        d="M8 10.5c0-3 1.6-5.5 4.2-5.5 2.2 0 3.5 1.4 4 3.2.7.2 1.8.8 1.8 2.3 0 1-.5 1.7-1.2 2.1.2 1.6-.4 3.4-2.3 4.2L13 19.5H9.2L8 17c-1.6-.6-2.5-2-2.5-3.8V10.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 19.5h5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 11.2h3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
