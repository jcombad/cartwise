import {
  useMemo,
  useState,
} from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

import { mockStores } from "../../data/mockStores";

import { toast } from "sonner";

import type {
  BaseProduct,
  MeasurementUnit,
  PriceRecord,
  Product,
} from "../../types";

const LAST_STORE_STORAGE_KEY = "cartwise-last-store";

type AddProductStep =
  | "select-base-product"
  | "select-product"
  | "create-product"
  | "add-price";

export type AddProductFormData = {
  baseProductName: string;
  commercialName: string;
  brand: string;
  category: string;
  packageQuantity: string;
  packageUnit: MeasurementUnit;
  storeId: string;
  regularPrice: string;
  promotion: boolean;
  promotionalPrice: string;
};

export type AddProductResult =
  | {
      success: true;
      action: "created-product";
      productName: string;
    }
  | {
      success: true;
      action: "added-price";
      productName: string;
    }
  | {
      success: false;
    };

export type AddPriceFormData = {
  productId: number;
  storeId: string;
  regularPrice: string;
  promotion: boolean;
  promotionalPrice: string;
};

type AddProductDrawerProps = {
  open: boolean;
  baseProducts: BaseProduct[];
  products: Product[];
  priceRecords: PriceRecord[];
  onOpenChange: (open: boolean) => void;
  /**
   * Deve devolver true quando o registo for guardado.
   * Se devolver false, o formulário permanece aberto.
   */
  onSubmit: (
  formData: AddProductFormData
) => AddProductResult;
  onAddPrice: (formData: AddPriceFormData) => boolean;
};

function getInitialStoreId() {
  const storedStoreId = localStorage.getItem(
    LAST_STORE_STORAGE_KEY
  );

  if (storedStoreId) {
    return storedStoreId;
  }

  return mockStores[0]?.id.toString() ?? "";
}

function createInitialFormData(): AddProductFormData {
  return {
    baseProductName: "",
    commercialName: "",
    brand: "",
    category: "",
    packageQuantity: "1",
    packageUnit: "unit",
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-PT").format(
    new Date(`${date}T00:00:00`)
  );
}

function getEffectivePrice(priceRecord: PriceRecord) {
  return (
    priceRecord.promotionalPrice ??
    priceRecord.regularPrice
  );
}

function getLatestPriceRecord(
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
    })[0];
}

