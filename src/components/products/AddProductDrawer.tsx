import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  Plus,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

import { AppButton } from "../forms/AppButton";
import { AppInput } from "../forms/AppInput";
import { AppSelect } from "../forms/AppSelect";
import { AppSwitch } from "../forms/AppSwitch";

import {
  MobileFullScreenSheet,
  MobileFullScreenSheetBody,
  MobileFullScreenSheetContent,
  MobileFullScreenSheetDescription,
  MobileFullScreenSheetFooter,
  MobileFullScreenSheetHeader,
  MobileFullScreenSheetTitle,
} from "../layout/MobileFullScreenSheet";

import { mockStores } from "../../data/mockStores";

import type {
  BaseProduct,
  MeasurementUnit,
  PriceRecord,
  Product,
} from "../../types";

const LAST_STORE_STORAGE_KEY =
  "cartwise-last-store";

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
  initialProductId?: number | null;
  onOpenChange: (open: boolean) => void;
  onBackFromInitialProduct?: () => void;
  onSubmit: (
    formData: AddProductFormData
  ) => AddProductResult;
  onAddPrice: (
    formData: AddPriceFormData
  ) => boolean;
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

function getComparisonUnitLabel(
  baseProduct: BaseProduct
) {
  switch (baseProduct.comparisonUnit) {
    case "kg":
      return "€/kg";

    case "l":
      return "€/L";

    case "unit":
      return "€/un.";
  }
}

