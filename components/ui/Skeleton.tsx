import React from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-dark-alt)]", className)}
      {...props}
    />
  );
}

export { Skeleton };
