import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[var(--radius-sm)] transition-all font-body text-[var(--text-body)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] w-full md:w-auto",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] hover:-translate-y-[1px]",
        secondary:
          "bg-transparent border-[1.5px] border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]",
        ghost:
          "bg-transparent border-none text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]",
      },
      size: {
        default: "px-[28px] py-[14px]",
        sm: "px-[16px] py-[8px] text-[var(--text-small)]",
        lg: "px-[32px] py-[16px] text-[var(--text-body-lg)]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
