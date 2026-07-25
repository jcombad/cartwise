export type MeasurementUnit =
  | "kg"
  | "g"
  | "l"
  | "ml"
  | "unit";

export interface Product {
  id: number;
  name: string;
  brand?: string;
  category?: string;

  packageQuantity: number;
  packageUnit: MeasurementUnit;

  comparisonUnit: "kg" | "l" | "unit";
}

export interface Store {
  id: number;
  name: string;
  color: string;
}

export interface PriceRecord {
  id: number;
  productId: number;
  storeId: number;

  regularPrice: number;
  promotionalPrice?: number;

  date: string;
  promotion: boolean;

  userId?: string;
}

export interface ShoppingListItem {
  id: number;
  productId: number;
  completed: boolean;
}

export interface UserShoppingList {
  id: number;
  userId?: string;
  name: string;
  storeId?: number;
  items: ShoppingListItem[];
}