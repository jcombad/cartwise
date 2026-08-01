import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { AppButton } from "../components/forms/AppButton";
import { AppInput } from "../components/forms/AppInput";

import AddProductDrawer, {
  type AddPriceFormData,
  type AddProductFormData,
  type AddProductResult,
} from "../components/products/AddProductDrawer";

import { ProductDetailsSheet } from "../components/products/ProductDetailsSheet";

import { mockBaseProducts } from "../data/mockBaseProducts";
import { mockPriceRecords } from "../data/mockPriceRecords";
import { mockProducts } from "../data/mockProducts";
import { mockStores } from "../data/mockStores";

import {
  createBaseProduct,
  createPriceRecord,
  createProduct,
  getNextId,
  normalizeText,
} from "../lib/productHelpers";

import type {
  BaseProduct,
  MeasurementUnit,
  PriceRecord,
  Product,
} from "../types";

/*
 * Usamos novas chaves para não carregar os dados antigos,
 * que ainda não tinham baseProductId.
 */
const BASE_PRODUCTS_STORAGE_KEY =
  "cartwise-v2-base-products";

const PRODUCTS_STORAGE_KEY =
  "cartwise-v2-products";

const PRICE_RECORDS_STORAGE_KEY =
  "cartwise-v2-price-records";

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function getInitialBaseProducts(): BaseProduct[] {
  const storedBaseProducts = localStorage.getItem(
    BASE_PRODUCTS_STORAGE_KEY
  );

  if (!storedBaseProducts) {
    return mockBaseProducts;
  }

  try {
    return JSON.parse(
      storedBaseProducts
    ) as BaseProduct[];
  } catch {
    return mockBaseProducts;
  }
}

function getInitialProducts(): Product[] {
  const storedProducts = localStorage.getItem(
    PRODUCTS_STORAGE_KEY
  );

  if (!storedProducts) {
    return mockProducts;
  }

  try {
    const parsedProducts = JSON.parse(
      storedProducts
    ) as Product[];

    const hasValidStructure = parsedProducts.every(
      (product) =>
        typeof product.baseProductId === "number"
    );

    return hasValidStructure
      ? parsedProducts
      : mockProducts;
  } catch {
    return mockProducts;
  }
}

