import {
  Minus,
  Plus,
} from "lucide-react";

import { AppButton } from "@/components/forms/AppButton";

import {
  MobileFullScreenSheet,
  MobileFullScreenSheetBody,
  MobileFullScreenSheetContent,
  MobileFullScreenSheetFooter,
  MobileFullScreenSheetHeader,
  MobileFullScreenSheetTitle,
} from "@/components/layout/MobileFullScreenSheet";

type ShoppingItemQuantitySheetProps = {
  open: boolean;
  productName: string;
  quantity: number;

  onOpenChange: (
    open: boolean
  ) => void;

  onDecrease: () => void;
  onIncrease: () => void;
};

export function ShoppingItemQuantitySheet({
  open,
  productName,
  quantity,
  onOpenChange,
  onDecrease,
  onIncrease,
}: ShoppingItemQuantitySheetProps) {
  function handleClose() {
    onOpenChange(false);
  }

  return (
    <MobileFullScreenSheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <MobileFullScreenSheetContent
        onClose={handleClose}
        className="h-auto max-h-[70dvh]"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <MobileFullScreenSheetHeader>
            <MobileFullScreenSheetTitle>
              Quantidade
            </MobileFullScreenSheetTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              {productName}
            </p>
          </MobileFullScreenSheetHeader>

          <MobileFullScreenSheetBody>
            <div className="flex items-center justify-center gap-6 py-8">
              <button
                type="button"
                onClick={onDecrease}
                disabled={quantity <= 1}
                aria-label={`Diminuir quantidade de ${productName}`}
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-muted
                  text-foreground
                  transition-[background-color,opacity,transform]
                  duration-150
                  active:scale-90
                  active:bg-muted/80
                  disabled:cursor-not-allowed
                  disabled:opacity-35
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-primary/30
                "
              >
                <Minus
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </button>

              <div className="min-w-20 text-center">
                <p className="text-5xl font-bold tracking-tight text-foreground">
                  {quantity}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {quantity === 1
                    ? "unidade"
                    : "unidades"}
                </p>
              </div>

              <button
                type="button"
                onClick={onIncrease}
                aria-label={`Aumentar quantidade de ${productName}`}
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-primary
                  text-primary-foreground
                  transition-[background-color,transform]
                  duration-150
                  active:scale-90
                  active:bg-primary/90
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-primary/30
                "
              >
                <Plus
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </button>
            </div>
          </MobileFullScreenSheetBody>

          <MobileFullScreenSheetFooter>
            <AppButton
              onClick={handleClose}
            >
              Concluído
            </AppButton>
          </MobileFullScreenSheetFooter>
        </div>
      </MobileFullScreenSheetContent>
    </MobileFullScreenSheet>
  );
}