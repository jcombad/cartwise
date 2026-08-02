import type {
  UserShoppingList,
} from "../types";

export const mockUserShoppingLists: UserShoppingList[] = [
  {
    id: 1,
    name: "Compras da semana",
    status: "active",
    createdAt: "2026-08-02",
    items: [
      {
        id: 1,
        baseProductId: 1,
        quantity: 2,

        recommendedProductId: 1,
        recommendedStoreId: 1,

        selectedProductId: 1,
        selectedStoreId: 1,

        assignmentMode: "automatic",

        completed: false,

        estimatedUnitPrice: 0.79,
      },
      {
        id: 2,
        baseProductId: 2,
        quantity: 1,

        recommendedProductId: 3,
        recommendedStoreId: 3,

        selectedProductId: 3,
        selectedStoreId: 3,

        assignmentMode: "automatic",

        completed: false,

        estimatedUnitPrice: 0.74,
      },
      {
        id: 3,
        baseProductId: 3,
        quantity: 1,

        recommendedProductId: 5,
        recommendedStoreId: 2,

        selectedProductId: 5,
        selectedStoreId: 2,

        assignmentMode: "automatic",

        completed: true,

        estimatedUnitPrice: 1.39,
        actualUnitPrice: 1.39,
      },
    ],
  },
  {
    id: 2,
    name: "Compras para o jantar",
    status: "completed",
    createdAt: "2026-07-26",
    completedAt: "2026-07-26",
    items: [
      {
        id: 1,
        baseProductId: 2,
        quantity: 2,

        recommendedProductId: 3,
        recommendedStoreId: 3,

        selectedProductId: 3,
        selectedStoreId: 3,

        assignmentMode: "automatic",

        completed: true,

        estimatedUnitPrice: 0.74,
        actualUnitPrice: 0.74,
      },
    ],
  },
];