function getInitialPriceRecords(): PriceRecord[] {
  const storedPriceRecords = localStorage.getItem(
    PRICE_RECORDS_STORAGE_KEY
  );

  if (!storedPriceRecords) {
    return mockPriceRecords;
  }

  try {
    return JSON.parse(
      storedPriceRecords
    ) as PriceRecord[];
  } catch {
    return mockPriceRecords;
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat(
    "pt-PT"
  ).format(
    new Date(`${date}T00:00:00`)
  );
}

function formatPackageQuantity(
  quantity: number,
  unit: MeasurementUnit
) {
  const unitLabels: Record<
    MeasurementUnit,
    string
  > = {
    kg: "kg",
    g: "g",
    l: "L",
    ml: "ml",
    unit:
      quantity === 1
        ? "unidade"
        : "unidades",
  };

  return `${quantity} ${unitLabels[unit]}`;
}

function getNormalizedQuantity(
  product: Product
) {
  switch (product.packageUnit) {
    case "g":
      return product.packageQuantity / 1000;

    case "ml":
      return product.packageQuantity / 1000;

    default:
      return product.packageQuantity;
  }
}

function getEffectivePrice(
  priceRecord: PriceRecord
) {
  return (
    priceRecord.promotionalPrice ??
    priceRecord.regularPrice
  );
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
  baseProduct: BaseProduct
) {
  switch (baseProduct.comparisonUnit) {
    case "kg":
      return "kg";

    case "l":
      return "L";

    case "unit":
      return "un.";
  }
}

function getLatestPriceRecord(
  productId: number,
  priceRecords: PriceRecord[]
) {
  return priceRecords
    .filter(
      (record) =>
        record.productId === productId
    )
    .sort((firstRecord, secondRecord) => {
      const dateDifference =
        new Date(secondRecord.date).getTime() -
        new Date(firstRecord.date).getTime();

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return secondRecord.id - firstRecord.id;
    })[0];
}

export default function Products() {
  const [baseProducts, setBaseProducts] =
    useState<BaseProduct[]>(
      getInitialBaseProducts
    );

  const [products, setProducts] =
    useState<Product[]>(getInitialProducts);

  const [priceRecords, setPriceRecords] =
    useState<PriceRecord[]>(
      getInitialPriceRecords
    );

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    isAddProductOpen,
    setIsAddProductOpen,
  ] = useState(false);

  /*
   * Quando tem um ID, o AddProductDrawer abre
   * diretamente o formulário rápido desse produto.
   */
  const [
    addPriceProductId,
    setAddPriceProductId,
  ] = useState<number | null>(null);

  /*
   * Controla o produto aberto na folha de detalhe.
   */
  const [
    selectedProductId,
    setSelectedProductId,
  ] = useState<number | null>(null);

  const selectedProduct = products.find(
    (product) =>
      product.id === selectedProductId
  );

  const selectedProductBase = selectedProduct
    ? baseProducts.find(
        (baseProduct) =>
          baseProduct.id ===
          selectedProduct.baseProductId
      )
    : undefined;

  useEffect(() => {
    localStorage.setItem(
      BASE_PRODUCTS_STORAGE_KEY,
      JSON.stringify(baseProducts)
    );
  }, [baseProducts]);

  useEffect(() => {
    localStorage.setItem(
      PRODUCTS_STORAGE_KEY,
      JSON.stringify(products)
    );
  }, [products]);

  useEffect(() => {
    localStorage.setItem(
      PRICE_RECORDS_STORAGE_KEY,
      JSON.stringify(priceRecords)
    );
  }, [priceRecords]);

  const filteredProducts = useMemo(() => {
    const normalizedSearchTerm =
      normalizeText(searchTerm);

    if (!normalizedSearchTerm) {
      return products;
    }

    return products.filter((product) => {
      const baseProduct =
        baseProducts.find(
          (item) =>
            item.id ===
            product.baseProductId
        );

      const searchableValues = [
        product.name,
        product.brand,
        baseProduct?.name,
        baseProduct?.category,
      ];

      return searchableValues.some((value) =>
        value
          ? normalizeText(value).includes(
              normalizedSearchTerm
            )
          : false
      );
    });
  }, [
    searchTerm,
    products,
    baseProducts,
  ]);

  function handleAddProduct(
    productForm: AddProductFormData
  ): AddProductResult {
    const baseProductName =
      productForm.baseProductName.trim();

    const commercialName =
      productForm.commercialName.trim();

    const brand = productForm.brand.trim();
    const category =
      productForm.category.trim();

    const packageQuantity = Number(
      productForm.packageQuantity.replace(
        ",",
        "."
      )
    );

    const regularPrice = Number(
      productForm.regularPrice.replace(
        ",",
        "."
      )
    );

    const promotionalPrice =
      productForm.promotion
        ? Number(
            productForm.promotionalPrice.replace(
              ",",
              "."
            )
          )
        : undefined;

    const storeId = Number(
      productForm.storeId
    );

    if (
      !baseProductName ||
      !Number.isFinite(packageQuantity) ||
      packageQuantity <= 0 ||
      !Number.isFinite(regularPrice) ||
      regularPrice <= 0 ||
      !storeId
    ) {
      return {
        success: false,
      };
    }

    if (
      productForm.promotion &&
      (!promotionalPrice ||
        !Number.isFinite(
          promotionalPrice
        ) ||
        promotionalPrice <= 0)
    ) {
      return {
        success: false,
      };
    }

    if (
      promotionalPrice !== undefined &&
      promotionalPrice >= regularPrice
    ) {
      return {
        success: false,
      };
    }

    const existingBaseProduct =
      baseProducts.find(
        (baseProduct) =>
          normalizeText(baseProduct.name) ===
          normalizeText(baseProductName)
      );

    let baseProductId: number;

    let newBaseProduct:
      | ReturnType<
          typeof createBaseProduct
        >
      | undefined;

    if (existingBaseProduct) {
      baseProductId =
        existingBaseProduct.id;
    } else {
      baseProductId =
        getNextId(baseProducts);

      newBaseProduct = createBaseProduct({
        id: baseProductId,
        name: baseProductName,
        category,
        packageUnit:
          productForm.packageUnit,
      });
    }

    const candidateProduct = createProduct({
      id: getNextId(products),
      baseProductId,
      baseProductName,
      commercialName,
      brand,
      packageQuantity,
      packageUnit:
        productForm.packageUnit,
    });

    const candidateBrand = normalizeText(
      candidateProduct.brand ?? ""
    );

    const existingCommercialProduct =
      products.find((product) => {
        const existingBrand = normalizeText(
          product.brand ?? ""
        );

        const brandsAreCompatible =
          !candidateBrand ||
          !existingBrand ||
          candidateBrand === existingBrand;

        return (
          product.baseProductId ===
            baseProductId &&
          normalizeText(product.name) ===
            normalizeText(
              candidateProduct.name
            ) &&
          Math.abs(
            product.packageQuantity -
              candidateProduct.packageQuantity
          ) < 0.000001 &&
          product.packageUnit ===
            candidateProduct.packageUnit &&
          brandsAreCompatible
        );
      });

    const productId =
      existingCommercialProduct?.id ??
      candidateProduct.id;

    const newPriceRecord =
      createPriceRecord({
        id: getNextId(priceRecords),
        productId,
        storeId,
        regularPrice,
        promotionalPrice,
        promotion:
          productForm.promotion,
        date: getTodayDate(),
      });

    if (newBaseProduct) {
      setBaseProducts(
        (currentBaseProducts) => [
          ...currentBaseProducts,
          newBaseProduct,
        ]
      );
    }

    if (!existingCommercialProduct) {
      setProducts((currentProducts) => [
        ...currentProducts,
        candidateProduct,
      ]);
    }

    setPriceRecords(
      (currentPriceRecords) => [
        ...currentPriceRecords,
        newPriceRecord,
      ]
    );

    return {
      success: true,
      action: existingCommercialProduct
        ? "added-price"
        : "created-product",
      productName:
        existingCommercialProduct
          ? existingCommercialProduct.name
          : candidateProduct.name,
    };
  }

  function handleAddPrice(
    priceForm: AddPriceFormData
  ): boolean {
    const regularPrice = Number(
      priceForm.regularPrice.replace(
        ",",
        "."
      )
    );

    const promotionalPrice =
      priceForm.promotion
        ? Number(
            priceForm.promotionalPrice.replace(
              ",",
              "."
            )
          )
        : undefined;

    const storeId = Number(
      priceForm.storeId
    );

    const productExists = products.some(
      (product) =>
        product.id ===
        priceForm.productId
    );

    if (
      !productExists ||
      !storeId ||
      !Number.isFinite(regularPrice) ||
      regularPrice <= 0
    ) {
      return false;
    }

    if (
      priceForm.promotion &&
      (!promotionalPrice ||
        !Number.isFinite(
          promotionalPrice
        ) ||
        promotionalPrice <= 0)
    ) {
      return false;
    }

    if (
      promotionalPrice !== undefined &&
      promotionalPrice >= regularPrice
    ) {
      return false;
    }

    const newPriceRecord =
      createPriceRecord({
        id: getNextId(priceRecords),
        productId: priceForm.productId,
        storeId,
        regularPrice,
        promotionalPrice,
        promotion: priceForm.promotion,
        date: getTodayDate(),
      });

    setPriceRecords(
      (currentPriceRecords) => [
        ...currentPriceRecords,
        newPriceRecord,
      ]
    );

    return true;
  }

  function handleOpenNewProductFlow() {
    setAddPriceProductId(null);
    setIsAddProductOpen(true);
  }

  function handleOpenProductDetails(
    productId: number
  ) {
    setSelectedProductId(productId);
  }

  function handleAddPriceFromDetails() {
    if (!selectedProduct) {
      return;
    }

    const productId =
      selectedProduct.id;

    /*
     * Guardamos primeiro o produto que queremos
     * atualizar e fechamos a folha de detalhe.
     */
    setAddPriceProductId(productId);
    setSelectedProductId(null);

    /*
     * Abrimos depois o formulário que, através do
     * initialProductId, salta diretamente para
     * "Registar novo preço".
     */
    setIsAddProductOpen(true);
  }

  function handleAddProductOpenChange(
    nextOpen: boolean
  ) {
    setIsAddProductOpen(nextOpen);

    if (!nextOpen) {
      setAddPriceProductId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Produtos
        </h1>

        <p className="text-sm text-muted-foreground">
          Consulta os produtos comerciais e os
          respetivos preços.
        </p>
      </header>

      <div className="space-y-3">
        <AppInput
          id="product-search"
          type="search"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(
              event.target.value
            )
          }
          placeholder="Pesquisar produto, marca ou categoria"
        />

        <AppButton
          onClick={handleOpenNewProductFlow}
        >
          Adicionar produto
        </AppButton>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold text-foreground">
          Produtos registados
        </h2>

        <span className="text-sm text-muted-foreground">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1
            ? "produto"
            : "produtos"}
        </span>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="font-medium text-foreground">
            Nenhum produto encontrado
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Experimenta pesquisar por outro nome,
            marca ou categoria.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map(
            (product) => {
              const baseProduct =
                baseProducts.find(
                  (item) =>
                    item.id ===
                    product.baseProductId
                );

              const latestPriceRecord =
                getLatestPriceRecord(
                  product.id,
                  priceRecords
                );

              const store =
                latestPriceRecord
                  ? mockStores.find(
                      (item) =>
                        item.id ===
                        latestPriceRecord.storeId
                    )
                  : undefined;

              const effectivePrice =
                latestPriceRecord
                  ? getEffectivePrice(
                      latestPriceRecord
                    )
                  : null;

              const unitPrice =
                latestPriceRecord
                  ? getUnitPrice(
                      product,
                      latestPriceRecord
                    )
                  : null;

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() =>
                    handleOpenProductDetails(
                      product.id
                    )
                  }
                  className="
                    w-full
                    rounded-3xl
                    border
                    border-border
                    bg-card
                    p-4
                    text-left
                    shadow-sm
                    transition-colors
                    hover:bg-muted/40
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary/30
                    active:bg-muted
                  "
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {baseProduct?.name ??
                          "Produto base desconhecido"}
                      </p>

                      <h3 className="mt-1 font-semibold text-card-foreground">
                        {product.name}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {[
                          product.brand,
                          formatPackageQuantity(
                            product.packageQuantity,
                            product.packageUnit
                          ),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>

                      {baseProduct?.category && (
                        <span className="mt-3 inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {
                            baseProduct.category
                          }
                        </span>
                      )}
                    </div>

                    {latestPriceRecord &&
                    effectivePrice !== null ? (
                      <div className="shrink-0 text-right">
                        {latestPriceRecord.promotion &&
                          latestPriceRecord.promotionalPrice !==
                            undefined && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatCurrency(
                                latestPriceRecord.regularPrice
                              )}
                            </p>
                          )}

                        <p className="text-lg font-bold text-card-foreground">
                          {formatCurrency(
                            effectivePrice
                          )}
                        </p>

                        {unitPrice !== null &&
                          baseProduct && (
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(
                                unitPrice
                              )}
                              /
                              {getComparisonUnitLabel(
                                baseProduct
                              )}
                            </p>
                          )}
                      </div>
                    ) : (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        Sem preços
                      </span>
                    )}
                  </div>

                  {latestPriceRecord && (
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                      <div className="flex min-w-0 items-center gap-2">
                        {store && (
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                store.color,
                            }}
                          />
                        )}

                        <span className="truncate">
                          {store?.name ??
                            "Supermercado desconhecido"}
                        </span>

                        {latestPriceRecord.promotion && (
                          <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-400">
                            Promoção
                          </span>
                        )}
                      </div>

                      <time
                        className="shrink-0"
                        dateTime={
                          latestPriceRecord.date
                        }
                      >
                        {formatDate(
                          latestPriceRecord.date
                        )}
                      </time>
                    </div>
                  )}
                </button>
              );
            }
          )}
        </div>
      )}

      <ProductDetailsSheet
        open={selectedProductId !== null}
        product={selectedProduct}
        baseProduct={selectedProductBase}
        products={products}
        priceRecords={priceRecords}
        stores={mockStores}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setSelectedProductId(null);
          }
        }}
        onAddPrice={handleAddPriceFromDetails}
        onSelectProduct={(productId) => {
          setSelectedProductId(productId);
        }}  
      />

      <AddProductDrawer
        open={isAddProductOpen}
        baseProducts={baseProducts}
        products={products}
        priceRecords={priceRecords}
        initialProductId={addPriceProductId}
        onOpenChange={
          handleAddProductOpenChange
        }
        onBackFromInitialProduct={() => {
          if (addPriceProductId == null) {
            return;
          }

          const productId =
            addPriceProductId;

          setIsAddProductOpen(false);
          setAddPriceProductId(null);
          setSelectedProductId(productId);
        }}
        onSubmit={handleAddProduct}
        onAddPrice={handleAddPrice}
      />
    </div>
  );
}