import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../components/ui/drawer";

import { mockPriceRecords } from "../data/mockPriceRecords";
import { mockProducts } from "../data/mockProducts";
import { mockStores } from "../data/mockStores";

import type {
  MeasurementUnit,
  PriceRecord,
  Product,
} from "../types";

const PRODUCTS_STORAGE_KEY = "cartwise-products";
const PRICE_RECORDS_STORAGE_KEY = "cartwise-price-records";
const LAST_STORE_STORAGE_KEY = "cartwise-last-store";

type ProductFormData = {
  name: string;
  brand: string;
  category: string;

  packageQuantity: string;
  packageUnit: MeasurementUnit;
  comparisonUnit: Product["comparisonUnit"];

  storeId: string;

  regularPrice: string;

  promotion: boolean;
  promotionalPrice: string;
};

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function getInitialProducts(): Product[] {
  const storedProducts = localStorage.getItem(
    PRODUCTS_STORAGE_KEY
  );

  if (!storedProducts) {
    return mockProducts;
  }

  try {
    return JSON.parse(storedProducts) as Product[];
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

function getInitialStoreId() {
  const storedStoreId = localStorage.getItem(
    LAST_STORE_STORAGE_KEY
  );

  if (storedStoreId) {
    return storedStoreId;
  }

  return mockStores[0]?.id.toString() ?? "";
}

function createInitialProductForm(): ProductFormData {
  return {
    name: "",
    brand: "",
    category: "",

    packageQuantity: "1",
    packageUnit: "unit",
    comparisonUnit: "unit",

    storeId: getInitialStoreId(),

    regularPrice: "",

    promotion: false,
    promotionalPrice: "",
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatPackageQuantity(
  quantity: number,
  unit: MeasurementUnit
) {
  const unitLabels: Record<MeasurementUnit, string> = {
    kg: "kg",
    g: "g",
    l: "L",
    ml: "ml",
    unit: quantity === 1 ? "unidade" : "unidades",
  };

  return `${quantity} ${unitLabels[unit]}`;
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

function getEffectivePrice(priceRecord: PriceRecord) {
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

function getComparisonUnitLabel(product: Product) {
  switch (product.comparisonUnit) {
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
  const productPriceRecords = priceRecords
    .filter((record) => record.productId === productId)
    .sort(
      (firstRecord, secondRecord) =>
        new Date(secondRecord.date).getTime() -
        new Date(firstRecord.date).getTime()
    );

  return productPriceRecords[0];
}

export default function Products() {
  const [products, setProducts] =
    useState<Product[]>(getInitialProducts);

  const [priceRecords, setPriceRecords] =
    useState<PriceRecord[]>(getInitialPriceRecords);

  const [searchTerm, setSearchTerm] = useState("");

  const [isAddProductOpen, setIsAddProductOpen] =
    useState(false);

  const [showMoreDetails, setShowMoreDetails] =
    useState(false);

  const [productForm, setProductForm] =
    useState<ProductFormData>(
      createInitialProductForm
    );

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
    const normalizedSearchTerm = searchTerm
      .trim()
      .toLowerCase();

    if (!normalizedSearchTerm) {
      return products;
    }

    return products.filter((product) => {
      const searchableValues = [
        product.name,
        product.brand,
        product.category,
      ];

      return searchableValues.some((value) =>
        value
          ?.toLowerCase()
          .includes(normalizedSearchTerm)
      );
    });
  }, [searchTerm, products]);

  function resetProductForm() {
    setProductForm(createInitialProductForm());
    setShowMoreDetails(false);
  }

  function handleDrawerOpenChange(open: boolean) {
    setIsAddProductOpen(open);

    if (!open) {
      resetProductForm();
    }
  }

  function handlePackageUnitChange(
    packageUnit: MeasurementUnit
  ) {
    let comparisonUnit: Product["comparisonUnit"];

    switch (packageUnit) {
      case "kg":
      case "g":
        comparisonUnit = "kg";
        break;

      case "l":
      case "ml":
        comparisonUnit = "l";
        break;

      default:
        comparisonUnit = "unit";
    }

    setProductForm((currentForm) => ({
      ...currentForm,
      packageUnit,
      comparisonUnit,
    }));
  }

  function handlePromotionChange(checked: boolean) {
    setProductForm((currentForm) => ({
      ...currentForm,
      promotion: checked,
      promotionalPrice: checked
        ? currentForm.promotionalPrice
        : "",
    }));
  }

  function handleAddProduct(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const name = productForm.name.trim();

    const packageQuantity = Number(
      productForm.packageQuantity.replace(",", ".")
    );

    const regularPrice = Number(
      productForm.regularPrice.replace(",", ".")
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

    const storeId = Number(productForm.storeId);

    if (
      !name ||
      packageQuantity <= 0 ||
      regularPrice <= 0 ||
      !storeId
    ) {
      return;
    }

    if (
      productForm.promotion &&
      (!promotionalPrice || promotionalPrice <= 0)
    ) {
      return;
    }

    if (
      promotionalPrice &&
      promotionalPrice >= regularPrice
    ) {
      return;
    }

    const nextProductId =
      products.length > 0
        ? Math.max(
            ...products.map((product) => product.id)
          ) + 1
        : 1;

    const nextPriceRecordId =
      priceRecords.length > 0
        ? Math.max(
            ...priceRecords.map(
              (priceRecord) => priceRecord.id
            )
          ) + 1
        : 1;

    const newProduct: Product = {
      id: nextProductId,
      name,
      brand: productForm.brand.trim() || undefined,
      category:
        productForm.category.trim() || undefined,
      packageQuantity,
      packageUnit: productForm.packageUnit,
      comparisonUnit:
        productForm.comparisonUnit,
    };

    const newPriceRecord: PriceRecord = {
      id: nextPriceRecordId,
      productId: nextProductId,
      storeId,
      regularPrice,
      promotionalPrice,
      date: getTodayDate(),
      promotion: productForm.promotion,
    };

    setProducts((currentProducts) => [
      ...currentProducts,
      newProduct,
    ]);

    setPriceRecords((currentPriceRecords) => [
      ...currentPriceRecords,
      newPriceRecord,
    ]);

    localStorage.setItem(
      LAST_STORE_STORAGE_KEY,
      productForm.storeId
    );

    setIsAddProductOpen(false);
    resetProductForm();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">
          Produtos
        </h1>

        <p className="text-sm text-slate-500">
          Consulta os teus produtos e os respetivos preços.
        </p>
      </header>

      <div className="space-y-3">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          placeholder="Pesquisar produto, marca ou categoria"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
        />

        <button
          type="button"
          onClick={() => setIsAddProductOpen(true)}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Adicionar produto
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">
          Os meus produtos
        </h2>

        <span className="text-sm text-slate-500">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1
            ? "produto"
            : "produtos"}
        </span>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="font-medium text-slate-900">
            Nenhum produto encontrado
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Experimenta pesquisar por outro nome, marca ou
            categoria.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const latestPriceRecord =
              getLatestPriceRecord(
                product.id,
                priceRecords
              );

            const store = latestPriceRecord
              ? mockStores.find(
                  (item) =>
                    item.id === latestPriceRecord.storeId
                )
              : undefined;

            const effectivePrice =
              latestPriceRecord
                ? getEffectivePrice(latestPriceRecord)
                : null;

            const unitPrice = latestPriceRecord
              ? getUnitPrice(
                  product,
                  latestPriceRecord
                )
              : null;

            return (
              <article
                key={product.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
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

                    {product.category && (
                      <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {product.category}
                      </span>
                    )}
                  </div>

                  {latestPriceRecord &&
                  effectivePrice !== null ? (
                    <div className="shrink-0 text-right">
                      {latestPriceRecord.promotion &&
                        latestPriceRecord.promotionalPrice && (
                          <p className="text-xs text-slate-400 line-through">
                            {formatCurrency(
                              latestPriceRecord.regularPrice
                            )}
                          </p>
                        )}

                      <p className="text-lg font-bold text-slate-900">
                        {formatCurrency(effectivePrice)}
                      </p>

                      {unitPrice !== null && (
                        <p className="text-xs text-slate-500">
                          {formatCurrency(unitPrice)}/
                          {getComparisonUnitLabel(product)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="shrink-0 text-xs text-slate-400">
                      Sem preços
                    </span>
                  )}
                </div>

                {latestPriceRecord && (
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      {store && (
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: store.color,
                          }}
                        />
                      )}

                      <span>
                        {store?.name ??
                          "Supermercado desconhecido"}
                      </span>

                      {latestPriceRecord.promotion && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">
                          Promoção
                        </span>
                      )}
                    </div>

                    <time dateTime={latestPriceRecord.date}>
                      {new Intl.DateTimeFormat("pt-PT").format(
                        new Date(
                          `${latestPriceRecord.date}T00:00:00`
                        )
                      )}
                    </time>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Drawer
        open={isAddProductOpen}
        onOpenChange={handleDrawerOpenChange}
      >
        <DrawerContent>
          <form
            onSubmit={handleAddProduct}
            className="mx-auto flex max-h-[90vh] w-full max-w-lg flex-col"
          >
            <DrawerHeader className="text-left">
              <DrawerTitle>
                Adicionar produto
              </DrawerTitle>

              <DrawerDescription>
                Regista o produto e o preço numa única ação.
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-4 overflow-y-auto px-4 pb-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="product-name"
                  className="text-sm font-medium text-slate-700"
                >
                  Produto
                </label>

                <input
                  id="product-name"
                  type="text"
                  required
                  autoFocus
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm(
                      (currentForm) => ({
                        ...currentForm,
                        name: event.target.value,
                      })
                    )
                  }
                  placeholder="Ex.: Papel higiénico Renova"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="regular-price"
                    className="text-sm font-medium text-slate-700"
                  >
                    Preço normal
                  </label>

                  <div className="relative">
                    <input
                      id="regular-price"
                      type="text"
                      inputMode="decimal"
                      required
                      value={productForm.regularPrice}
                      onChange={(event) =>
                        setProductForm(
                          (currentForm) => ({
                            ...currentForm,
                            regularPrice:
                              event.target.value,
                          })
                        )
                      }
                      placeholder="0,00"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-9 text-base outline-none transition focus:border-slate-400"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      €
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="store"
                    className="text-sm font-medium text-slate-700"
                  >
                    Supermercado
                  </label>

                  <select
                    id="store"
                    required
                    value={productForm.storeId}
                    onChange={(event) =>
                      setProductForm(
                        (currentForm) => ({
                          ...currentForm,
                          storeId: event.target.value,
                        })
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base outline-none transition focus:border-slate-400"
                  >
                    {mockStores.map((store) => (
                      <option
                        key={store.id}
                        value={store.id}
                      >
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="package-quantity"
                    className="text-sm font-medium text-slate-700"
                  >
                    Quantidade
                  </label>

                  <input
                    id="package-quantity"
                    type="text"
                    inputMode="decimal"
                    required
                    value={productForm.packageQuantity}
                    onChange={(event) =>
                      setProductForm(
                        (currentForm) => ({
                          ...currentForm,
                          packageQuantity:
                            event.target.value,
                        })
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="package-unit"
                    className="text-sm font-medium text-slate-700"
                  >
                    Unidade
                  </label>

                  <select
                    id="package-unit"
                    value={productForm.packageUnit}
                    onChange={(event) =>
                      handlePackageUnitChange(
                        event.target
                          .value as MeasurementUnit
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base outline-none transition focus:border-slate-400"
                  >
                    <option value="unit">
                      Unidades
                    </option>
                    <option value="g">Gramas</option>
                    <option value="kg">
                      Quilogramas
                    </option>
                    <option value="ml">
                      Mililitros
                    </option>
                    <option value="l">Litros</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <label className="flex cursor-pointer items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Em promoção
                    </p>

                    <p className="text-xs text-slate-500">
                      Adicionar um preço promocional.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={productForm.promotion}
                    onChange={(event) =>
                      handlePromotionChange(
                        event.target.checked
                      )
                    }
                    className="peer sr-only"
                  />

                  <span className="relative h-6 w-11 shrink-0 rounded-full bg-slate-200 transition peer-checked:bg-slate-900">
                    <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                  </span>
                </label>

                {productForm.promotion && (
                  <div className="mt-4 space-y-1.5">
                    <label
                      htmlFor="promotional-price"
                      className="text-sm font-medium text-slate-700"
                    >
                      Preço promocional
                    </label>

                    <div className="relative">
                      <input
                        id="promotional-price"
                        type="text"
                        inputMode="decimal"
                        required
                        value={
                          productForm.promotionalPrice
                        }
                        onChange={(event) =>
                          setProductForm(
                            (currentForm) => ({
                              ...currentForm,
                              promotionalPrice:
                                event.target.value,
                            })
                          )
                        }
                        placeholder="0,00"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-9 text-base outline-none transition focus:border-slate-400"
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        €
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowMoreDetails(
                    (currentValue) => !currentValue
                  )
                }
                className="text-sm font-medium text-slate-600"
              >
                {showMoreDetails
                  ? "Ocultar detalhes"
                  : "Mais detalhes"}
              </button>

              {showMoreDetails && (
                <div className="space-y-4 rounded-xl bg-slate-50 p-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="product-brand"
                      className="text-sm font-medium text-slate-700"
                    >
                      Marca
                    </label>

                    <input
                      id="product-brand"
                      type="text"
                      value={productForm.brand}
                      onChange={(event) =>
                        setProductForm(
                          (currentForm) => ({
                            ...currentForm,
                            brand: event.target.value,
                          })
                        )
                      }
                      placeholder="Ex.: Renova"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="product-category"
                      className="text-sm font-medium text-slate-700"
                    >
                      Categoria
                    </label>

                    <input
                      id="product-category"
                      type="text"
                      value={productForm.category}
                      onChange={(event) =>
                        setProductForm(
                          (currentForm) => ({
                            ...currentForm,
                            category:
                              event.target.value,
                          })
                        )
                      }
                      placeholder="Ex.: Casa"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-slate-400"
                    />
                  </div>
                </div>
              )}
            </div>

            <DrawerFooter className="border-t border-slate-100 bg-white">
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Guardar produto e preço
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDrawerOpenChange(false)
                }
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}