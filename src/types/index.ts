export type MeasurementUnit =
  | "kg"
  | "g"
  | "l"
  | "ml"
  | "unit";

export type ComparisonUnit = "kg" | "l" | "unit";

export interface BaseProduct {
  id: number;

  /**
   * Conceito de produto usado para agrupar e comparar
   * produtos comerciais equivalentes.
   *
   * Exemplos:
   * - Esparguete
   * - Leite Meio Gordo
   * - Papel Higiénico
   */
  name: string;

  category?: string;

  /**
   * Unidade usada na comparação de preços:
   * €/kg, €/L ou €/un.
   */
  comparisonUnit: ComparisonUnit;
}

export interface Product {
  id: number;

  /**
   * Produto base ao qual este produto comercial pertence.
   */
  baseProductId: number;

  /**
   * Nome do produto comercial concreto.
   *
   * Exemplos:
   * - Esparguete Continente
   * - Esparguete Combino
   * - Leite Meio Gordo Mimosa
   */
  name: string;

  brand?: string;

  packageQuantity: number;
  packageUnit: MeasurementUnit;
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