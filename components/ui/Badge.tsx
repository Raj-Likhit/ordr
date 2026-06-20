import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-sm)] px-2.5 py-0.5 font-accent text-[var(--text-label)] font-semibold transition-colors uppercase tracking-[0.08em]",
  {
    variants: {
      variant: {
        verified:
          "bg-[#E8F3ED] text-[var(--color-success)]", // success-tinted green
        lowStock:
          "bg-[#FDF2E3] text-[var(--color-warning)]", // warning-tinted amber
        new:
          "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]",
        outOfStock:
          "bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]",
        pending:
          "bg-[#EBE5DE] text-[var(--color-text-secondary)]", // muted warm gray
        approved:
          "bg-[var(--color-success)] text-white",
        rejected:
          "bg-[var(--color-error)] text-white",
      },
    },
    defaultVariants: {
      variant: "pending",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={badgeVariants({ variant, className })} {...props} />
  );
}

export { Badge, badgeVariants };