export default function AddProductDrawer({
  open,
  baseProducts,
  products,
  priceRecords,
  onOpenChange,
  onSubmit,
  onAddPrice,
}: AddProductDrawerProps) {
  const [formData, setFormData] =
    useState<AddProductFormData>(
      createInitialFormData
    );

  const [showMoreDetails, setShowMoreDetails] =
    useState(false);

  /*
   * Estes estados vão ser utilizados no próximo passo,
   * quando transformarmos o Drawer num fluxo por etapas.
   *
   * Neste momento, apenas precisamos das funções que
   * permitem repor os estados quando o Drawer fecha.
   */
const [step, setStep] =
  useState<AddProductStep>("select-base-product");

const [
  selectedBaseProductId,
  setSelectedBaseProductId,
] = useState<number | null>(null);

const [
  selectedProductId,
  setSelectedProductId,
] = useState<number | null>(null);

const [baseProductSearch, setBaseProductSearch] =
  useState("");

const filteredBaseProducts = useMemo(() => {
  const normalizedSearch = baseProductSearch
    .trim()
    .toLocaleLowerCase("pt-PT");

  if (!normalizedSearch) {
    return baseProducts;
  }

  return baseProducts.filter((baseProduct) =>
    baseProduct.name
      .toLocaleLowerCase("pt-PT")
      .includes(normalizedSearch)
  );
}, [baseProductSearch, baseProducts]);

const exactBaseProductMatch = baseProducts.find(
  (baseProduct) =>
    baseProduct.name.toLocaleLowerCase("pt-PT") ===
    baseProductSearch
      .trim()
      .toLocaleLowerCase("pt-PT")
);

const selectedBaseProduct = baseProducts.find(
  (baseProduct) =>
    baseProduct.id === selectedBaseProductId
);

const selectedBaseProductProducts = products.filter(
  (product) =>
    product.baseProductId === selectedBaseProductId
);

const selectedProduct = products.find(
  (product) => product.id === selectedProductId
);

  function resetForm() {
      setFormData(createInitialFormData());
      setShowMoreDetails(false);

      setStep("select-base-product");
      setSelectedBaseProductId(null);
      setSelectedProductId(null);
      setBaseProductSearch("");
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  }

  function handleSelectBaseProduct(
  baseProduct: BaseProduct
) {
  setSelectedBaseProductId(baseProduct.id);

  setFormData((currentForm) => ({
    ...currentForm,
    baseProductName: baseProduct.name,
    category: baseProduct.category ?? "",
  }));

  /*
   * Temporariamente segue diretamente para o formulário
   * atual. No próximo passo mostraremos primeiro os
   * produtos comerciais existentes.
   */
  setStep("select-product");
}

function handleCreateBaseProduct() {
  const baseProductName = baseProductSearch.trim();

  if (!baseProductName) {
    return;
  }

  setSelectedBaseProductId(null);

  setFormData((currentForm) => ({
    ...currentForm,
    baseProductName,
    category: "",
  }));

  setStep("create-product");
}

function handleSelectProduct(product: Product) {
  setSelectedProductId(product.id);

  /*
   * No próximo passo, esta seleção abrirá o formulário
   * rápido para registar apenas um novo preço.
   */
  setStep("add-price");
}

function handleCreateCommercialProduct() {
  if (!selectedBaseProduct) {
    return;
  }

  setSelectedProductId(null);

  setFormData((currentForm) => ({
    ...currentForm,
    baseProductName: selectedBaseProduct.name,
    category: selectedBaseProduct.category ?? "",
    commercialName: "",
    brand: "",
    packageQuantity: "1",
    packageUnit:
      selectedBaseProduct.comparisonUnit === "kg"
        ? "g"
        : selectedBaseProduct.comparisonUnit === "l"
          ? "l"
          : "unit",
  }));

  setStep("create-product");
}

function handleBackToProductSelection() {
  setSelectedProductId(null);
  setStep("select-product");
}

function handleBackToBaseProductSearch() {
  setStep("select-base-product");
  setSelectedBaseProductId(null);
  setSelectedProductId(null);
}

  function handlePromotionChange(checked: boolean) {
    setFormData((currentForm) => ({
      ...currentForm,
      promotion: checked,
      promotionalPrice: checked
        ? currentForm.promotionalPrice
        : "",
    }));
  }

function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  const result = onSubmit(formData);

  if (!result.success) {
    toast.error("Não foi possível guardar", {
      description:
        "Confirma os dados introduzidos e tenta novamente.",
    });

    return;
  }

  if (result.action === "added-price") {
    toast.success("Preço atualizado", {
      description: `Foi adicionado um novo preço a "${result.productName}".`,
    });
  } else {
    toast.success("Produto adicionado", {
      description: `"${result.productName}" foi criado com o primeiro preço.`,
    });
  }

  localStorage.setItem(
    LAST_STORE_STORAGE_KEY,
    formData.storeId
  );

  onOpenChange(false);
  resetForm();
}

