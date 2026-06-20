import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  iconRight?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, iconRight, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className={`relative w-full ${className || ""}`}>
        <div className="relative">
          <input
            type={type}
            id={inputId}
            className={`
              peer w-full border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-md)] 
              px-4 pb-2 pt-6 font-body text-[var(--text-body)] bg-white text-[var(--color-text-primary)]
              transition-colors duration-150 ease-in-out
              focus:border-[var(--color-accent)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-accent-subtle)]
              disabled:opacity-50 disabled:bg-[var(--color-bg-surface)]
              placeholder:text-transparent
              ${error ? "border-l-[4px] border-[var(--color-error)]" : ""}
            `}
            placeholder={label}
            ref={ref}
            {...props}
          />
          <label
            htmlFor={inputId}
            className={`
              absolute left-4 top-2 text-[var(--text-small)] text-[var(--color-text-muted)]
              transition-all duration-150 ease-in-out pointer-events-none
              peer-placeholder-shown:top-4 peer-placeholder-shown:text-[var(--text-body)]
              peer-focus:top-2 peer-focus:text-[var(--text-small)] peer-focus:text-[var(--color-accent)]
              ${error ? "peer-focus:text-[var(--color-error)]" : ""}
            `}
          >
            {label}
          </label>
          {iconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] flex items-center justify-center">
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-[var(--text-small)] text-[var(--color-error)]">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
