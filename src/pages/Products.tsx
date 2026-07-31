import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AddProductDrawer, {
  type AddPriceFormData,
  type AddProductFormData,
  type AddProductResult,
} from "../components/products/AddProductDrawer";

import {
  createBaseProduct,
  createPriceRecord,
  createProduct,
  getNextId,
  normalizeText,
} from "../lib/productHelpers";

import { mockBaseProducts } from "../data/mockBaseProducts";
import { mockPriceRecords } from "../data/mockPriceRecords";
import { mockProducts } from "../data/mockProducts";
import { mockStores } from "../data/mockStores";

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
const BASE_PRODUCTS_STORAGE_KEY = "cartwise-v2-base-products";
const PRODUCTS_STORAGE_KEY = "cartwise-v2-products";
const PRICE_RECORDS_STORAGE_KEY = "cartwise-v2-price-records";

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
    return JSON.parse(storedBaseProducts) as BaseProduct[];
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
      (record) => record.productId === productId
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
  const [baseProducts, setBaseProducts] = useState<
    BaseProduct[]
  >(getInitialBaseProducts);

  const [products, setProducts] =
    useState<Product[]>(getInitialProducts);

  const [priceRecords, setPriceRecords] =
    useState<PriceRecord[]>(getInitialPriceRecords);

  const [searchTerm, setSearchTerm] = useState("");

  const [isAddProductOpen, setIsAddProductOpen] =
    useState(false);

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
    const normalizedSearchTerm = normalizeText(
      searchTerm
    );

    if (!normalizedSearchTerm) {
      return products;
    }

    return products.filter((product) => {
      const baseProduct = baseProducts.find(
        (item) => item.id === product.baseProductId
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
  }, [searchTerm, products, baseProducts]);

function handleAddProduct(
  productForm: AddProductFormData
): AddProductResult {
  const baseProductName =
    productForm.baseProductName.trim();

  const commercialName =
    productForm.commercialName.trim();

  const brand = productForm.brand.trim();
  const category = productForm.category.trim();

  const packageQuantity = Number(
    productForm.packageQuantity.replace(",", ".")
  );

  const regularPrice = Number(
    productForm.regularPrice.replace(",", ".")
  );

  const promotionalPrice = productForm.promotion
    ? Number(
        productForm.promotionalPrice.replace(
          ",",
          "."
        )
      )
    : undefined;

  const storeId = Number(productForm.storeId);

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
      !Number.isFinite(promotionalPrice) ||
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

  const existingBaseProduct = baseProducts.find(
    (baseProduct) =>
      normalizeText(baseProduct.name) ===
      normalizeText(baseProductName)
  );

  let baseProductId: number;
  let newBaseProduct:
    | ReturnType<typeof createBaseProduct>
    | undefined;

  if (existingBaseProduct) {
    baseProductId = existingBaseProduct.id;
  } else {
    baseProductId = getNextId(baseProducts);

    newBaseProduct = createBaseProduct({
      id: baseProductId,
      name: baseProductName,
      category,
      packageUnit: productForm.packageUnit,
    });
  }

  const candidateProduct = createProduct({
    id: getNextId(products),
    baseProductId,
    baseProductName,
    commercialName,
    brand,
    packageQuantity,
    packageUnit: productForm.packageUnit,
  });

  const candidateBrand = normalizeText(
  candidateProduct.brand ?? ""
);

const existingCommercialProduct = products.find(
  (product) => {
    const existingBrand = normalizeText(
      product.brand ?? ""
    );

    const brandsAreCompatible =
      !candidateBrand ||
      !existingBrand ||
      candidateBrand === existingBrand;

    return (
      product.baseProductId === baseProductId &&
      normalizeText(product.name) ===
        normalizeText(candidateProduct.name) &&
      Math.abs(
        product.packageQuantity -
          candidateProduct.packageQuantity
      ) < 0.000001 &&
      product.packageUnit ===
        candidateProduct.packageUnit &&
      brandsAreCompatible
    );
  }
);

  const productId =
    existingCommercialProduct?.id ??
    candidateProduct.id;

  const newPriceRecord = createPriceRecord({
    id: getNextId(priceRecords),
    productId,
    storeId,
    regularPrice,
    promotionalPrice,
    promotion: productForm.promotion,
    date: getTodayDate(),
  });

  /*
   * Só criamos o Produto Base quando ainda não existia
   * e não foi encontrado um produto comercial equivalente.
   */
  if (newBaseProduct) {
    setBaseProducts((currentBaseProducts) => [
      ...currentBaseProducts,
      newBaseProduct,
    ]);
  }

  /*
   * Se o produto comercial já existir, não o duplicamos.
   * Apenas será criado o novo registo de preço.
   */
  if (!existingCommercialProduct) {
    setProducts((currentProducts) => [
      ...currentProducts,
      candidateProduct,
    ]);
  }

  setPriceRecords((currentPriceRecords) => [
    ...currentPriceRecords,
    newPriceRecord,
  ]);

  return {
  success: true,
  action: existingCommercialProduct
    ? "added-price"
    : "created-product",
  productName: existingCommercialProduct
    ? existingCommercialProduct.name
    : candidateProduct.name,
};
}

function handleAddPrice(
  priceForm: AddPriceFormData
): boolean {
  const regularPrice = Number(
    priceForm.regularPrice.replace(",", ".")
  );

  const promotionalPrice = priceForm.promotion
    ? Number(
        priceForm.promotionalPrice.replace(
          ",",
          "."
        )
      )
    : undefined;

  const storeId = Number(priceForm.storeId);

  const productExists = products.some(
    (product) =>
      product.id === priceForm.productId
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
      !Number.isFinite(promotionalPrice) ||
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

  const newPriceRecord = createPriceRecord({
    id: getNextId(priceRecords),
    productId: priceForm.productId,
    storeId,
    regularPrice,
    promotionalPrice,
    promotion: priceForm.promotion,
    date: getTodayDate(),
  });

  setPriceRecords((currentPriceRecords) => [
    ...currentPriceRecords,
    newPriceRecord,
  ]);

  return true;
}

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">
          Produtos
        </h1>

        <p className="text-sm text-slate-500">
          Consulta os produtos comerciais e os respetivos
          preços.
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
          Produtos registados
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
            const baseProduct = baseProducts.find(
              (item) =>
                item.id === product.baseProductId
            );

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

            const effectivePrice = latestPriceRecord
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
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {baseProduct?.name ??
                        "Produto base desconhecido"}
                    </p>

                    <h3 className="mt-1 font-semibold text-slate-900">
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

                    {baseProduct?.category && (
                      <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {baseProduct.category}
                      </span>
                    )}
                  </div>

                  {latestPriceRecord &&
                  effectivePrice !== null ? (
                    <div className="shrink-0 text-right">
                      {latestPriceRecord.promotion &&
                        latestPriceRecord.promotionalPrice !==
                          undefined && (
                          <p className="text-xs text-slate-400 line-through">
                            {formatCurrency(
                              latestPriceRecord.regularPrice
                            )}
                          </p>
                        )}

                      <p className="text-lg font-bold text-slate-900">
                        {formatCurrency(effectivePrice)}
                      </p>

                      {unitPrice !== null &&
                        baseProduct && (
                          <p className="text-xs text-slate-500">
                            {formatCurrency(unitPrice)}/
                            {getComparisonUnitLabel(
                              baseProduct
                            )}
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
                      {new Intl.DateTimeFormat(
                        "pt-PT"
                      ).format(
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

      <AddProductDrawer
        open={isAddProductOpen}
        baseProducts={baseProducts}
        products={products}
        priceRecords={priceRecords}
        onOpenChange={setIsAddProductOpen}
        onSubmit={handleAddProduct}
        onAddPrice={handleAddPrice}
      />
    </div>
  );
}