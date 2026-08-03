export type MeasurementUnit =
  | "kg"
  | "g"
  | "l"
  | "ml"
  | "unit";

export type ComparisonUnit =
  | "kg"
  | "l"
  | "unit";

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

export type ShoppingListAssignmentMode =
  | "automatic"
  | "manual";

export interface ShoppingListItem {
  id: number;

  /**
   * Produto Base existente no catálogo.
   *
   * Fica vazio quando o utilizador adiciona
   * algo que ainda não existe.
   */
  baseProductId?: number;

  /**
   * Nome livre para um produto que ainda
   * não existe no catálogo.
   */
  customName?: string;

  quantity: number;

  recommendedProductId?: number;
  recommendedStoreId?: number;

  selectedProductId?: number;
  selectedStoreId?: number;

  assignmentMode: ShoppingListAssignmentMode;

  completed: boolean;

  estimatedUnitPrice?: number;
  actualUnitPrice?: number;

  notes?: string;
}

export type ShoppingListStatus =
  | "active"
  | "completed"
  | "archived";

export interface UserShoppingList {
  id: number;
  userId?: string;

  name: string;

  status: ShoppingListStatus;

  createdAt: string;
  completedAt?: string;

  items: ShoppingListItem[];
}