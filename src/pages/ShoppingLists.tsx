import {
  Check,
  Plus,
  ShoppingCart,
  Undo2,
} from "lucide-react";

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

import { mockBaseProducts } from "@/data/mockBaseProducts";
import { mockPriceRecords } from "@/data/mockPriceRecords";
import { mockProducts } from "@/data/mockProducts";
import { mockStores } from "@/data/mockStores";
import { mockUserShoppingLists } from "@/data/mockUserShoppingLists";

import {
  getProductRecommendation,
} from "@/lib/shoppingListHelpers";

import type {
  ShoppingListItem,
} from "@/types";

/*
 * Estas props são mantidas temporariamente para não partir
 * o App.tsx enquanto o Dashboard ainda usa as listas antigas.
 *
 * Serão removidas quando migrarmos o Dashboard.
 */
type ShoppingListsProps = {
  shoppingLists?: unknown[];
  onToggleProduct?: (
    shoppingListId: number,
    productId: number
  ) => void;
};

type StoreGroup = {
  storeId: number | null;
  storeName: string;
  storeColor?: string;
  items: ShoppingListItem[];
};

const SHOPPING_LIST_STORAGE_KEY =
  "cartwise-v4-shopping-list";

function getInitialShoppingListItems(): ShoppingListItem[] {
  const storedItems = localStorage.getItem(
    SHOPPING_LIST_STORAGE_KEY
  );

  if (storedItems) {
    try {
      return JSON.parse(
        storedItems
      ) as ShoppingListItem[];
    } catch {
      /*
       * Se os dados guardados estiverem corrompidos,
       * usamos os dados mock iniciais.
       */
    }
  }

  /*
   * Aproveitamos temporariamente os itens da primeira
   * lista mock para não começar com o ecrã totalmente vazio.
   *
   * Este mock será eliminado mais tarde.
   */
  return mockUserShoppingLists[0]?.items ?? [];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function getNextItemId(
  items: ShoppingListItem[]
) {
  if (items.length === 0) {
    return 1;
  }

  return (
    Math.max(
      ...items.map((item) => item.id)
    ) + 1
  );
}

export default function ShoppingLists(
  _props: ShoppingListsProps
) {
  const [
    shoppingListItems,
    setShoppingListItems,
  ] = useState<ShoppingListItem[]>(
    getInitialShoppingListItems
  );

  const [
    isAddProductOpen,
    setIsAddProductOpen,
  ] = useState(false);

  const [
    productSearch,
    setProductSearch,
  ] = useState("");

  const filteredBaseProducts =
    useMemo(() => {
      const normalizedSearch =
        productSearch
          .trim()
          .toLocaleLowerCase("pt-PT");

      if (!normalizedSearch) {
        return mockBaseProducts;
      }

      return mockBaseProducts.filter(
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
    }, [productSearch]);

  const pendingItems =
    shoppingListItems.filter(
      (item) => !item.completed
    );

  const completedItems =
    shoppingListItems.filter(
      (item) => item.completed
    );

  function saveShoppingListItems(
    nextItems: ShoppingListItem[]
  ) {
    setShoppingListItems(nextItems);

    localStorage.setItem(
      SHOPPING_LIST_STORAGE_KEY,
      JSON.stringify(nextItems)
    );
  }

  function handleAddBaseProduct(
    baseProductId: number
  ) {
    const existingItem =
      shoppingListItems.find(
        (item) =>
          item.baseProductId ===
            baseProductId &&
          !item.completed
      );

    /*
     * Se o produto já estiver pendente na lista,
     * aumentamos apenas a quantidade.
     */
    if (existingItem) {
      const nextItems =
        shoppingListItems.map((item) =>
          item.id === existingItem.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );

      saveShoppingListItems(nextItems);

      setIsAddProductOpen(false);
      setProductSearch("");

      return;
    }

    const recommendation =
      getProductRecommendation(
        baseProductId,
        mockProducts,
        mockPriceRecords,
        mockStores
      );

    const newItem: ShoppingListItem = {
      id: getNextItemId(
        shoppingListItems
      ),

      baseProductId,
      quantity: 1,

      recommendedProductId:
        recommendation?.product.id,

      recommendedStoreId:
        recommendation?.store.id,

      selectedProductId:
        recommendation?.product.id,

      selectedStoreId:
        recommendation?.store.id,

      assignmentMode: "automatic",

      completed: false,

      estimatedUnitPrice:
        recommendation?.effectivePrice,
    };

    saveShoppingListItems([
      ...shoppingListItems,
      newItem,
    ]);

    setIsAddProductOpen(false);
    setProductSearch("");
  }

  function handleCompleteItem(
    itemId: number
  ) {
    const nextItems =
      shoppingListItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              completed: true,
            }
          : item
      );

    saveShoppingListItems(nextItems);
  }

  function handleRestoreItem(
    itemId: number
  ) {
    const nextItems =
      shoppingListItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              completed: false,
            }
          : item
      );

    saveShoppingListItems(nextItems);
  }

  function handleClearCompletedItems() {
    const nextItems =
      shoppingListItems.filter(
        (item) => !item.completed
      );

    saveShoppingListItems(nextItems);
  }

  const estimatedTotal =
    pendingItems.reduce(
      (total, item) =>
        total +
        (item.estimatedUnitPrice ?? 0) *
          item.quantity,
      0
    );

  const storeGroupsMap =
    new Map<number | null, StoreGroup>();

  pendingItems.forEach((item) => {
    const storeId =
      item.selectedStoreId ??
      item.recommendedStoreId ??
      null;

    const store =
      storeId !== null
        ? mockStores.find(
            (itemStore) =>
              itemStore.id === storeId
          )
        : undefined;

    const existingGroup =
      storeGroupsMap.get(storeId);

    if (existingGroup) {
      existingGroup.items.push(item);
      return;
    }

    storeGroupsMap.set(storeId, {
      storeId,
      storeName:
        store?.name ?? "Por atribuir",
      storeColor: store?.color,
      items: [item],
    });
  });

  const storeGroups = Array.from(
    storeGroupsMap.values()
  ).sort((firstGroup, secondGroup) => {
    /*
     * A secção "Por atribuir" aparece sempre no fim.
     */
    if (firstGroup.storeId === null) {
      return 1;
    }

    if (secondGroup.storeId === null) {
      return -1;
    }

    return firstGroup.storeName.localeCompare(
      secondGroup.storeName,
      "pt-PT"
    );
  });

  return (
    <>
      <div className="space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Lista de compras
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              O CartWise organiza automaticamente
              os produtos por supermercado.
            </p>
          </div>

          <AppButton
            variant="secondary"
            fullWidth={false}
            aria-label="Adicionar produto"
            onClick={() =>
              setIsAddProductOpen(true)
            }
            className="h-11 min-h-11 w-11 shrink-0 rounded-full p-0"
          >
            <Plus
              className="h-5 w-5"
              aria-hidden="true"
            />
          </AppButton>
        </header>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Total estimado
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-card-foreground">
                {formatCurrency(
                  estimatedTotal
                )}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <ShoppingCart
                className="h-6 w-6 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">
              Por comprar
            </span>

            <span className="font-medium text-card-foreground">
              {pendingItems.length}{" "}
              {pendingItems.length === 1
                ? "produto"
                : "produtos"}
            </span>
          </div>
        </section>

        {storeGroups.length > 0 ? (
          <div className="space-y-7">
            {storeGroups.map((group) => {
              const groupTotal =
                group.items.reduce(
                  (total, item) =>
                    total +
                    (item.estimatedUnitPrice ??
                      0) *
                      item.quantity,
                  0
                );

              return (
                <section
                  key={
                    group.storeId ??
                    "unassigned"
                  }
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            group.storeColor ??
                            "currentColor",
                        }}
                      />

                      <h2 className="truncate text-xl font-bold text-foreground">
                        {group.storeName}
                      </h2>
                    </div>

                    <span className="shrink-0 text-sm font-medium text-muted-foreground">
                      {formatCurrency(
                        groupTotal
                      )}
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                    {group.items.map(
                      (item, index) => {
                        const baseProduct =
                          mockBaseProducts.find(
                            (product) =>
                              product.id ===
                              item.baseProductId
                          );

                        const selectedProduct =
                          mockProducts.find(
                            (product) =>
                              product.id ===
                              item.selectedProductId
                          );

                        const itemTotal =
                          (item.estimatedUnitPrice ??
                            0) *
                          item.quantity;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              handleCompleteItem(
                                item.id
                              )
                            }
                            className={`
                              flex
                              w-full
                              items-center
                              gap-4
                              px-4
                              py-4
                              text-left
                              transition-colors
                              hover:bg-muted/50
                              active:bg-muted
                              ${
                                index !==
                                group.items.length -
                                  1
                                  ? "border-b border-border"
                                  : ""
                              }
                            `}
                          >
                            <div
                              className="
                                flex
                                h-6
                                w-6
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                border-2
                                border-muted-foreground/40
                                transition-colors
                              "
                            />

                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-card-foreground">
                                {baseProduct?.name ??
                                  "Produto desconhecido"}
                              </p>

                              <p className="mt-1 truncate text-sm text-muted-foreground">
                                {item.quantity} ×{" "}
                                {selectedProduct?.name ??
                                  "Sem produto atribuído"}
                              </p>
                            </div>

                            <span className="shrink-0 text-sm font-semibold text-card-foreground">
                              {item.estimatedUnitPrice !==
                              undefined
                                ? formatCurrency(
                                    itemTotal
                                  )
                                : "—"}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <ShoppingCart
              className="mx-auto h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />

            <p className="mt-4 font-medium text-foreground">
              A lista está vazia
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Adiciona aquilo que está a faltar.
            </p>

            <AppButton
              variant="secondary"
              icon={
                <Plus className="h-4 w-4" />
              }
              onClick={() =>
                setIsAddProductOpen(true)
              }
              className="mt-5"
            >
              Adicionar produto
            </AppButton>
          </div>
        )}

        {completedItems.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-foreground">
                Comprados
              </h2>

              <button
                type="button"
                onClick={
                  handleClearCompletedItems
                }
                className="text-sm font-medium text-destructive"
              >
                Limpar
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-border bg-muted/30">
              {completedItems.map(
                (item, index) => {
                  const baseProduct =
                    mockBaseProducts.find(
                      (product) =>
                        product.id ===
                        item.baseProductId
                    );

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        handleRestoreItem(
                          item.id
                        )
                      }
                      className={`
                        flex
                        w-full
                        items-center
                        gap-4
                        px-4
                        py-3.5
                        text-left
                        transition-colors
                        hover:bg-muted/60
                        active:bg-muted
                        ${
                          index !==
                          completedItems.length -
                            1
                            ? "border-b border-border"
                            : ""
                        }
                      `}
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500 text-white">
                        <Check
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </div>

                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-muted-foreground line-through">
                        {baseProduct?.name ??
                          "Produto desconhecido"}
                      </p>

                      <Undo2
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </button>
                  );
                }
              )}
            </div>
          </section>
        )}
      </div>

      <MobileFullScreenSheet
        open={isAddProductOpen}
        onOpenChange={(nextOpen) => {
          setIsAddProductOpen(nextOpen);

          if (!nextOpen) {
            setProductSearch("");
          }
        }}
      >
        <MobileFullScreenSheetContent
          onClose={() =>
            setIsAddProductOpen(false)
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

                {filteredBaseProducts.length >
                0 ? (
                  <div className="overflow-hidden rounded-3xl border border-border bg-card">
                    {filteredBaseProducts.map(
                      (
                        baseProduct,
                        index
                      ) => {
                        const recommendation =
                          getProductRecommendation(
                            baseProduct.id,
                            mockProducts,
                            mockPriceRecords,
                            mockStores
                          );

                        return (
                          <button
                            key={
                              baseProduct.id
                            }
                            type="button"
                            onClick={() =>
                              handleAddBaseProduct(
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
                  </div>
                )}
              </section>
            </MobileFullScreenSheetBody>

            <MobileFullScreenSheetFooter>
              <AppButton
                variant="ghost"
                onClick={() =>
                  setIsAddProductOpen(false)
                }
              >
                Cancelar
              </AppButton>
            </MobileFullScreenSheetFooter>
          </div>
        </MobileFullScreenSheetContent>
      </MobileFullScreenSheet>
    </>
  );
}