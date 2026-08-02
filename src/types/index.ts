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

export type ShoppingListAssignmentMode =
  | "automatic"
  | "manual";

export interface ShoppingListItem {
  id: number;

  /**
   * Necessidade de compra.
   *
   * A lista guarda o Produto Base para permitir ao CartWise
   * escolher automaticamente a alternativa comercial mais barata.
   */
  baseProductId: number;

  /**
   * Número de embalagens pretendidas.
   */
  quantity: number;

  /**
   * Produto e supermercado recomendados automaticamente
   * pelo CartWise com base nos preços mais recentes.
   */
  recommendedProductId?: number;
  recommendedStoreId?: number;

  /**
   * Produto e supermercado efetivamente escolhidos.
   *
   * Quando o modo é automático, normalmente coincidem com
   * a recomendação. Quando o utilizador altera manualmente,
   * estes campos preservam a escolha feita.
   */
  selectedProductId?: number;
  selectedStoreId?: number;

  assignmentMode: ShoppingListAssignmentMode;

  completed: boolean;

  /**
   * Preço estimado da embalagem escolhida no momento
   * em que a lista é consultada.
   */
  estimatedUnitPrice?: number;

  /**
   * Preço realmente pago por embalagem.
   *
   * Será preenchido quando o item for concluído.
   */
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