import {
  createBaseProduct,
  createPriceRecord,
  createProduct,
  getNextId,
  normalizeText,
} from "@/lib/productHelpers";

import { getStoredCatalog } from "@/lib/catalogStorage";

import type {
  BaseProduct,
  MeasurementUnit,
  PriceRecord,
  Product,
} from "@/types";

const BASE_PRODUCTS_STORAGE_KEY =
  "cartwise-v2-base-products";

const PRODUCTS_STORAGE_KEY =
  "cartwise-v2-products";

const PRICE_RECORDS_STORAGE_KEY =
  "cartwise-v2-price-records";

export type AddCatalogProductData = {
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

export type AddCatalogPriceData = {
  productId: number;
  storeId: string;
  regularPrice: string;
  promotion: boolean;
  promotionalPrice: string;
};

export type AddCatalogProductResult =
  | {
      success: true;
      action:
        | "created-product"
        | "added-price";

      productName: string;

      baseProductId: number;
      productId: number;
      priceRecordId: number;

      baseProducts: BaseProduct[];
      products: Product[];
      priceRecords: PriceRecord[];
    }
  | {
      success: false;
    };

export type AddCatalogPriceResult =
  | {
      success: true;

      productId: number;
      priceRecordId: number;

      priceRecords: PriceRecord[];
    }
  | {
      success: false;
    };

function getTodayDate() {
  return new Date()
    .toISOString()
    .split("T")[0];
}

function saveCatalog(
  baseProducts: BaseProduct[],
  products: Product[],
  priceRecords: PriceRecord[]
) {
  localStorage.setItem(
    BASE_PRODUCTS_STORAGE_KEY,
    JSON.stringify(baseProducts)
  );

  localStorage.setItem(
    PRODUCTS_STORAGE_KEY,
    JSON.stringify(products)
  );

  localStorage.setItem(
    PRICE_RECORDS_STORAGE_KEY,
    JSON.stringify(priceRecords)
  );
}

export function addCatalogProduct(
  productForm: AddCatalogProductData
): AddCatalogProductResult {
  const {
    baseProducts,
    products,
    priceRecords,
  } = getStoredCatalog();

  const baseProductName =
    productForm.baseProductName.trim();

  const commercialName =
    productForm.commercialName.trim();

  const brand =
    productForm.brand.trim();

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
    | BaseProduct
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

  const candidateProduct =
    createProduct({
      id: getNextId(products),
      baseProductId,
      baseProductName,
      commercialName,
      brand,
      packageQuantity,
      packageUnit:
        productForm.packageUnit,
    });

  const candidateBrand =
    normalizeText(
      candidateProduct.brand ?? ""
    );

  const existingCommercialProduct =
    products.find((product) => {
      const existingBrand =
        normalizeText(
          product.brand ?? ""
        );

      const brandsAreCompatible =
        !candidateBrand ||
        !existingBrand ||
        candidateBrand ===
          existingBrand;

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

  const product =
    existingCommercialProduct ??
    candidateProduct;

  const newPriceRecord =
    createPriceRecord({
      id: getNextId(priceRecords),
      productId: product.id,
      storeId,
      regularPrice,
      promotionalPrice,
      promotion:
        productForm.promotion,
      date: getTodayDate(),
    });

  const nextBaseProducts =
    newBaseProduct
      ? [
          ...baseProducts,
          newBaseProduct,
        ]
      : baseProducts;

  const nextProducts =
    existingCommercialProduct
      ? products
      : [
          ...products,
          candidateProduct,
        ];

  const nextPriceRecords = [
    ...priceRecords,
    newPriceRecord,
  ];

  saveCatalog(
    nextBaseProducts,
    nextProducts,
    nextPriceRecords
  );

  return {
    success: true,

    action:
      existingCommercialProduct
        ? "added-price"
        : "created-product",

    productName: product.name,

    baseProductId,
    productId: product.id,
    priceRecordId:
      newPriceRecord.id,

    baseProducts:
      nextBaseProducts,

    products:
      nextProducts,

    priceRecords:
      nextPriceRecords,
  };
}

export function addCatalogPrice(
  priceForm: AddCatalogPriceData
): AddCatalogPriceResult {
  const {
    baseProducts,
    products,
    priceRecords,
  } = getStoredCatalog();

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

  const productExists =
    products.some(
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
    return {
      success: false,
    };
  }

  if (
    priceForm.promotion &&
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

  const newPriceRecord =
    createPriceRecord({
      id: getNextId(priceRecords),
      productId:
        priceForm.productId,
      storeId,
      regularPrice,
      promotionalPrice,
      promotion:
        priceForm.promotion,
      date: getTodayDate(),
    });

  const nextPriceRecords = [
    ...priceRecords,
    newPriceRecord,
  ];

  saveCatalog(
    baseProducts,
    products,
    nextPriceRecords
  );

  return {
    success: true,

    productId:
      priceForm.productId,

    priceRecordId:
      newPriceRecord.id,

    priceRecords:
      nextPriceRecords,
  };
}