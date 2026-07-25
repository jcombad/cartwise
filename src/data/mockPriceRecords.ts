import type { PriceRecord } from "@/types";

export const mockPriceRecords: PriceRecord[] = [
  {
    id: 1,
    productId: 1,
    storeId: 1,
    regularPrice: 14.99,
    promotionalPrice: 11.99,
    date: "2026-07-25",
    promotion: true,
  },
  {
    id: 2,
    productId: 1,
    storeId: 2,
    regularPrice: 9.99,
    date: "2026-07-25",
    promotion: false,
  },
  {
    id: 3,
    productId: 2,
    storeId: 3,
    regularPrice: 0.89,
    date: "2026-07-25",
    promotion: false,
  },
  {
  id: 4,
  productId: 4,
  storeId: 1,
  regularPrice: 2.49,
  date: "2026-07-26",
  promotion: false,
},
];