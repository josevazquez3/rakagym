"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-border bg-surface-2 data-[state=checked]:border-gold data-[state=checked]:bg-gold",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-1 rounded-full bg-white transition data-[state=checked]:translate-x-6 data-[state=checked]:bg-black" />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

export { Switch };
