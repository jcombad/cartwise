import type {
  ComponentProps,
  ReactNode,
} from "react";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

type MobileFullScreenSheetProps =
  ComponentProps<typeof DialogPrimitive.Root>;

export function MobileFullScreenSheet({
  ...props
}: MobileFullScreenSheetProps) {
  return <DialogPrimitive.Root {...props} />;
}

type MobileFullScreenSheetContentProps =
  ComponentProps<typeof DialogPrimitive.Content> & {
    children: ReactNode;
    onClose?: () => void;
    showCloseButton?: boolean;
  };

export function MobileFullScreenSheetContent({
  children,
  className,
  onClose,
  showCloseButton = true,
  ...props
}: MobileFullScreenSheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="
          fixed
          inset-0
          z-50
          bg-black/55
          data-[state=open]:animate-in
          data-[state=open]:fade-in-0
          data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0
        "
      />

      <DialogPrimitive.Content
        className={cn(
          `
            fixed
            inset-x-0
            bottom-0
            z-50
            flex
            h-[96dvh]
            w-full
            flex-col
            overflow-hidden
            rounded-t-[30px]
            border-t
            border-border
            bg-background
            text-foreground
            shadow-2xl
            outline-none

            data-[state=open]:animate-in
            data-[state=open]:slide-in-from-bottom-full
            data-[state=open]:duration-300

            data-[state=closed]:animate-out
            data-[state=closed]:slide-out-to-bottom-full
            data-[state=closed]:duration-200
          `,
          className
        )}
        {...props}
      >
        <div
          className="
            absolute
            left-1/2
            top-2.5
            h-1.5
            w-10
            -translate-x-1/2
            rounded-full
            bg-muted-foreground/30
          "
          aria-hidden="true"
        />

        {showCloseButton && (
          <DialogPrimitive.Close asChild>
            <button
              type="button"
              onClick={onClose}
              className="
                absolute
                right-4
                top-4
                z-10
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-muted
                text-muted-foreground
                transition
                active:scale-95
                active:bg-muted/80
              "
              aria-label="Fechar"
            >
              <X
                className="h-5 w-5"
                aria-hidden="true"
              />
            </button>
          </DialogPrimitive.Close>
        )}

        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function MobileFullScreenSheetTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-2xl font-bold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

export function MobileFullScreenSheetDescription({
  className,
  ...props
}: ComponentProps<
  typeof DialogPrimitive.Description
>) {
  return (
    <DialogPrimitive.Description
      className={cn(
        "text-sm leading-relaxed text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function MobileFullScreenSheetHeader({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        `
          shrink-0
          border-b
          border-border
          px-5
          pb-4
          pt-8
          pr-16
          text-left
        `,
        className
      )}
      {...props}
    />
  );
}

export function MobileFullScreenSheetBody({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        `
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          px-5
          py-5
        `,
        className
      )}
      {...props}
    />
  );
}

export function MobileFullScreenSheetFooter({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        `
          shrink-0
          border-t
          border-border
          bg-background
          px-5
          pb-[calc(env(safe-area-inset-bottom)+1rem)]
          pt-3
        `,
        className
      )}
      {...props}
    />
  );
}