import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type AppButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger";

type AppButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: AppButtonVariant;
    fullWidth?: boolean;
    icon?: ReactNode;
  };

export function AppButton({
  variant = "primary",
  fullWidth = true,
  icon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: AppButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        `
          inline-flex
          min-h-12
          items-center
          justify-center
          gap-2
          rounded-2xl
          px-4
          py-3
          text-base
          font-semibold
          transition
          duration-150
          active:scale-[0.98]
          disabled:pointer-events-none
          disabled:opacity-50
        `,
        fullWidth && "w-full",

        variant === "primary" &&
          `
            bg-primary
            text-primary-foreground
            shadow-sm
            hover:bg-primary/90
          `,

        variant === "secondary" &&
          `
            border
            border-border
            bg-muted/50
            text-foreground
            hover:bg-muted
          `,

        variant === "ghost" &&
          `
            bg-transparent
            text-primary
            hover:bg-muted/60
          `,

        variant === "danger" &&
          `
            bg-destructive
            text-white
            shadow-sm
            hover:bg-destructive/90
          `,

        className
      )}
      {...props}
    >
      {icon && (
        <span
          className="shrink-0"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      {children}
    </button>
  );
}