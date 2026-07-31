import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AppSwitchProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
};

export function AppSwitch({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  icon,
  disabled = false,
  className,
}: AppSwitchProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        `
          flex
          cursor-pointer
          items-center
          justify-between
          gap-4
          rounded-2xl
          border
          border-border
          bg-muted/30
          px-4
          py-3.5
          transition
          active:bg-muted
        `,
        disabled &&
          "cursor-not-allowed opacity-50",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <div className="mt-0.5 shrink-0 text-primary">
            {icon}
          </div>
        )}

        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {label}
          </p>

          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="relative shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) =>
            onCheckedChange(event.target.checked)
          }
          className="peer sr-only"
        />

        <span
          className="
            block
            h-7
            w-12
            rounded-full
            bg-muted
            transition-colors
            duration-200
            peer-checked:bg-primary
            peer-focus-visible:ring-2
            peer-focus-visible:ring-primary/30
            peer-focus-visible:ring-offset-2
            peer-focus-visible:ring-offset-background
          "
          aria-hidden="true"
        />

        <span
          className="
            pointer-events-none
            absolute
            left-1
            top-1
            h-5
            w-5
            rounded-full
            bg-background
            shadow-sm
            transition-transform
            duration-200
            peer-checked:translate-x-5
          "
          aria-hidden="true"
        />
      </div>
    </label>
  );
}