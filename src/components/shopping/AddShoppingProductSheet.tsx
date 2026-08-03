import {
  useMemo,
  useState,
} from "react";

import { AppButton } from "@/components/forms/AppButton";
import { AppInput } from "@/components/forms/AppInput";

import {
  MobileFullScreenSheet,
  MobileFullScreenSheetBody,
  MobileFullScreenSheetContent,
  MobileFullScreenSheetFooter,
  MobileFullScreenSheetHeader,
  MobileFullScreenSheetTitle,
} from "@/components/layout/MobileFullScreenSheet";

import { mockStores } from "@/data/mockStores";

import { getStoredCatalog } from "@/lib/catalogStorage";

import {
  getProductRecommendation,
} from "@/lib/shoppingListHelpers";

type AddShoppingProductSheetProps = {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  onSelectBaseProduct: (
    baseProductId: number
  ) => void;

  onAddCustomProduct: (
    productName: string
  ) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function AddShoppingProductSheet({
  open,
  onOpenChange,
  onSelectBaseProduct,
  onAddCustomProduct,
}: AddShoppingProductSheetProps) {
  const [
    productSearch,
    setProductSearch,
  ] = useState("");

  const {
    baseProducts,
    products,
    priceRecords,
  } = getStoredCatalog();

  const filteredBaseProducts =
    useMemo(() => {
      const normalizedSearch =
        productSearch
          .trim()
          .toLocaleLowerCase("pt-PT");

      if (!normalizedSearch) {
        return baseProducts;
      }

      return baseProducts.filter(
        (baseProduct) =>
          [
            baseProduct.name,
            baseProduct.category,
          ].some((value) =>
            value
              ?.toLocaleLowerCase("pt-PT")
              .includes(normalizedSearch)
          )
      );
    }, [
      productSearch,
      baseProducts,
    ]);

  function handleOpenChange(
    nextOpen: boolean
  ) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setProductSearch("");
    }
  }

  function handleSelectBaseProduct(
    baseProductId: number
  ) {
    onSelectBaseProduct(baseProductId);

    /*
     * Mantemos a sheet aberta para permitir
     * adicionar vários produtos seguidos.
     */
    setProductSearch("");
  }

  function handleAddCustomProduct() {
    const productName =
      productSearch.trim();

    if (!productName) {
      return;
    }

    onAddCustomProduct(productName);

    /*
     * Mantemos a sheet aberta e limpamos a pesquisa
     * para permitir adicionar outro produto de seguida.
     */
    setProductSearch("");
  }

  return (
    <MobileFullScreenSheet
      open={open}
      onOpenChange={handleOpenChange}
    >
      <MobileFullScreenSheetContent
        onClose={() =>
          handleOpenChange(false)
        }
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <MobileFullScreenSheetHeader>
            <MobileFullScreenSheetTitle>
              O que está a faltar?
            </MobileFullScreenSheetTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Escolhe o produto. O CartWise trata
              automaticamente do supermercado.
            </p>
          </MobileFullScreenSheetHeader>

          <MobileFullScreenSheetBody className="space-y-5">
            <AppInput
              id="shopping-list-product-search"
              type="search"
              autoFocus
              value={productSearch}
              onChange={(event) =>
                setProductSearch(
                  event.target.value
                )
              }
              placeholder="Ex.: Esparguete"
            />

            <section className="space-y-2">
              <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Produtos
              </p>

              {filteredBaseProducts.length > 0 ? (
                <div className="overflow-hidden rounded-3xl border border-border bg-card">
                  {filteredBaseProducts.map(
                    (
                      baseProduct,
                      index
                    ) => {
                      const recommendation =
                        getProductRecommendation(
                          baseProduct.id,
                          products,
                          priceRecords,
                          mockStores
                        );

                      return (
                        <button
                          key={baseProduct.id}
                          type="button"
                          onClick={() =>
                            handleSelectBaseProduct(
                              baseProduct.id
                            )
                          }
                          className={`
                            flex
                            min-h-16
                            w-full
                            items-center
                            justify-between
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
                              index !==
                              filteredBaseProducts.length -
                                1
                                ? "border-b border-border"
                                : ""
                            }
                          `}
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-card-foreground">
                              {baseProduct.name}
                            </p>

                            {baseProduct.category && (
                              <p className="mt-0.5 text-sm text-muted-foreground">
                                {
                                  baseProduct.category
                                }
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 text-right">
                            {recommendation ? (
                              <>
                                <p className="text-sm font-semibold text-card-foreground">
                                  {
                                    recommendation
                                      .store.name
                                  }
                                </p>

                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {formatCurrency(
                                    recommendation.effectivePrice
                                  )}
                                </p>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Por atribuir
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-6 text-center">
                  <p className="font-medium text-foreground">
                    Nenhum produto encontrado
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Podes adicioná-lo já à lista e
                    associá-lo ao catálogo mais tarde.
                  </p>

                  {productSearch.trim() && (
                    <AppButton
                      variant="secondary"
                      onClick={
                        handleAddCustomProduct
                      }
                      className="mt-5"
                    >
                      Adicionar “
                      {productSearch.trim()}”
                    </AppButton>
                  )}
                </div>
              )}
            </section>
          </MobileFullScreenSheetBody>

          <MobileFullScreenSheetFooter>
            <AppButton
              variant="ghost"
              onClick={() =>
                handleOpenChange(false)
              }
            >
              Cancelar
            </AppButton>
          </MobileFullScreenSheetFooter>
        </div>
      </MobileFullScreenSheetContent>
    </MobileFullScreenSheet>
  );
}