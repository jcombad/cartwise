import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Star,
  Tag,
} from "lucide-react";

import { AppButton } from "../forms/AppButton";

import {
  MobileFullScreenSheet,
  MobileFullScreenSheetBody,
  MobileFullScreenSheetContent,
  MobileFullScreenSheetFooter,
  MobileFullScreenSheetHeader,
  MobileFullScreenSheetTitle,
} from "../layout/MobileFullScreenSheet";

import type {
  BaseProduct,
  PriceRecord,
  Product,
  Store,
} from "../../types";

type ProductDetailsSheetProps = {
  open: boolean;
  product?: Product;
  baseProduct?: BaseProduct;
  products: Product[];
  priceRecords: PriceRecord[];
  stores: Store[];
  onOpenChange: (open: boolean) => void;
  onAddPrice: () => void;
  onSelectProduct: (productId: number) => void;
};

type ComparableProduct = {
  product: Product;
  latestPriceRecord: PriceRecord;
  store?: Store;
  effectivePrice: number;
  unitPrice: number;
  difference: number;
  percentageDifference: number;
  isCurrentProduct: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatDifference(value: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
}

function formatPercentage(value: number) {
  return new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(value));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatRelativeDate(date: string) {
  const today = new Date();
  const targetDate = new Date(`${date}T00:00:00`);

  today.setHours(0, 0, 0, 0);

  const differenceInDays = Math.round(
    (today.getTime() - targetDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (differenceInDays === 0) {
    return "Hoje";
  }

  if (differenceInDays === 1) {
    return "Ontem";
  }

  if (differenceInDays < 7) {
    return `há ${differenceInDays} dias`;
  }

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
  }).format(targetDate);
}

function formatPackage(product: Product) {
  const unitLabel =
    product.packageUnit === "unit"
      ? product.packageQuantity === 1
        ? "unidade"
        : "unidades"
      : product.packageUnit === "l"
        ? "L"
        : product.packageUnit;

  return `${product.packageQuantity} ${unitLabel}`;
}

function getEffectivePrice(
  priceRecord: PriceRecord
) {
  return (
    priceRecord.promotionalPrice ??
    priceRecord.regularPrice
  );
}

function getNormalizedQuantity(product: Product) {
  switch (product.packageUnit) {
    case "g":
      return product.packageQuantity / 1000;

    case "ml":
      return product.packageQuantity / 1000;

    default:
      return product.packageQuantity;
  }
}

function getUnitPrice(
  product: Product,
  priceRecord: PriceRecord
) {
  const normalizedQuantity =
    getNormalizedQuantity(product);

  if (normalizedQuantity <= 0) {
    return null;
  }

  return (
    getEffectivePrice(priceRecord) /
    normalizedQuantity
  );
}

function getComparisonUnitLabel(
  baseProduct?: BaseProduct
) {
  switch (baseProduct?.comparisonUnit) {
    case "kg":
      return "kg";

    case "l":
      return "L";

    case "unit":
      return "un.";

    default:
      return null;
  }
}

function getSortedPriceRecords(
  productId: number,
  priceRecords: PriceRecord[]
) {
  return priceRecords
    .filter(
      (priceRecord) =>
        priceRecord.productId === productId
    )
    .sort((firstRecord, secondRecord) => {
      const dateDifference =
        new Date(secondRecord.date).getTime() -
        new Date(firstRecord.date).getTime();

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return secondRecord.id - firstRecord.id;
    });
}

export function ProductDetailsSheet({
  open,
  product,
  baseProduct,
  products,
  priceRecords,
  stores,
  onOpenChange,
  onAddPrice,
  onSelectProduct,
}: ProductDetailsSheetProps) {
  if (!product) {
    return null;
  }

  const productPriceRecords =
    getSortedPriceRecords(
      product.id,
      priceRecords
    );

  const latestPriceRecord =
    productPriceRecords[0];

  const latestStore = latestPriceRecord
    ? stores.find(
        (store) =>
          store.id === latestPriceRecord.storeId
      )
    : undefined;

  const latestUnitPrice = latestPriceRecord
    ? getUnitPrice(
        product,
        latestPriceRecord
      )
    : null;

  const comparisonUnitLabel =
    getComparisonUnitLabel(baseProduct);

  const comparisonOrderLabel =
  comparisonUnitLabel === "kg"
    ? "Ordenado pelo preço por kg"
    : comparisonUnitLabel === "L"
      ? "Ordenado pelo preço por litro"
      : comparisonUnitLabel === "un."
        ? "Ordenado pelo preço por unidade"
        : null;  

  const comparableProducts: ComparableProduct[] =
    latestUnitPrice !== null
      ? products
          .filter(
            (item) =>
              item.baseProductId ===
              product.baseProductId
          )
          .map((item) => {
            const itemLatestPriceRecord =
              getSortedPriceRecords(
                item.id,
                priceRecords
              )[0];

            if (!itemLatestPriceRecord) {
              return null;
            }

            const itemUnitPrice = getUnitPrice(
              item,
              itemLatestPriceRecord
            );

            if (itemUnitPrice === null) {
              return null;
            }

            const difference =
              itemUnitPrice - latestUnitPrice;

            const percentageDifference =
              latestUnitPrice > 0
                ? (difference /
                    latestUnitPrice) *
                  100
                : 0;

            const store = stores.find(
              (storeItem) =>
                storeItem.id ===
                itemLatestPriceRecord.storeId
            );

            return {
              product: item,
              latestPriceRecord:
                itemLatestPriceRecord,
              store,
              effectivePrice:
                getEffectivePrice(
                  itemLatestPriceRecord
                ),
              unitPrice: itemUnitPrice,
              difference,
              percentageDifference,
              isCurrentProduct:
                item.id === product.id,
            };
          })
          .filter(
            (
              item
            ): item is ComparableProduct =>
              item !== null
          )
          .sort(
            (firstItem, secondItem) =>
              firstItem.unitPrice -
              secondItem.unitPrice
          )
      : [];

  const hasComparison =
    comparableProducts.length > 1;

  return (
    <MobileFullScreenSheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <MobileFullScreenSheetContent
        onClose={() => onOpenChange(false)}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <MobileFullScreenSheetHeader>
            <AppButton
              variant="ghost"
              fullWidth={false}
              icon={
                <ChevronLeft className="h-4 w-4" />
              }
              onClick={() =>
                onOpenChange(false)
              }
              className="-ml-3 mb-1 min-h-9 px-3 py-1.5 text-sm"
            >
              Voltar
            </AppButton>

            <MobileFullScreenSheetTitle>
              {product.name}
            </MobileFullScreenSheetTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              {[
                product.brand,
                formatPackage(product),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </MobileFullScreenSheetHeader>

          <MobileFullScreenSheetBody className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {baseProduct?.name ??
                  "Produto base desconhecido"}
              </p>

              {latestPriceRecord ? (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Último preço
                  </p>

                  <div className="mt-1 flex items-end justify-between gap-4">
                    <div>
                      {latestPriceRecord.promotion &&
                        latestPriceRecord.promotionalPrice !==
                          undefined && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatCurrency(
                              latestPriceRecord.regularPrice
                            )}
                          </p>
                        )}

                      <p className="text-4xl font-bold tracking-tight text-card-foreground">
                        {formatCurrency(
                          getEffectivePrice(
                            latestPriceRecord
                          )
                        )}
                      </p>

                      {latestUnitPrice !== null &&
                        comparisonUnitLabel && (
                          <p className="mt-1 text-sm font-medium text-muted-foreground">
                            {formatCurrency(
                              latestUnitPrice
                            )}
                            /{comparisonUnitLabel}
                          </p>
                        )}
                    </div>

                    {latestPriceRecord.promotion && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        <Tag
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />

                        Promoção
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {latestStore && (
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              latestStore.color,
                          }}
                        />
                      )}

                      <span>
                        {latestStore?.name ??
                          "Supermercado desconhecido"}
                      </span>
                    </div>

                    <time
                      dateTime={
                        latestPriceRecord.date
                      }
                    >
                      {formatDate(
                        latestPriceRecord.date
                      )}
                    </time>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Ainda não existem preços registados.
                </p>
              )}
            </section>

            {hasComparison &&
              comparisonUnitLabel && (
                <section className="space-y-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-foreground">
                            Comparação
                        </h2>

                        <span className="shrink-0 text-sm text-muted-foreground">
                            {baseProduct?.name}
                        </span>
                    </div>

                    {comparisonOrderLabel && (
                        <p className="text-xs text-muted-foreground">
                            {comparisonOrderLabel}
                        </p>
                    )}
                </div>

                  <div className="overflow-hidden rounded-3xl border border-border bg-card">
                    {comparableProducts.map(
                      (
                        comparison,
                        index
                      ) => {
                        const isCheaper =
                          comparison.difference <
                          -0.000001;

                        const isMoreExpensive =
                          comparison.difference >
                          0.000001;

                        return (
                          <button
                            key={comparison.product.id}
                            type="button"
                            disabled={comparison.isCurrentProduct}
                            onClick={() =>
                                onSelectProduct(comparison.product.id)
                            }
                            className={`
                              flex
                              w-full
                              items-center
                              justify-between
                              gap-4
                              px-4
                              py-4
                              text-left
                              transition-colors
                              ${
                                comparison.isCurrentProduct
                                  ? "cursor-default bg-primary/5"
                                  : "hover:bg-muted/50 active:bg-muted"
                              }
                              ${
                                index !==
                                comparableProducts.length - 1
                                  ? "border-b border-border"
                                  : ""
                              }
                            `}
                          >
                            <div className="min-w-0">
                              {comparison.isCurrentProduct && (
                                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary">
                                  <Star
                                    className="h-3.5 w-3.5 fill-current"
                                    aria-hidden="true"
                                  />

                                  Produto atual
                                </div>
                              )}

                              <p className="font-semibold text-card-foreground">
                                {
                                  comparison
                                    .product.name
                                }
                              </p>

                              <p className="mt-1 text-sm text-muted-foreground">
                                {[
                                  comparison
                                    .product.brand,
                                  formatPackage(
                                    comparison.product
                                  ),
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>

                              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                {comparison.store && (
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{
                                      backgroundColor:
                                        comparison
                                          .store
                                          .color,
                                    }}
                                  />
                                )}

                                <span>
                                  {comparison.store?.name ??
                                    "Supermercado desconhecido"}
                                  {" · "}
                                  {formatRelativeDate(
                                    comparison.latestPriceRecord.date
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              {comparison
                                .latestPriceRecord
                                .promotion &&
                                comparison
                                  .latestPriceRecord
                                  .promotionalPrice !==
                                  undefined && (
                                  <p className="text-xs text-muted-foreground line-through">
                                    {formatCurrency(
                                      comparison
                                        .latestPriceRecord
                                        .regularPrice
                                    )}
                                  </p>
                                )}

                              <p className="font-bold text-card-foreground">
                                {formatCurrency(
                                  comparison.effectivePrice
                                )}
                              </p>

                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {formatCurrency(
                                  comparison.unitPrice
                                )}
                                /
                                {comparisonUnitLabel}
                              </p>

                              {comparison.isCurrentProduct ? (
                                <p className="mt-2 text-xs font-semibold text-muted-foreground">
                                  Referência
                                </p>
                              ) : (
                                <div
                                  className={`
                                    mt-2
                                    flex
                                    items-center
                                    justify-end
                                    gap-1
                                    text-xs
                                    font-semibold
                                    ${
                                      isCheaper
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : isMoreExpensive
                                          ? "text-red-600 dark:text-red-400"
                                          : "text-muted-foreground"
                                    }
                                  `}
                                >
                                  {isCheaper && (
                                    <ChevronDown
                                      className="h-3.5 w-3.5"
                                      aria-hidden="true"
                                    />
                                  )}

                                  {isMoreExpensive && (
                                    <ChevronUp
                                      className="h-3.5 w-3.5"
                                      aria-hidden="true"
                                    />
                                  )}

                                  {!isCheaper &&
                                  !isMoreExpensive ? (
                                    <span>
                                      Mesmo preço
                                    </span>
                                  ) : (
                                    <span>
                                      {formatDifference(
                                        comparison.difference
                                      )}
                                      /
                                      {
                                        comparisonUnitLabel
                                      }{" "}
                                      (
                                      {isCheaper
                                        ? "-"
                                        : "+"}
                                      {formatPercentage(
                                        comparison.percentageDifference
                                      )}
                                      %)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>

                  <p className="px-1 text-xs leading-relaxed text-muted-foreground">
                    As diferenças são calculadas em
                    relação ao produto que estás a
                    consultar.
                  </p>
                </section>
              )}

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  Histórico de preços
                </h2>

                <span className="text-sm text-muted-foreground">
                  {productPriceRecords.length}{" "}
                  {productPriceRecords.length === 1
                    ? "registo"
                    : "registos"}
                </span>
              </div>

              {productPriceRecords.length > 0 ? (
                <div className="overflow-hidden rounded-3xl border border-border bg-card">
                  {productPriceRecords.map(
                    (priceRecord, index) => {
                      const store = stores.find(
                        (item) =>
                          item.id ===
                          priceRecord.storeId
                      );

                      const effectivePrice =
                        getEffectivePrice(
                          priceRecord
                        );

                      const unitPrice =
                        getUnitPrice(
                          product,
                          priceRecord
                        );

                      return (
                        <div
                          key={priceRecord.id}
                          className={`
                            flex
                            items-center
                            justify-between
                            gap-4
                            px-4
                            py-4
                            ${
                              index !==
                              productPriceRecords.length -
                                1
                                ? "border-b border-border"
                                : ""
                            }
                          `}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {store && (
                                <span
                                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                                  style={{
                                    backgroundColor:
                                      store.color,
                                  }}
                                />
                              )}

                              <p className="font-semibold text-card-foreground">
                                {store?.name ??
                                  "Supermercado desconhecido"}
                              </p>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatDate(
                                priceRecord.date
                              )}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            {priceRecord.promotion &&
                              priceRecord.promotionalPrice !==
                                undefined && (
                                <p className="text-xs text-muted-foreground line-through">
                                  {formatCurrency(
                                    priceRecord.regularPrice
                                  )}
                                </p>
                              )}

                            <p className="font-bold text-card-foreground">
                              {formatCurrency(
                                effectivePrice
                              )}
                            </p>

                            {unitPrice !== null &&
                              comparisonUnitLabel && (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {formatCurrency(
                                    unitPrice
                                  )}
                                  /
                                  {
                                    comparisonUnitLabel
                                  }
                                </p>
                              )}

                            {priceRecord.promotion && (
                              <p className="mt-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                                Promoção
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-6 text-center">
                  <p className="font-medium">
                    Sem histórico
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Regista o primeiro preço deste
                    produto.
                  </p>
                </div>
              )}
            </section>
          </MobileFullScreenSheetBody>

          <MobileFullScreenSheetFooter>
            <AppButton onClick={onAddPrice}>
              Adicionar novo preço
            </AppButton>
          </MobileFullScreenSheetFooter>
        </div>
      </MobileFullScreenSheetContent>
    </MobileFullScreenSheet>
  );
}