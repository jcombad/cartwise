import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";

import { mockBaseProducts } from "@/data/mockBaseProducts";
import { mockPriceRecords } from "@/data/mockPriceRecords";
import { mockProducts } from "@/data/mockProducts";
import { mockStores } from "@/data/mockStores";
import { mockUserShoppingLists } from "@/data/mockUserShoppingLists";

type CartWiseContextValue = {
  baseProducts: typeof mockBaseProducts;

  products: typeof mockProducts;

  stores: typeof mockStores;

  priceRecords: typeof mockPriceRecords;

  shoppingList:
    typeof mockUserShoppingLists[0];
};

const CartWiseContext =
  createContext<CartWiseContextValue | null>(
    null
  );

export function CartWiseProvider({
  children,
}: PropsWithChildren) {
  const value = useMemo(
    () => ({
      baseProducts: mockBaseProducts,

      products: mockProducts,

      stores: mockStores,

      priceRecords: mockPriceRecords,

      shoppingList:
        mockUserShoppingLists[0],
    }),
    []
  );

  return (
    <CartWiseContext.Provider value={value}>
      {children}
    </CartWiseContext.Provider>
  );
}

export function useCartWise() {
  const context = useContext(
    CartWiseContext
  );

  if (!context) {
    throw new Error(
      "useCartWise must be used inside CartWiseProvider."
    );
  }

  return context;
}