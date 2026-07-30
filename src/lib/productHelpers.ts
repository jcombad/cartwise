import type {
  BaseProduct,
  MeasurementUnit,
  PriceRecord,
  Product,
} from "../types";

export function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase("pt-PT");
}

export function getNextId(items: Array<{ id: number }>) {
  if (items.length === 0) {
    return 1;
  }

  return Math.max(...items.map((item) => item.id)) + 1;
}

export function getComparisonUnitFromPackageUnit(
  packageUnit: MeasurementUnit
): BaseProduct["comparisonUnit"] {
  switch (packageUnit) {
    case "kg":
    case "g":
      return "kg";

    case "l":
    case "ml":
      return "l";

    case "unit":
      return "unit";
  }
}

type CreateBaseProductInput = {
  id: number;
  name: string;
  category?: string;
  packageUnit: MeasurementUnit;
};

export function createBaseProduct({
  id,
  name,
  category,
  packageUnit,
}: CreateBaseProductInput): BaseProduct {
  return {
    id,
    name: name.trim(),
    category: category?.trim() || undefined,
    comparisonUnit:
      getComparisonUnitFromPackageUnit(packageUnit),
  };
}

type CreateProductInput = {
  id: number;
  baseProductId: number;
  baseProductName: string;
  commercialName?: string;
  brand?: string;
  packageQuantity: number;
  packageUnit: MeasurementUnit;
};

export function createProduct({
  id,
  baseProductId,
  baseProductName,
  commercialName,
  brand,
  packageQuantity,
  packageUnit,
}: CreateProductInput): Product {
  const normalizedBrand = brand?.trim() || undefined;

  const generatedName = [
    baseProductName.trim(),
    normalizedBrand,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id,
    baseProductId,
    name: commercialName?.trim() || generatedName,
    brand: normalizedBrand,
    packageQuantity,
    packageUnit,
  };
}

type CreatePriceRecordInput = {
  id: number;
  productId: number;
  storeId: number;
  regularPrice: number;
  promotion: boolean;
  promotionalPrice?: number;
  date: string;
};

export function createPriceRecord({
  id,
  productId,
  storeId,
  regularPrice,
  promotion,
  promotionalPrice,
  date,
}: CreatePriceRecordInput): PriceRecord {
  return {
    id,
    productId,
    storeId,
    regularPrice,
    promotionalPrice: promotion
      ? promotionalPrice
      : undefined,
    date,
    promotion,
  };
}