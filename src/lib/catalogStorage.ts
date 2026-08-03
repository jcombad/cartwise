import { mockBaseProducts } from "@/data/mockBaseProducts";
import { mockPriceRecords } from "@/data/mockPriceRecords";
import { mockProducts } from "@/data/mockProducts";

import type {
  BaseProduct,
  PriceRecord,
  Product,
} from "@/types";

const BASE_PRODUCTS_STORAGE_KEY =
  "cartwise-v2-base-products";

const PRODUCTS_STORAGE_KEY =
  "cartwise-v2-products";

const PRICE_RECORDS_STORAGE_KEY =
  "cartwise-v2-price-records";

function loadStoredData<T>(
  storageKey: string,
  fallback: T
): T {
  const storedValue =
    localStorage.getItem(storageKey);

  if (!storedValue) {
    return fallback;
  }

  try {
    const parsedValue =
      JSON.parse(storedValue) as T;

    return parsedValue;
  } catch {
    return fallback;
  }
}

export function getStoredBaseProducts(): BaseProduct[] {
  return loadStoredData<BaseProduct[]>(
    BASE_PRODUCTS_STORAGE_KEY,
    mockBaseProducts
  );
}

export function getStoredProducts(): Product[] {
  return loadStoredData<Product[]>(
    PRODUCTS_STORAGE_KEY,
    mockProducts
  );
}

export function getStoredPriceRecords(): PriceRecord[] {
  return loadStoredData<PriceRecord[]>(
    PRICE_RECORDS_STORAGE_KEY,
    mockPriceRecords
  );
}

export function getStoredCatalog() {
  return {
    baseProducts: getStoredBaseProducts(),
    products: getStoredProducts(),
    priceRecords: getStoredPriceRecords(),
  };
}