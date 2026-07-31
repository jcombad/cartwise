import type {
  ComponentProps,
  ReactNode,
} from "react";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type AppSelectProps = ComponentProps<"select"> & {
  label?: string;
  description?: string;
  error?: string;
  children: ReactNode;
};

export function AppSelect({
  id,
  label,
  description,
  error,
  children,
  className,
  disabled,
  ...props
}: AppSelectProps) {
  const descriptionId = description
    ? `${id}-description`
    : undefined;

  const errorId = error
    ? `${id}-error`
    : undefined;

  const describedBy = [
    descriptionId,
    errorId,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={id}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={
            describedBy || undefined
          }
          className={cn(
            `
              h-12
              w-full
              appearance-none
              rounded-2xl
              border
              border-border
              bg-muted/40
              px-4
              pr-11
              text-base
              text-foreground
              outline-none
              transition
              focus:border-primary
              focus:bg-background
              focus:ring-2
              focus:ring-primary/15
              disabled:cursor-not-allowed
              disabled:opacity-50
            `,
            error &&
              "border-destructive focus:border-destructive focus:ring-destructive/15",
            className
          )}
          {...props}
        >
          {children}
        </select>

        <ChevronDown
          className="
            pointer-events-none
            absolute
            right-4
            top-1/2
            h-4
            w-4
            -translate-y-1/2
            text-muted-foreground
          "
          aria-hidden="true"
        />
      </div>

      {description && !error && (
        <p
          id={descriptionId}
          className="text-xs leading-relaxed text-muted-foreground"
        >
          {description}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="text-xs font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}