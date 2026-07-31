import type {
  ComponentProps,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type AppInputProps = ComponentProps<"input"> & {
  label?: string;
  description?: string;
  error?: string;
  suffix?: ReactNode;
};

export function AppInput({
  id,
  label,
  description,
  error,
  suffix,
  className,
  disabled,
  ...props
}: AppInputProps) {
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
        <input
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
              rounded-2xl
              border
              border-border
              bg-muted/40
              px-4
              text-base
              text-foreground
              outline-none
              transition
              placeholder:text-muted-foreground
              focus:border-primary
              focus:bg-background
              focus:ring-2
              focus:ring-primary/15
              disabled:cursor-not-allowed
              disabled:opacity-50
            `,
            suffix && "pr-11",
            error &&
              "border-destructive focus:border-destructive focus:ring-destructive/15",
            className
          )}
          {...props}
        />

        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-muted-foreground">
            {suffix}
          </div>
        )}
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