export default function AddProductDrawer({
  open,
  baseProducts,
  products,
  priceRecords,
  initialProductId,
  onOpenChange,
  onBackFromInitialProduct,
  onSubmit,
  onAddPrice,
}: AddProductDrawerProps) {
  const [formData, setFormData] =
    useState<AddProductFormData>(
      createInitialFormData
    );

  const [showMoreDetails, setShowMoreDetails] =
    useState(false);

  const [step, setStep] =
    useState<AddProductStep>(
      "select-base-product"
    );

  const [
    selectedBaseProductId,
    setSelectedBaseProductId,
  ] = useState<number | null>(null);

  const [
    selectedProductId,
    setSelectedProductId,
  ] = useState<number | null>(null);

  const [
    baseProductSearch,
    setBaseProductSearch,
  ] = useState("");

  const filteredBaseProducts = useMemo(() => {
    const normalizedSearch =
      baseProductSearch
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

  const exactBaseProductMatch =
    baseProducts.find(
      (baseProduct) =>
        baseProduct.name.toLocaleLowerCase(
          "pt-PT"
        ) ===
        baseProductSearch
          .trim()
          .toLocaleLowerCase("pt-PT")
    );

  const selectedBaseProduct =
    baseProducts.find(
      (baseProduct) =>
        baseProduct.id === selectedBaseProductId
    );

  const selectedBaseProductProducts =
    products.filter(
      (product) =>
        product.baseProductId ===
        selectedBaseProductId
    );

  const selectedProduct = products.find(
    (product) =>
      product.id === selectedProductId
  );

useEffect(() => {
  if (!open || initialProductId == null) {
    return;
  }

  const initialProduct = products.find(
    (product) =>
      product.id === initialProductId
  );

  if (!initialProduct) {
    return;
  }

  const initialBaseProduct = baseProducts.find(
    (baseProduct) =>
      baseProduct.id ===
      initialProduct.baseProductId
  );

  const latestPriceRecord =
    getLatestPriceRecord(
      initialProduct.id,
      priceRecords
    );

  setSelectedBaseProductId(
    initialProduct.baseProductId
  );

  setSelectedProductId(initialProduct.id);

  setFormData((currentForm) => ({
    ...currentForm,
    baseProductName:
      initialBaseProduct?.name ?? "",
    category:
      initialBaseProduct?.category ?? "",
    storeId:
      latestPriceRecord?.storeId.toString() ??
      currentForm.storeId,
    regularPrice: "",
    promotionalPrice: "",
    promotion: false,
  }));

  setStep("add-price");
}, [
  open,
  initialProductId,
  products,
  baseProducts,
  priceRecords,
]);

  function resetForm() {
    setFormData(createInitialFormData());
    setShowMoreDetails(false);
    setStep("select-base-product");
    setSelectedBaseProductId(null);
    setSelectedProductId(null);
    setBaseProductSearch("");
  }

  function handleOpenChange(
    nextOpen: boolean
  ) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  }

  function handleSelectBaseProduct(
    baseProduct: BaseProduct
  ) {
    setSelectedBaseProductId(
      baseProduct.id
    );

    setFormData((currentForm) => ({
      ...currentForm,
      baseProductName: baseProduct.name,
      category:
        baseProduct.category ?? "",
    }));

    setStep("select-product");
  }

  function handleCreateBaseProduct() {
    const baseProductName =
      baseProductSearch.trim();

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

function handleSelectProduct(
  product: Product
) {
  const latestPriceRecord =
    getLatestPriceRecord(
      product.id,
      priceRecords
    );

  setSelectedProductId(product.id);

  setFormData((currentForm) => ({
    ...currentForm,
    storeId:
      latestPriceRecord?.storeId.toString() ??
      currentForm.storeId,
    regularPrice: "",
    promotionalPrice: "",
    promotion: false,
  }));

  setStep("add-price");
}

  function handleCreateCommercialProduct() {
    if (!selectedBaseProduct) {
      return;
    }

    setSelectedProductId(null);

    setFormData((currentForm) => ({
      ...currentForm,
      baseProductName:
        selectedBaseProduct.name,
      category:
        selectedBaseProduct.category ?? "",
      commercialName: "",
      brand: "",
      packageQuantity: "1",
      packageUnit:
        selectedBaseProduct.comparisonUnit ===
        "kg"
          ? "g"
          : selectedBaseProduct.comparisonUnit ===
              "l"
            ? "l"
            : "unit",
      regularPrice: "",
      promotionalPrice: "",
      promotion: false,
    }));

    setStep("create-product");
  }

  function handleBackToProductSelection() {
    setSelectedProductId(null);

    setFormData((currentForm) => ({
      ...currentForm,
      regularPrice: "",
      promotionalPrice: "",
      promotion: false,
    }));

    setStep("select-product");
  }

  function handleBackFromAddPrice() {
  if (
    initialProductId != null &&
    onBackFromInitialProduct
  ) {
    onBackFromInitialProduct();
    return;
  }

  handleBackToProductSelection();
}

  function handleBackToBaseProductSearch() {
    setStep("select-base-product");
    setSelectedBaseProductId(null);
    setSelectedProductId(null);
  }

  function handlePromotionChange(
    checked: boolean
  ) {
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
      toast.error(
        "Não foi possível guardar",
        {
          description:
            "Confirma os dados introduzidos e tenta novamente.",
        }
      );

      return;
    }

    if (result.action === "added-price") {
      toast.success("Preço atualizado", {
        description: `Foi adicionado um novo preço a “${result.productName}”.`,
      });
    } else {
      toast.success("Produto adicionado", {
        description: `“${result.productName}” foi criado com o primeiro preço.`,
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
      promotionalPrice:
        formData.promotionalPrice,
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
      description: `Foi guardado um novo preço para “${selectedProduct?.name ?? "o produto"}”.`,
    });

    localStorage.setItem(
      LAST_STORE_STORAGE_KEY,
      formData.storeId
    );

    onOpenChange(false);
    resetForm();
  }

  return (
    <MobileFullScreenSheet
      open={open}
      onOpenChange={handleOpenChange}
    >
      <MobileFullScreenSheetContent
        onClose={() =>
          handleOpenChange(false)
        }
      >
        {step === "select-base-product" && (
          <div className="flex min-h-0 flex-1 flex-col">
            <MobileFullScreenSheetHeader>
              <MobileFullScreenSheetTitle>
                O que queres registar?
              </MobileFullScreenSheetTitle>

              <MobileFullScreenSheetDescription>
                Procura primeiro o tipo de produto
                que queres comparar.
              </MobileFullScreenSheetDescription>
            </MobileFullScreenSheetHeader>

            <MobileFullScreenSheetBody className="space-y-5">
              <AppInput
                id="base-product-search"
                type="search"
                autoFocus
                label="Procurar produto"
                value={baseProductSearch}
                onChange={(event) =>
                  setBaseProductSearch(
                    event.target.value
                  )
                }
                placeholder="Ex.: Esparguete"
              />

              <section className="space-y-2">
                <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Produtos para comparar
                </p>

                {filteredBaseProducts.length >
                0 ? (
                  <div className="overflow-hidden rounded-3xl border border-border bg-card">
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
                            focus-visible:bg-muted/70
                            focus-visible:outline-none
                            active:bg-muted
                            ${
                              index !==
                              filteredBaseProducts.length - 1
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

                          <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {getComparisonUnitLabel(
                              baseProduct
                            )}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-6 text-center">
                    <p className="font-medium text-foreground">
                      Nenhum produto encontrado
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Podes criar um novo produto
                      para comparação.
                    </p>
                  </div>
                )}

                {baseProductSearch.trim() &&
                  !exactBaseProductMatch && (
                    <AppButton
                      variant="secondary"
                      icon={
                        <Plus className="h-4 w-4" />
                      }
                      onClick={
                        handleCreateBaseProduct
                      }
                    >
                      Criar “
                      {baseProductSearch.trim()}”
                    </AppButton>
                  )}
              </section>
            </MobileFullScreenSheetBody>
          </div>
        )}

        {step === "select-product" &&
          selectedBaseProduct && (
            <div className="flex min-h-0 flex-1 flex-col">
              <MobileFullScreenSheetHeader>
                <AppButton
                  variant="ghost"
                  fullWidth={false}
                  icon={
                    <ChevronLeft className="h-4 w-4" />
                  }
                  onClick={
                    handleBackToBaseProductSearch
                  }
                  className="-ml-3 mb-1 min-h-9 px-3 py-1.5 text-sm"
                >
                  Voltar
                </AppButton>

                <MobileFullScreenSheetTitle>
                  {selectedBaseProduct.name}
                </MobileFullScreenSheetTitle>

                <MobileFullScreenSheetDescription>
                  Seleciona o produto concreto
                  cujo preço queres registar.
                </MobileFullScreenSheetDescription>
              </MobileFullScreenSheetHeader>

              <MobileFullScreenSheetBody className="space-y-5">
                {selectedBaseProductProducts.length >
                0 ? (
                  <section className="space-y-2">
                    <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Produtos existentes
                    </p>

                    <div className="overflow-hidden rounded-3xl border border-border bg-card">
                      {selectedBaseProductProducts.map(
                        (product, index) => {
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

                          return (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() =>
                                handleSelectProduct(
                                  product
                                )
                              }
                              className={`
                                flex
                                min-h-20
                                w-full
                                items-center
                                justify-between
                                gap-4
                                px-4
                                py-4
                                text-left
                                transition-colors
                                hover:bg-muted/70
                                focus-visible:bg-muted/70
                                focus-visible:outline-none
                                active:bg-muted
                                ${
                                  index !==
                                  selectedBaseProductProducts.length - 1
                                    ? "border-b border-border"
                                    : ""
                                }
                              `}
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-card-foreground">
                                  {product.name}
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                  {product.brand
                                    ? `${product.brand} · `
                                    : ""}
                                  {formatPackage(
                                    product
                                  )}
                                </p>

                                {latestPriceRecord && (
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    {store?.name ??
                                      "Supermercado desconhecido"}{" "}
                                    ·{" "}
                                    {formatDate(
                                      latestPriceRecord.date
                                    )}
                                  </p>
                                )}
                              </div>

                              <div className="shrink-0 text-right">
                                {latestPriceRecord &&
                                effectivePrice !==
                                  null ? (
                                  <>
                                    {latestPriceRecord.promotion &&
                                      latestPriceRecord.promotionalPrice !==
                                        undefined && (
                                        <p className="text-xs text-muted-foreground line-through">
                                          {formatCurrency(
                                            latestPriceRecord.regularPrice
                                          )}
                                        </p>
                                      )}

                                    <p className="font-bold text-card-foreground">
                                      {formatCurrency(
                                        effectivePrice
                                      )}
                                    </p>

                                    {latestPriceRecord.promotion && (
                                      <p className="mt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                        Promoção
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    Sem preços
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </section>
                ) : (
                  <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-6 text-center">
                    <p className="font-medium text-foreground">
                      Ainda não existem produtos
                      comerciais
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Cria a primeira versão
                      comercial deste produto.
                    </p>
                  </div>
                )}

                <AppButton
                  variant="secondary"
                  icon={
                    <Plus className="h-4 w-4" />
                  }
                  onClick={
                    handleCreateCommercialProduct
                  }
                >
                  Criar novo produto comercial
                </AppButton>
              </MobileFullScreenSheetBody>
            </div>
          )}

        {step === "add-price" &&
          selectedProduct && (
            <form
              onSubmit={handleAddPriceSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <MobileFullScreenSheetHeader>
                <AppButton
                  variant="ghost"
                  fullWidth={false}
                  icon={
                    <ChevronLeft className="h-4 w-4" />
                  }
                  onClick={handleBackFromAddPrice}
                  className="-ml-3 mb-1 min-h-9 px-3 py-1.5 text-sm"
                >
                  Voltar
                </AppButton>

                <MobileFullScreenSheetTitle>
                  Registar novo preço
                </MobileFullScreenSheetTitle>

                <MobileFullScreenSheetDescription>
                  {selectedProduct.name}
                </MobileFullScreenSheetDescription>
              </MobileFullScreenSheetHeader>

              <MobileFullScreenSheetBody className="space-y-5">
                <div className="rounded-3xl border border-border bg-card p-4">
                  <p className="font-semibold text-card-foreground">
                    {selectedProduct.name}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedProduct.brand
                      ? `${selectedProduct.brand} · `
                      : ""}
                    {formatPackage(
                      selectedProduct
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <AppInput
                    id="new-regular-price"
                    label="Preço normal"
                    type="text"
                    inputMode="decimal"
                    required
                    autoFocus
                    value={
                      formData.regularPrice
                    }
                    onChange={(event) =>
                      setFormData(
                        (currentForm) => ({
                          ...currentForm,
                          regularPrice:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="0,00"
                    suffix="€"
                  />

                  <AppSelect
                    id="new-price-store"
                    label="Supermercado"
                    required
                    value={formData.storeId}
                    onChange={(event) =>
                      setFormData(
                        (currentForm) => ({
                          ...currentForm,
                          storeId:
                            event.target.value,
                        })
                      )
                    }
                  >
                    {mockStores.map((store) => (
                      <option
                        key={store.id}
                        value={store.id}
                      >
                        {store.name}
                      </option>
                    ))}
                  </AppSelect>
                </div>

                <AppSwitch
                  id="new-price-promotion"
                  checked={formData.promotion}
                  onCheckedChange={
                    handlePromotionChange
                  }
                  label="Em promoção"
                  description="Registar também o preço promocional."
                  icon={
                    <Tag className="h-5 w-5" />
                  }
                />

                {formData.promotion && (
                  <AppInput
                    id="new-promotional-price"
                    label="Preço promocional"
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
                    suffix="€"
                  />
                )}
              </MobileFullScreenSheetBody>

              <MobileFullScreenSheetFooter className="space-y-2">
                <AppButton type="submit">
                  Guardar novo preço
                </AppButton>

                <AppButton
                  variant="ghost"
                  onClick={() =>
                    handleOpenChange(false)
                  }
                >
                  Cancelar
                </AppButton>
              </MobileFullScreenSheetFooter>
            </form>
          )}

        {step === "create-product" && (
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <MobileFullScreenSheetHeader>
              <AppButton
                variant="ghost"
                fullWidth={false}
                icon={
                  <ChevronLeft className="h-4 w-4" />
                }
                onClick={
                  selectedBaseProduct
                    ? handleBackToProductSelection
                    : handleBackToBaseProductSearch
                }
                className="-ml-3 mb-1 min-h-9 px-3 py-1.5 text-sm"
              >
                Voltar
              </AppButton>

              <MobileFullScreenSheetTitle>
                Adicionar produto
              </MobileFullScreenSheetTitle>

              <MobileFullScreenSheetDescription>
                Regista o produto comercial e o
                respetivo primeiro preço.
              </MobileFullScreenSheetDescription>
            </MobileFullScreenSheetHeader>

            <MobileFullScreenSheetBody className="space-y-5">
              <AppInput
                id="base-product-name"
                label="Produto para comparar"
                type="text"
                required
                value={
                  formData.baseProductName
                }
                onChange={(event) =>
                  setFormData(
                    (currentForm) => ({
                      ...currentForm,
                      baseProductName:
                        event.target.value,
                    })
                  )
                }
                placeholder="Ex.: Esparguete"
                description="Agrupa produtos equivalentes de marcas ou supermercados diferentes."
              />

              <AppInput
                id="commercial-name"
                label="Nome comercial"
                type="text"
                value={
                  formData.commercialName
                }
                onChange={(event) =>
                  setFormData(
                    (currentForm) => ({
                      ...currentForm,
                      commercialName:
                        event.target.value,
                    })
                  )
                }
                placeholder="Ex.: Esparguete Continente"
                description="Se ficar vazio, será gerado automaticamente."
              />

              <div className="grid grid-cols-2 gap-3">
                <AppInput
                  id="regular-price"
                  label="Preço normal"
                  type="text"
                  inputMode="decimal"
                  required
                  value={
                    formData.regularPrice
                  }
                  onChange={(event) =>
                    setFormData(
                      (currentForm) => ({
                        ...currentForm,
                        regularPrice:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="0,00"
                  suffix="€"
                />

                <AppSelect
                  id="store"
                  label="Supermercado"
                  required
                  value={formData.storeId}
                  onChange={(event) =>
                    setFormData(
                      (currentForm) => ({
                        ...currentForm,
                        storeId:
                          event.target.value,
                      })
                    )
                  }
                >
                  {mockStores.map((store) => (
                    <option
                      key={store.id}
                      value={store.id}
                    >
                      {store.name}
                    </option>
                  ))}
                </AppSelect>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <AppInput
                  id="package-quantity"
                  label="Quantidade"
                  type="text"
                  inputMode="decimal"
                  required
                  value={
                    formData.packageQuantity
                  }
                  onChange={(event) =>
                    setFormData(
                      (currentForm) => ({
                        ...currentForm,
                        packageQuantity:
                          event.target.value,
                      })
                    )
                  }
                />

                <AppSelect
                  id="package-unit"
                  label="Unidade"
                  value={formData.packageUnit}
                  onChange={(event) =>
                    setFormData(
                      (currentForm) => ({
                        ...currentForm,
                        packageUnit:
                          event.target
                            .value as MeasurementUnit,
                      })
                    )
                  }
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
                </AppSelect>
              </div>

              <AppSwitch
                id="product-promotion"
                checked={formData.promotion}
                onCheckedChange={
                  handlePromotionChange
                }
                label="Em promoção"
                description="Adicionar também um preço promocional."
                icon={
                  <Tag className="h-5 w-5" />
                }
              />

              {formData.promotion && (
                <AppInput
                  id="promotional-price"
                  label="Preço promocional"
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
                  suffix="€"
                />
              )}

              <AppButton
                variant="ghost"
                onClick={() =>
                  setShowMoreDetails(
                    (currentValue) =>
                      !currentValue
                  )
                }
              >
                {showMoreDetails
                  ? "Ocultar detalhes"
                  : "Mais detalhes"}
              </AppButton>

              {showMoreDetails && (
                <div className="space-y-4 rounded-3xl border border-border bg-muted/30 p-4">
                  <AppInput
                    id="product-brand"
                    label="Marca"
                    type="text"
                    value={formData.brand}
                    onChange={(event) =>
                      setFormData(
                        (currentForm) => ({
                          ...currentForm,
                          brand:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="Ex.: Continente"
                  />

                  <AppInput
                    id="product-category"
                    label="Categoria"
                    type="text"
                    value={
                      formData.category
                    }
                    onChange={(event) =>
                      setFormData(
                        (currentForm) => ({
                          ...currentForm,
                          category:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="Ex.: Massas"
                    description="Só será usada quando estiveres a criar um produto base novo."
                  />
                </div>
              )}
            </MobileFullScreenSheetBody>

            <MobileFullScreenSheetFooter className="space-y-2">
              <AppButton type="submit">
                Guardar produto e preço
              </AppButton>

              <AppButton
                variant="ghost"
                onClick={() =>
                  handleOpenChange(false)
                }
              >
                Cancelar
              </AppButton>
            </MobileFullScreenSheetFooter>
          </form>
        )}
      </MobileFullScreenSheetContent>
    </MobileFullScreenSheet>
  );
}