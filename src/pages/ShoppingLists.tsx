import {
  Check,
  Plus,
  ShoppingCart,
  Undo2,
} from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

import { AppButton } from "@/components/forms/AppButton";

import AddProductDrawer, {
  type AddPriceFormData,
  type AddProductFormData,
  type AddProductResult,
} from "@/components/products/AddProductDrawer";

import { AddShoppingProductSheet } from "@/components/shopping/AddShoppingProductSheet";
import { ChooseShoppingStoreSheet } from "@/components/shopping/ChooseShoppingStoreSheet";
import { ShoppingItemQuantitySheet } from "@/components/shopping/ShoppingItemQuantitySheet";
import { ShoppingListItemRow } from "@/components/shopping/ShoppingListItemRow";
import { UnassignedShoppingItemSheet } from "@/components/shopping/UnassignedShoppingItemSheet";

import { mockStores } from "@/data/mockStores";
import { mockUserShoppingLists } from "@/data/mockUserShoppingLists";

import {
  addCatalogPrice,
  addCatalogProduct,
} from "@/lib/catalogService";

import { getStoredCatalog } from "@/lib/catalogStorage";

import {
  getProductRecommendation,
} from "@/lib/shoppingListHelpers";

import type {
  ShoppingListItem,
} from "@/types";

