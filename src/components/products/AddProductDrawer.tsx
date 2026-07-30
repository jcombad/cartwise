import { useState, type FormEvent } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

import { mockStores } from "../../data/mockStores";

import type {
  BaseProduct,
  MeasurementUnit,
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

type AddProductDrawerProps = {
  open: boolean;
  baseProducts: BaseProduct[];
  products: Product[];
  onOpenChange: (open: boolean) => void;

  /**
   * Deve devolver true quando o registo for guardado.
   * Se devolver false, o formulário permanece aberto.
   */
  onSubmit: (formData: AddProductFormData) => boolean;
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

export default function AddProductDrawer({
  open,
  baseProducts,
  onOpenChange,
  onSubmit,
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
  const [, setStep] =
    useState<AddProductStep>("select-base-product");

  const [, setSelectedBaseProductId] =
    useState<number | null>(null);

  const [, setSelectedProductId] =
    useState<number | null>(null);

  function resetForm() {
    setFormData(createInitialFormData());
    setShowMoreDetails(false);

    setStep("select-base-product");
    setSelectedBaseProductId(null);
    setSelectedProductId(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
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
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const wasSaved = onSubmit(formData);

    if (!wasSaved) {
      return;
    }

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
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-h-[90vh] w-full max-w-lg flex-col"
        >
          <DrawerHeader className="text-left">
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
      </DrawerContent>
    </Drawer>
  );
}