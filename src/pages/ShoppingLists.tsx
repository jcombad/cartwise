import {
  ArrowLeft,
  Check,
  ShoppingCart,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { ShoppingList } from "@/data/mockShoppingLists";

type ShoppingListsProps = {
  shoppingLists: ShoppingList[];
  onToggleProduct: (
    shoppingListId: number,
    productId: number
  ) => void;
};

export default function ShoppingLists({
  shoppingLists,
  onToggleProduct,
}: ShoppingListsProps) {
  const navigate = useNavigate();
  const { listId } = useParams();

  const selectedShoppingList = shoppingLists.find(
    (list) => list.id === Number(listId)
  );

  if (!listId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Listas de compras
          </h1>

          <p className="mt-2 text-muted-foreground">
            Gere as tuas listas de compras.
          </p>
        </div>

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <ShoppingCart
                className="h-7 w-7 text-muted-foreground"
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Gestão de listas
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                A criação e gestão das listas será implementada
                numa próxima etapa.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedShoppingList) {
    return (
      <div className="space-y-6">
        <Button
          type="button"
          variant="ghost"
          className="-ml-3"
          onClick={() => navigate("/")}
        >
          <ArrowLeft
            className="mr-2 h-4 w-4"
            aria-hidden="true"
          />

          Voltar
        </Button>

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold">
              Lista não encontrada
            </h1>

            <p className="mt-2 text-muted-foreground">
              A lista de compras que tentou abrir não existe.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const products = selectedShoppingList.products;

  const productCount = products.length;

  const completedProducts = products.filter(
    (product) => product.completed
  ).length;

  const estimatedTotal = products.reduce(
    (total, product) => total + product.price,
    0
  );

  const progress =
    productCount > 0
      ? (completedProducts / productCount) * 100
      : 0;

  const completed =
    productCount > 0 &&
    completedProducts === productCount;

  const formattedTotal = new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(estimatedTotal);

  function handleToggleProduct(productId: number) {
      if (!selectedShoppingList) {
    return;
  }
    onToggleProduct(
      selectedShoppingList.id,
      productId
    );
  }

  function handleBackToDashboard() {
     if (!selectedShoppingList) {
    return;
  }
    navigate(
      `/?store=${selectedShoppingList.id}`
    );
  }

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        className="-ml-3"
        onClick={handleBackToDashboard}
      >
        <ArrowLeft
          className="mr-2 h-4 w-4"
          aria-hidden="true"
        />

        Voltar
      </Button>

      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Lista de compras
        </p>

        <h1 className="text-3xl font-bold">
          {selectedShoppingList.store}
        </h1>
      </div>

      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `${selectedShoppingList.color}20`,
                }}
              >
                <ShoppingCart
                  className="h-6 w-6"
                  style={{
                    color: selectedShoppingList.color,
                  }}
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Total estimado
                </p>

                <p className="text-2xl font-bold">
                  {formattedTotal}
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
              aria-label={`Progresso das compras no ${selectedShoppingList.store}`}
              aria-valuemin={0}
              aria-valuemax={productCount}
              aria-valuenow={completedProducts}
            >
              <div
                className="h-full rounded-full transition-[width] duration-300 ease-out"
                style={{
                  width: `${progress}%`,
                  backgroundColor:
                    selectedShoppingList.color,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Produtos
          </h2>

          <span className="text-sm text-muted-foreground">
            {productCount}{" "}
            {productCount === 1 ? "produto" : "produtos"}
          </span>
        </div>

        <Card className="overflow-hidden rounded-3xl border-0 py-0 shadow-sm">
          <CardContent className="divide-y p-0">
            {products.map((product) => {
              const formattedPrice =
                new Intl.NumberFormat("pt-PT", {
                  style: "currency",
                  currency: "EUR",
                }).format(product.price);

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() =>
                    handleToggleProduct(product.id)
                  }
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <div
                    className={`
                      flex
                      h-6
                      w-6
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      transition-colors
                      ${
                        product.completed
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-muted-foreground/40"
                      }
                    `}
                  >
                    {product.completed && (
                      <Check
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`
                        font-medium
                        ${
                          product.completed
                            ? "text-muted-foreground line-through"
                            : ""
                        }
                      `}
                    >
                      {product.name}
                    </p>
                  </div>

                  <span
                    className={`
                      shrink-0
                      text-sm
                      font-semibold
                      ${
                        product.completed
                          ? "text-muted-foreground line-through"
                          : ""
                      }
                    `}
                  >
                    {formattedPrice}
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}