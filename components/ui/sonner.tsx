"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "border border-border bg-surface text-foreground",
          title: "font-condensed uppercase tracking-wide",
          error: "border-ember",
          success: "border-gold",
        },
      }}
    />
  );
}
