import type { PriceRecord } from "../types";

export const mockPriceRecords: PriceRecord[] = [
  {
    id: 1,
    productId: 1,
    storeId: 1,
    regularPrice: 0.89,
    date: "2026-07-20",
    promotion: false,
  },
  {
    id: 2,
    productId: 2,
    storeId: 3,
    regularPrice: 0.79,
    date: "2026-07-22",
    promotion: false,
  },
  {
    id: 3,
    productId: 3,
    storeId: 1,
    regularPrice: 0.86,
    date: "2026-07-21",
    promotion: false,
  },
  {
    id: 4,
    productId: 4,
    storeId: 2,
    regularPrice: 1.05,
    promotionalPrice: 0.92,
    date: "2026-07-23",
    promotion: true,
  },
  {
    id: 5,
    productId: 5,
    storeId: 1,
    regularPrice: 8.99,
    promotionalPrice: 7.49,
    date: "2026-07-24",
    promotion: true,
  },
];