/*
 * Estas props são mantidas temporariamente para não partir
 * possíveis utilizações antigas do componente.
 *
 * Serão removidas quando fizermos a limpeza final da Fase 5.
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
   * lista mock para não começar com o ecrã vazio.
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
    selectedUnassignedItemId,
    setSelectedUnassignedItemId,
  ] = useState<number | null>(null);

  const [
    isAddProductDrawerOpen,
    setIsAddProductDrawerOpen,
  ] = useState(false);

  const [
    initialBaseProductName,
    setInitialBaseProductName,
  ] = useState<string | null>(null);

  /*
   * Guarda o item livre que está a ser convertido
   * num produto real do catálogo.
   */
  const [
    catalogItemId,
    setCatalogItemId,
  ] = useState<number | null>(null);

  /*
   * Controla a sheet de seleção de supermercado.
   */
  const [
    isChooseStoreOpen,
    setIsChooseStoreOpen,
  ] = useState(false);

  /*
   * Guarda o item livre cujo supermercado
   * está a ser escolhido manualmente.
   */
  const [
    storeSelectionItemId,
    setStoreSelectionItemId,
  ] = useState<number | null>(null);

  /*
   * Guarda o item cuja quantidade
   * está a ser editada.
   */
  const [
    quantityItemId,
    setQuantityItemId,
  ] = useState<number | null>(null);

  /*
   * Lemos sempre o catálogo atual guardado pela aplicação,
   * incluindo os produtos criados pelo utilizador.
   */
  const {
    baseProducts,
    products,
    priceRecords,
  } = getStoredCatalog();

  const pendingItems =
    shoppingListItems.filter(
      (item) => !item.completed
    );

  const completedItems =
    shoppingListItems.filter(
      (item) => item.completed
    );

  const selectedUnassignedItem =
    shoppingListItems.find(
      (item) =>
        item.id ===
        selectedUnassignedItemId
    );

  const storeSelectionItem =
    shoppingListItems.find(
      (item) =>
        item.id ===
        storeSelectionItemId
    );

  const quantityItem =
    shoppingListItems.find(
      (item) =>
        item.id === quantityItemId
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
     * Se o produto já estiver pendente,
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

      return;
    }

    const recommendation =
      getProductRecommendation(
        baseProductId,
        products,
        priceRecords,
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
  }

  function handleAddCustomProduct(
    productName: string
  ) {
    const trimmedName =
      productName.trim();

    const normalizedName =
      trimmedName.toLocaleLowerCase(
        "pt-PT"
      );

    if (!normalizedName) {
      return;
    }

    const existingItem =
      shoppingListItems.find(
        (item) =>
          !item.completed &&
          item.customName
            ?.trim()
            .toLocaleLowerCase(
              "pt-PT"
            ) === normalizedName
      );

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

      return;
    }

    const newItem: ShoppingListItem = {
      id: getNextItemId(
        shoppingListItems
      ),

      customName: trimmedName,
      quantity: 1,

      assignmentMode: "automatic",

      completed: false,
    };

    saveShoppingListItems([
      ...shoppingListItems,
      newItem,
    ]);
  }

  function handleShoppingItemClick(
    item: ShoppingListItem
  ) {
    /*
     * Quando o produto ainda é um item livre,
     * abrimos as opções de supermercado ou catálogo.
     *
     * Isto também permite voltar a alterar o supermercado
     * de um item livre já atribuído manualmente.
     */
    if (
      item.baseProductId === undefined &&
      item.customName
    ) {
      setSelectedUnassignedItemId(
        item.id
      );

      return;
    }

    handleCompleteItem(item.id);
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

  function handleCreateCatalogProduct(
    formData: AddProductFormData
  ): AddProductResult {
    const result =
      addCatalogProduct(formData);

    if (!result.success) {
      return {
        success: false,
      };
    }

    /*
     * O serviço já devolve o catálogo atualizado.
     * Calculamos agora a recomendação para o Produto Base
     * que acabou de ser criado ou encontrado.
     */
    const recommendation =
      getProductRecommendation(
        result.baseProductId,
        result.products,
        result.priceRecords,
        mockStores
      );

    /*
     * Se o formulário foi aberto através de um item livre,
     * convertemos esse mesmo item num item normal.
     *
     * Mantemos o ID, a quantidade e o estado atual.
     */
    if (catalogItemId !== null) {
      const nextItems =
        shoppingListItems.map((item) => {
          if (item.id !== catalogItemId) {
            return item;
          }

          return {
            ...item,

            baseProductId:
              result.baseProductId,

            customName: undefined,

            recommendedProductId:
              recommendation?.product.id,

            recommendedStoreId:
              recommendation?.store.id,

            selectedProductId:
              recommendation?.product.id,

            selectedStoreId:
              recommendation?.store.id,

            assignmentMode:
              "automatic" as const,

            estimatedUnitPrice:
              recommendation?.effectivePrice,
          };
        });

      saveShoppingListItems(nextItems);
    }

    setCatalogItemId(null);

    return {
      success: true,
      action: result.action,
      productName: result.productName,
    };
  }

  function handleAddCatalogPrice(
    formData: AddPriceFormData
  ): boolean {
    const result =
      addCatalogPrice(formData);

    return result.success;
  }

  function handleChooseStore() {
    if (!selectedUnassignedItem) {
      return;
    }

    const itemId =
      selectedUnassignedItem.id;

    /*
     * Fechamos primeiro a sheet de opções.
     */
    setSelectedUnassignedItemId(null);

    /*
     * Abrimos a sheet dos supermercados apenas
     * depois da anterior ser desmontada.
     */
    window.setTimeout(() => {
      setStoreSelectionItemId(itemId);
      setIsChooseStoreOpen(true);
    }, 0);
  }

  function handleSelectStore(
    storeId: number
  ) {
    if (storeSelectionItemId === null) {
      return;
    }

    const nextItems =
      shoppingListItems.map((item) =>
        item.id === storeSelectionItemId
          ? {
              ...item,

              selectedStoreId:
                storeId,

              assignmentMode:
                "manual" as const,
            }
          : item
      );

    saveShoppingListItems(nextItems);

    setIsChooseStoreOpen(false);
    setStoreSelectionItemId(null);
  }

  function handleIncreaseQuantity() {
    if (quantityItemId === null) {
      return;
    }

    const nextItems =
      shoppingListItems.map((item) =>
        item.id === quantityItemId
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      );

    saveShoppingListItems(nextItems);
  }

  function handleDecreaseQuantity() {
    if (quantityItemId === null) {
      return;
    }

    const nextItems =
      shoppingListItems.map((item) =>
        item.id === quantityItemId
          ? {
              ...item,
              quantity: Math.max(
                1,
                item.quantity - 1
              ),
            }
          : item
      );

    saveShoppingListItems(nextItems);
  }

  function handleRemoveItem(
  itemId: number
) {
  const removedItem =
    shoppingListItems.find(
      (item) => item.id === itemId
    );

  if (!removedItem) {
    return;
  }

  const removedItemIndex =
    shoppingListItems.findIndex(
      (item) => item.id === itemId
    );

  const baseProduct =
    baseProducts.find(
      (product) =>
        product.id ===
        removedItem.baseProductId
    );

  const itemName =
    baseProduct?.name ??
    removedItem.customName ??
    "Produto";

  const nextItems =
    shoppingListItems.filter(
      (item) => item.id !== itemId
    );

  saveShoppingListItems(nextItems);

  toast(`${itemName} removido`, {
    action: {
      label: "Desfazer",

      onClick: () => {
        setShoppingListItems(
          (currentItems) => {
            /*
             * Evita restaurar duas vezes
             * o mesmo item.
             */
            if (
              currentItems.some(
                (item) =>
                  item.id ===
                  removedItem.id
              )
            ) {
              return currentItems;
            }

            const nextRestoredItems = [
              ...currentItems,
            ];

            const restoreIndex =
              Math.min(
                removedItemIndex,
                nextRestoredItems.length
              );

            nextRestoredItems.splice(
              restoreIndex,
              0,
              removedItem
            );

            localStorage.setItem(
              SHOPPING_LIST_STORAGE_KEY,
              JSON.stringify(
                nextRestoredItems
              )
            );

            return nextRestoredItems;
          }
        );
      },
    },
  });
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

      storeColor:
        store?.color,

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
                          baseProducts.find(
                            (product) =>
                              product.id ===
                              item.baseProductId
                          );

                        const selectedProduct =
                          products.find(
                            (product) =>
                              product.id ===
                              item.selectedProductId
                          );

                        return (
                          <ShoppingListItemRow
                            key={item.id}
                            item={item}
                            baseProduct={
                              baseProduct
                            }
                            selectedProduct={
                              selectedProduct
                            }
                            isLastItem={
                              index ===
                              group.items.length -
                                1
                            }
                            onClick={
                              handleShoppingItemClick
                            }
                            onComplete={
                              handleCompleteItem
                            }
                            onQuantityClick={
                              setQuantityItemId
                            }
                            onRemove={
                              handleRemoveItem
                            }
                          />
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
                    baseProducts.find(
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
                          item.customName ??
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

      <AddShoppingProductSheet
        open={isAddProductOpen}
        onOpenChange={
          setIsAddProductOpen
        }
        onSelectBaseProduct={
          handleAddBaseProduct
        }
        onAddCustomProduct={
          handleAddCustomProduct
        }
      />

      <UnassignedShoppingItemSheet
        open={
          selectedUnassignedItem !==
          undefined
        }
        productName={
          selectedUnassignedItem
            ?.customName ?? ""
        }
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setSelectedUnassignedItemId(
              null
            );
          }
        }}
        onCreateProduct={() => {
          if (
            !selectedUnassignedItem
              ?.customName
          ) {
            return;
          }

          const itemId =
            selectedUnassignedItem.id;

          const productName =
            selectedUnassignedItem
              .customName;

          /*
           * Primeiro fechamos completamente
           * a sheet do item por atribuir.
           */
          setSelectedUnassignedItemId(
            null
          );

          /*
           * Só no ciclo seguinte abrimos
           * o formulário de criação.
           */
          window.setTimeout(() => {
            setCatalogItemId(itemId);

            setInitialBaseProductName(
              productName
            );

            setIsAddProductDrawerOpen(
              true
            );
          }, 0);
        }}
        onChooseStore={
          handleChooseStore
        }
      />

      <ChooseShoppingStoreSheet
        open={isChooseStoreOpen}
        productName={
          storeSelectionItem
            ?.customName ?? ""
        }
        stores={mockStores}
        onOpenChange={(nextOpen) => {
          setIsChooseStoreOpen(
            nextOpen
          );

          if (!nextOpen) {
            setStoreSelectionItemId(
              null
            );
          }
        }}
        onSelectStore={
          handleSelectStore
        }
      />

      <ShoppingItemQuantitySheet
        open={
          quantityItem !== undefined
        }
        productName={
          baseProducts.find(
            (baseProduct) =>
              baseProduct.id ===
              quantityItem?.baseProductId
          )?.name ??
          quantityItem?.customName ??
          ""
        }
        quantity={
          quantityItem?.quantity ?? 1
        }
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setQuantityItemId(null);
          }
        }}
        onDecrease={
          handleDecreaseQuantity
        }
        onIncrease={
          handleIncreaseQuantity
        }
      />

      <AddProductDrawer
        key={
          initialBaseProductName ??
          "standard-product-drawer"
        }
        open={
          isAddProductDrawerOpen
        }
        initialBaseProductName={
          initialBaseProductName
        }
        baseProducts={baseProducts}
        products={products}
        priceRecords={priceRecords}
        onOpenChange={(nextOpen) => {
          setIsAddProductDrawerOpen(
            nextOpen
          );

          if (!nextOpen) {
            setInitialBaseProductName(
              null
            );

            setCatalogItemId(null);
          }
        }}
        onSubmit={
          handleCreateCatalogProduct
        }
        onAddPrice={
          handleAddCatalogPrice
        }
      />
    </>
  );
}