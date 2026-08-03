import { Store } from "lucide-react";

import { AppButton } from "@/components/forms/AppButton";

import {
  MobileFullScreenSheet,
  MobileFullScreenSheetBody,
  MobileFullScreenSheetContent,
  MobileFullScreenSheetFooter,
  MobileFullScreenSheetHeader,
  MobileFullScreenSheetTitle,
} from "@/components/layout/MobileFullScreenSheet";

import type { Store as StoreType } from "@/types";

type ChooseShoppingStoreSheetProps = {
  open: boolean;
  productName: string;
  stores: StoreType[];

  onOpenChange: (
    open: boolean
  ) => void;

  onSelectStore: (
    storeId: number
  ) => void;
};

export function ChooseShoppingStoreSheet({
  open,
  productName,
  stores,
  onOpenChange,
  onSelectStore,
}: ChooseShoppingStoreSheetProps) {
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
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <MobileFullScreenSheetHeader>
            <MobileFullScreenSheetTitle>
              Escolher supermercado
            </MobileFullScreenSheetTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Onde pretendes comprar “{productName}”?
            </p>
          </MobileFullScreenSheetHeader>

          <MobileFullScreenSheetBody className="space-y-3">
            <div className="overflow-hidden rounded-3xl border border-border bg-card">
              {stores.map((store, index) => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() =>
                    onSelectStore(store.id)
                  }
                  className={`
                    flex
                    min-h-16
                    w-full
                    items-center
                    gap-4
                    px-4
                    py-3.5
                    text-left
                    transition-colors
                    hover:bg-muted/70
                    focus-visible:bg-muted/70
                    focus-visible:outline-none
                    active:bg-muted
                    ${
                      index !== stores.length - 1
                        ? "border-b border-border"
                        : ""
                    }
                  `}
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: `${store.color}20`,
                    }}
                  >
                    <Store
                      className="h-5 w-5"
                      style={{
                        color: store.color,
                      }}
                      aria-hidden="true"
                    />
                  </div>

                  <span className="font-semibold text-card-foreground">
                    {store.name}
                  </span>
                </button>
              ))}
            </div>
          </MobileFullScreenSheetBody>

          <MobileFullScreenSheetFooter>
            <AppButton
              variant="ghost"
              onClick={handleClose}
            >
              Cancelar
            </AppButton>
          </MobileFullScreenSheetFooter>
        </div>
      </MobileFullScreenSheetContent>
    </MobileFullScreenSheet>
  );
}