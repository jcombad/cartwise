import {
  ChartColumn,
  Package,
  Plus,
  Settings,
  ShoppingCart,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ActionTile } from "@/components/cards/ActionTile";
import { AppButton } from "@/components/forms/AppButton";
import { AddShoppingProductSheet } from "@/components/shopping/AddShoppingProductSheet";

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

const SHOPPING_LIST_STORAGE_KEY =
  "cartwise-v4-shopping-list";

function getShoppingListItems(): ShoppingListItem[] {
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
       * usamos os itens mock iniciais.
       */
    }
  }

  return mockUserShoppingLists[0]?.items ?? [];
}

function saveShoppingListItems(
  items: ShoppingListItem[]
) {
  localStorage.setItem(
    SHOPPING_LIST_STORAGE_KEY,
    JSON.stringify(items)
  );
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

export default function Dashboard() {
  const navigate = useNavigate();

  const [
    isAddProductOpen,
    setIsAddProductOpen,
  ] = useState(false);

  function handleAddBaseProduct(
    baseProductId: number
  ) {
    const shoppingListItems =
      getShoppingListItems();

    const existingItem =
      shoppingListItems.find(
        (item) =>
          item.baseProductId ===
            baseProductId &&
          !item.completed
      );

    const recommendation =
      getProductRecommendation(
        baseProductId,
        mockProducts,
        mockPriceRecords,
        mockStores
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

      toast.success(
        "Quantidade atualizada",
        {
          description: recommendation
            ? `${recommendation.product.name} · ${recommendation.store.name}`
            : "O produto já estava na lista.",
        }
      );

      return;
    }

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

    toast.success(
      "Produto adicionado à lista",
      {
        description: recommendation
          ? `${recommendation.product.name} · ${recommendation.store.name}`
          : "O produto ficou por atribuir.",
      }
    );
  }

  function handleAddCustomProduct(
  productName: string
) {
  const shoppingListItems =
    getShoppingListItems();

  const normalizedName =
    productName
      .trim()
      .toLocaleLowerCase("pt-PT");

  if (!normalizedName) {
    return;
  }

  const existingItem =
    shoppingListItems.find(
      (item) =>
        !item.completed &&
        item.customName
          ?.trim()
          .toLocaleLowerCase("pt-PT") ===
          normalizedName
    );

  if (existingItem) {
    const nextItems =
      shoppingListItems.map((item) =>
        item.id === existingItem.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );

    saveShoppingListItems(nextItems);

    toast.success(
      "Quantidade atualizada",
      {
        description:
          productName.trim(),
      }
    );

    return;
  }

  const newItem: ShoppingListItem = {
    id: getNextItemId(
      shoppingListItems
    ),

    customName: productName.trim(),
    quantity: 1,

    assignmentMode: "automatic",

    completed: false,
  };

  saveShoppingListItems([
    ...shoppingListItems,
    newItem,
  ]);

  toast.success(
    "Produto adicionado à lista",
    {
      description: `${productName.trim()} · Por atribuir`,
    }
  );
}

  return (
    <>
      <div className="space-y-8">
        <section className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              CartWise
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Organiza as compras e encontra automaticamente
              onde cada produto fica mais barato.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted">
                <ShoppingCart
                  className="h-6 w-6 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Lista de compras
                </p>

                <h2 className="mt-1 text-xl font-bold text-card-foreground">
                  O que está a faltar?
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Adiciona produtos e o CartWise distribui-os
                  automaticamente pelos supermercados recomendados.
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <AppButton
                variant="secondary"
                className="flex-1"
                icon={
                  <Plus className="h-4 w-4" />
                }
                onClick={() =>
                  setIsAddProductOpen(true)
                }
              >
                Adicionar
              </AppButton>

              <AppButton
                className="flex-1"
                onClick={() =>
                  navigate("/shoppinglists")
                }
              >
                Abrir lista
              </AppButton>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Ações rápidas
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <ActionTile
              title="Lista"
              icon={ShoppingCart}
              onClick={() =>
                navigate("/shoppinglists")
              }
            />

            <ActionTile
              title="Produtos"
              icon={Package}
              onClick={() =>
                navigate("/products")
              }
            />

            <ActionTile
              title="Estatísticas"
              icon={ChartColumn}
              onClick={() =>
                navigate("/statistics")
              }
            />

            <ActionTile
              title="Definições"
              icon={Settings}
              onClick={() =>
                navigate("/settings")
              }
            />
          </div>
        </section>
      </div>

      <AddShoppingProductSheet
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        onSelectBaseProduct={
            handleAddBaseProduct
          }
        onAddCustomProduct={
            handleAddCustomProduct
          }
        />
    </>
  );
}