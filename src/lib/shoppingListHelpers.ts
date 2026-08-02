import type {
  PriceRecord,
  Product,
  Store,
} from "../types";

export type ProductRecommendation = {
  product: Product;
  store: Store;
  priceRecord: PriceRecord;

  /**
   * Preço efetivo da embalagem:
   * promocional, quando existir, ou normal.
   */
  effectivePrice: number;

  /**
   * Preço normalizado:
   * €/kg, €/L ou €/unidade.
   */
  unitPrice: number;
};

function getEffectivePrice(
  priceRecord: PriceRecord
) {
  return (
    priceRecord.promotionalPrice ??
    priceRecord.regularPrice
  );
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

export function getLatestPriceRecord(
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

export function getProductRecommendation(
  baseProductId: number,
  products: Product[],
  priceRecords: PriceRecord[],
  stores: Store[]
): ProductRecommendation | null {
  const recommendations = products
    .filter(
      (product) =>
        product.baseProductId ===
        baseProductId
    )
    .map((product) => {
      const latestPriceRecord =
        getLatestPriceRecord(
          product.id,
          priceRecords
        );

      if (!latestPriceRecord) {
        return null;
      }

      const store = stores.find(
        (item) =>
          item.id ===
          latestPriceRecord.storeId
      );

      if (!store) {
        return null;
      }

      const unitPrice = getUnitPrice(
        product,
        latestPriceRecord
      );

      if (unitPrice === null) {
        return null;
      }

      return {
        product,
        store,
        priceRecord: latestPriceRecord,
        effectivePrice: getEffectivePrice(
          latestPriceRecord
        ),
        unitPrice,
      };
    })
    .filter(
      (
        recommendation
      ): recommendation is ProductRecommendation =>
        recommendation !== null
    )
    .sort(
      (firstRecommendation, secondRecommendation) =>
        firstRecommendation.unitPrice -
        secondRecommendation.unitPrice
    );

  return recommendations[0] ?? null;
}