function handleAddPriceSubmit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (!selectedProductId) {
    return;
  }

  const wasSaved = onAddPrice({
    productId: selectedProductId,
    storeId: formData.storeId,
    regularPrice: formData.regularPrice,
    promotion: formData.promotion,
    promotionalPrice: formData.promotionalPrice,
  });

  if (!wasSaved) {
    toast.error(
      "Não foi possível guardar o preço",
      {
        description:
          "Confirma os valores introduzidos e tenta novamente.",
      }
    );

    return;
  }

  toast.success("Preço adicionado", {
    description: `Foi guardado um novo preço para "${selectedProduct?.name ?? "o produto"}".`,
  });

  localStorage.setItem(
    LAST_STORE_STORAGE_KEY,
    formData.storeId
  );

  onOpenChange(false);
  resetForm();
}

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DrawerContent>
       {step === "select-base-product" && (
  <div className="mx-auto flex max-h-[85vh] w-full max-w-lg flex-col">
    <DrawerHeader className="text-left">
      <DrawerTitle>
        O que queres registar?
      </DrawerTitle>

      <DrawerDescription>
        Procura primeiro o tipo de produto que queres
        comparar.
      </DrawerDescription>
    </DrawerHeader>

    <div className="space-y-4 overflow-y-auto px-4 pb-6">
      <div className="space-y-1.5">
        <label
          htmlFor="base-product-search"
          className="text-sm font-medium text-slate-700"
        >
          Procurar produto
        </label>

        <input
          id="base-product-search"
          type="search"
          autoFocus
          value={baseProductSearch}
          onChange={(event) =>
            setBaseProductSearch(event.target.value)
          }
          placeholder="Ex.: Esparguete"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-slate-400"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Produtos para comparar
        </p>

        {filteredBaseProducts.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {filteredBaseProducts.map(
              (baseProduct, index) => (
                <button
                  key={baseProduct.id}
                  type="button"
                  onClick={() =>
                    handleSelectBaseProduct(
                      baseProduct
                    )
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
                    transition
                    hover:bg-slate-50
                    active:bg-slate-100
                    ${
                      index !==
                      filteredBaseProducts.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    }
                  `}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {baseProduct.name}
                    </p>

                    {baseProduct.category && (
                      <p className="mt-0.5 text-sm text-slate-500">
                        {baseProduct.category}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-sm text-slate-400">
                    {baseProduct.comparisonUnit ===
                    "unit"
                      ? "€/un."
                      : baseProduct.comparisonUnit ===
                          "l"
                        ? "€/L"
                        : "€/kg"}
                  </span>
                </button>
              )
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center">
            <p className="text-sm font-medium text-slate-900">
              Nenhum produto encontrado
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Podes criar um novo produto para comparação.
            </p>
          </div>
        )}

        {baseProductSearch.trim() &&
          !exactBaseProductMatch && (
            <button
              type="button"
              onClick={handleCreateBaseProduct}
              className="flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              Criar “{baseProductSearch.trim()}”
            </button>
          )}
      </div>
    </div>
  </div>
)}

{step === "select-product" && selectedBaseProduct && (
  <div className="mx-auto flex max-h-[85vh] w-full max-w-lg flex-col">
    <DrawerHeader className="text-left">
      <button
        type="button"
        onClick={handleBackToBaseProductSearch}
        className="mb-2 w-fit text-sm font-medium text-slate-500"
      >
        ← Voltar
      </button>

      <DrawerTitle>
        {selectedBaseProduct.name}
      </DrawerTitle>

      <DrawerDescription>
        Seleciona o produto concreto cujo preço queres
        registar.
      </DrawerDescription>
    </DrawerHeader>

    <div className="space-y-4 overflow-y-auto px-4 pb-6">
      {selectedBaseProductProducts.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Produtos existentes
          </p>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {selectedBaseProductProducts.map(
  (product, index) => {
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

    return (
      <button
        key={product.id}
        type="button"
        onClick={() =>
          handleSelectProduct(product)
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
          transition
          hover:bg-slate-50
          active:bg-slate-100
          ${
            index !==
            selectedBaseProductProducts.length - 1
              ? "border-b border-slate-100"
              : ""
          }
        `}
      >
        <div className="min-w-0">
          <p className="font-medium text-slate-900">
            {product.name}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {product.brand
              ? `${product.brand} · `
              : ""}

            {product.packageQuantity}{" "}
            {product.packageUnit === "unit"
              ? product.packageQuantity === 1
                ? "unidade"
                : "unidades"
              : product.packageUnit === "l"
                ? "L"
                : product.packageUnit}
          </p>

          {latestPriceRecord && (
            <p className="mt-2 text-xs text-slate-500">
              {store?.name ??
                "Supermercado desconhecido"}{" "}
              · {formatDate(latestPriceRecord.date)}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          {latestPriceRecord &&
          effectivePrice !== null ? (
            <>
              {latestPriceRecord.promotion &&
                latestPriceRecord.promotionalPrice !==
                  undefined && (
                  <p className="text-xs text-slate-400 line-through">
                    {formatCurrency(
                      latestPriceRecord.regularPrice
                    )}
                  </p>
                )}

              <p className="font-semibold text-slate-900">
                {formatCurrency(effectivePrice)}
              </p>

              {latestPriceRecord.promotion && (
                <p className="mt-1 text-[11px] font-medium text-amber-600">
                  Promoção
                </p>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-400">
              Sem preços
            </span>
          )}
        </div>
      </button>
    );
  }
)}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center">
          <p className="text-sm font-medium text-slate-900">
            Ainda não existem produtos comerciais
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Cria a primeira versão comercial deste produto.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleCreateCommercialProduct}
        className="flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
      >
        + Criar novo produto comercial
      </button>
    </div>
  </div>
)}

{step === "add-price" && selectedProduct && (
  <form
    onSubmit={handleAddPriceSubmit}
    className="mx-auto flex max-h-[85vh] w-full max-w-lg flex-col"
  >
    <DrawerHeader className="text-left">
      <button
        type="button"
        onClick={handleBackToProductSelection}
        className="mb-2 w-fit text-sm font-medium text-slate-500"
      >
        ← Voltar
      </button>

      <DrawerTitle>
        Registar novo preço
      </DrawerTitle>

      <DrawerDescription>
        {selectedProduct.name}
      </DrawerDescription>
    </DrawerHeader>

    <div className="space-y-4 overflow-y-auto px-4 pb-4">
      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="font-medium text-slate-900">
          {selectedProduct.name}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {selectedProduct.brand
            ? `${selectedProduct.brand} · `
            : ""}
          {selectedProduct.packageQuantity}{" "}
          {selectedProduct.packageUnit === "unit"
            ? selectedProduct.packageQuantity === 1
              ? "unidade"
              : "unidades"
            : selectedProduct.packageUnit === "l"
              ? "L"
              : selectedProduct.packageUnit}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label
            htmlFor="new-regular-price"
            className="text-sm font-medium text-slate-700"
          >
            Preço normal
          </label>

          <div className="relative">
            <input
              id="new-regular-price"
              type="text"
              inputMode="decimal"
              required
              autoFocus
              value={formData.regularPrice}
              onChange={(event) =>
                setFormData((currentForm) => ({
                  ...currentForm,
                  regularPrice: event.target.value,
                }))
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
            htmlFor="new-price-store"
            className="text-sm font-medium text-slate-700"
          >
            Supermercado
          </label>

          <select
            id="new-price-store"
            required
            value={formData.storeId}
            onChange={(event) =>
              setFormData((currentForm) => ({
                ...currentForm,
                storeId: event.target.value,
              }))
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

      <div className="rounded-xl border border-slate-200 p-3">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Em promoção
            </p>

            <p className="text-xs text-slate-500">
              Registar também o preço promocional.
            </p>
          </div>

          <input
            type="checkbox"
            checked={formData.promotion}
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

        {formData.promotion && (
          <div className="mt-4 space-y-1.5">
            <label
              htmlFor="new-promotional-price"
              className="text-sm font-medium text-slate-700"
            >
              Preço promocional
            </label>

            <div className="relative">
              <input
                id="new-promotional-price"
                type="text"
                inputMode="decimal"
                required
                value={formData.promotionalPrice}
                onChange={(event) =>
                  setFormData((currentForm) => ({
                    ...currentForm,
                    promotionalPrice:
                      event.target.value,
                  }))
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
    </div>

    <DrawerFooter className="border-t border-slate-100 bg-white">
      <button
        type="submit"
        className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Guardar novo preço
      </button>

      <button
        type="button"
        onClick={() => handleOpenChange(false)}
        className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        Cancelar
      </button>
    </DrawerFooter>
  </form>
)}
     
       {step === "create-product" && ( 
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-h-[90vh] w-full max-w-lg flex-col"
        >
          <DrawerHeader className="text-left">
            <button
  type="button"
  onClick={handleBackToBaseProductSearch}
  className="mb-2 w-fit text-sm font-medium text-slate-500"
>
  ← Voltar
</button>
            <DrawerTitle>
              Adicionar produto
            </DrawerTitle>

            <DrawerDescription>
              Regista o produto comercial e o respetivo
              preço.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 overflow-y-auto px-4 pb-4">
            <div className="space-y-1.5">
              <label
                htmlFor="base-product-name"
                className="text-sm font-medium text-slate-700"
              >
                Produto para comparar
              </label>

              <input
                id="base-product-name"
                type="text"
                list="base-product-options"
                required
                autoFocus
                value={formData.baseProductName}
                onChange={(event) =>
                  setFormData((currentForm) => ({
                    ...currentForm,
                    baseProductName: event.target.value,
                  }))
                }
                placeholder="Ex.: Esparguete"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-slate-400"
              />

              <datalist id="base-product-options">
                {baseProducts.map((baseProduct) => (
                  <option
                    key={baseProduct.id}
                    value={baseProduct.name}
                  />
                ))}
              </datalist>

              <p className="text-xs text-slate-500">
                Seleciona um produto existente ou escreve
                um novo.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="commercial-name"
                className="text-sm font-medium text-slate-700"
              >
                Nome comercial
              </label>

              <input
                id="commercial-name"
                type="text"
                value={formData.commercialName}
                onChange={(event) =>
                  setFormData((currentForm) => ({
                    ...currentForm,
                    commercialName: event.target.value,
                  }))
                }
                placeholder="Ex.: Esparguete Continente"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-slate-400"
              />

              <p className="text-xs text-slate-500">
                É opcional. Se ficar vazio, será gerado
                automaticamente.
              </p>
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
                    value={formData.regularPrice}
                    onChange={(event) =>
                      setFormData((currentForm) => ({
                        ...currentForm,
                        regularPrice: event.target.value,
                      }))
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
                  value={formData.storeId}
                  onChange={(event) =>
                    setFormData((currentForm) => ({
                      ...currentForm,
                      storeId: event.target.value,
                    }))
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
                  value={formData.packageQuantity}
                  onChange={(event) =>
                    setFormData((currentForm) => ({
                      ...currentForm,
                      packageQuantity:
                        event.target.value,
                    }))
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
                  value={formData.packageUnit}
                  onChange={(event) =>
                    setFormData((currentForm) => ({
                      ...currentForm,
                      packageUnit:
                        event.target
                          .value as MeasurementUnit,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base outline-none transition focus:border-slate-400"
                >
                  <option value="unit">
                    Unidades
                  </option>

                  <option value="g">
                    Gramas
                  </option>

                  <option value="kg">
                    Quilogramas
                  </option>

                  <option value="ml">
                    Mililitros
                  </option>

                  <option value="l">
                    Litros
                  </option>
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
                  checked={formData.promotion}
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

              {formData.promotion && (
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
                        formData.promotionalPrice
                      }
                      onChange={(event) =>
                        setFormData(
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
                    value={formData.brand}
                    onChange={(event) =>
                      setFormData(
                        (currentForm) => ({
                          ...currentForm,
                          brand: event.target.value,
                        })
                      )
                    }
                    placeholder="Ex.: Continente"
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
                    value={formData.category}
                    onChange={(event) =>
                      setFormData(
                        (currentForm) => ({
                          ...currentForm,
                          category: event.target.value,
                        })
                      )
                    }
                    placeholder="Ex.: Massas"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-slate-400"
                  />

                  <p className="text-xs text-slate-500">
                    Só será utilizada ao criar um produto
                    base novo.
                  </p>
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
                handleOpenChange(false)
              }
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
          </DrawerFooter>
        </form>
      )}  
      </DrawerContent>
    </Drawer>
  );
}