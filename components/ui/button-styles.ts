import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-condensed text-sm font-semibold uppercase tracking-wider transition duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand-gradient text-black hover:-translate-y-0.5 hover:shadow-gold",
        outline: "border border-gold bg-transparent text-gold hover:bg-gold/10",
        green: "bg-green text-black hover:-translate-y-0.5 hover:bg-green-dark",
        ghost: "bg-transparent text-foreground hover:bg-surface-2",
        danger: "bg-ember text-white hover:opacity-90",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-11 px-3 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
