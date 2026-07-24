import {
  Check,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { ShoppingList } from "@/data/mockShoppingLists";

type ShoppingListCardProps = {
  shoppingList: ShoppingList;
  onOpen?: () => void;
};

export function ShoppingListCard({
  shoppingList,
  onOpen,
}: ShoppingListCardProps) {
  const productCount = shoppingList.products.length;

  const completedProducts = shoppingList.products.filter(
    (product) => product.completed
  ).length;

  const estimatedTotal = shoppingList.products.reduce(
    (total, product) => total + product.price,
    0
  );

  const completed =
    productCount > 0 &&
    completedProducts === productCount;

  const progress =
    productCount > 0
      ? (completedProducts / productCount) * 100
      : 0;

  const formattedTotal = new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(estimatedTotal);

  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `${shoppingList.color}20`,
              }}
            >
              <ShoppingCart
                className="h-6 w-6"
                style={{
                  color: shoppingList.color,
                }}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                {shoppingList.store}
              </h2>

              <p className="text-sm text-muted-foreground">
                {productCount}{" "}
                {productCount === 1
                  ? "produto"
                  : "produtos"}
              </p>
            </div>
          </div>

          {completed && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Check
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              Concluída
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Total estimado
          </p>

          <p className="text-4xl font-bold tracking-tight">
            {formattedTotal}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              Progresso
            </span>

            <span className="font-medium">
              {completedProducts} de {productCount} comprados
            </span>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label={`Progresso das compras no ${shoppingList.store}`}
            aria-valuemin={0}
            aria-valuemax={productCount}
            aria-valuenow={completedProducts}
          >
            <div
              className="h-full rounded-full transition-[width] duration-300 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: shoppingList.color,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            {completed
              ? "Compras concluídas"
              : "Por concluir"}
          </span>

          <Button
            type="button"
            onClick={onOpen}
          >
            {completed
              ? "Ver lista"
              : "Abrir"}

            <ChevronRight
              className="ml-2 h-4 w-4"
              aria-hidden="true"
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}