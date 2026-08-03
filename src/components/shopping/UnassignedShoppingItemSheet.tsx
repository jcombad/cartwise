import {
  PackagePlus,
  Store,
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

type UnassignedShoppingItemSheetProps = {
  open: boolean;
  productName: string;

  onOpenChange: (
    open: boolean
  ) => void;

  onCreateProduct: () => void;

  onChooseStore: () => void;
};

export function UnassignedShoppingItemSheet({
  open,
  productName,
  onOpenChange,
  onCreateProduct,
  onChooseStore,
}: UnassignedShoppingItemSheetProps) {
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
              {productName}
            </MobileFullScreenSheetTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Este produto ainda não existe no
              catálogo do CartWise.
            </p>
          </MobileFullScreenSheetHeader>

          <MobileFullScreenSheetBody>
            <div className="space-y-3 rounded-3xl border border-border bg-card p-4">
              <AppButton
                icon={
                  <Store
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                }
                onClick={onChooseStore}
              >
                Escolher supermercado
              </AppButton>

              <AppButton
                variant="secondary"
                icon={
                  <PackagePlus
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                }
                onClick={onCreateProduct}
              >
                Criar novo produto
              </AppButton>
            </div>

            <p className="mt-4 px-1 text-sm leading-relaxed text-muted-foreground">
              Escolhe onde o pretendes comprar
              ou cria o produto para ativares as
              recomendações automáticas.
            </p>
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