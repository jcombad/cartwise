export interface ShoppingProduct {
  id: number;
  name: string;
  price: number;
  completed: boolean;
}

export interface ShoppingList {
  id: number;
  store: string;
  color: string;
  products: ShoppingProduct[];
}

export const shoppingLists: ShoppingList[] = [
  {
    id: 1,
    store: "Continente",
    color: "#F58220",
    products: [
      {
        id: 1,
        name: "Leite Mimosa Meio Gordo",
        price: 0.95,
        completed: true,
      },
      {
        id: 2,
        name: "Arroz Cigala Agulha",
        price: 2.19,
        completed: true,
      },
      {
        id: 3,
        name: "Atum Ramirez",
        price: 1.39,
        completed: false,
      },
      {
        id: 4,
        name: "Coca-Cola 1.75L",
        price: 1.99,
        completed: false,
      },
      {
        id: 5,
        name: "Papel Higiénico Renova",
        price: 9.99,
        completed: false,
      },
      {
        id: 6,
        name: "Bananas",
        price: 1.85,
        completed: false,
      },
      {
        id: 7,
        name: "Iogurtes Gregos",
        price: 11.04,
        completed: false,
      },
    ],
  },
  {
    id: 2,
    store: "Lidl",
    color: "#0050AA",
    products: [
      {
        id: 1,
        name: "Pão de Forma",
        price: 1.39,
        completed: false,
      },
      {
        id: 2,
        name: "Fiambre",
        price: 2.49,
        completed: false,
      },
      {
        id: 3,
        name: "Queijo Fatiado",
        price: 2.19,
        completed: false,
      },
      {
        id: 4,
        name: "Leite",
        price: 3.99,
        completed: false,
      },
      {
        id: 5,
        name: "Água 6x1.5L",
        price: 3.14,
        completed: false,
      },
    ],
  },
  {
    id: 3,
    store: "Mercadona",
    color: "#0B8A42",
    products: [
      {
        id: 1,
        name: "Azeite",
        price: 5.99,
        completed: true,
      },
      {
        id: 2,
        name: "Massa",
        price: 1.29,
        completed: true,
      },
      {
        id: 3,
        name: "Tomate Triturado",
        price: 1.09,
        completed: true,
      },
      {
        id: 4,
        name: "Cebolas",
        price: 1.49,
        completed: true,
      },
      {
        id: 5,
        name: "Batatas",
        price: 2.99,
        completed: true,
      },
      {
        id: 6,
        name: "Peito de Frango",
        price: 8.99,
        completed: true,
      },
      {
        id: 7,
        name: "Detergente",
        price: 6.49,
        completed: true,
      },
      {
        id: 8,
        name: "Ovos",
        price: 2.49,
        completed: true,
      },
      {
        id: 9,
        name: "Chocolate",
        price: 11.98,
        completed: true,
      },
    ],
  },
  {
    id: 4,
    store: "ALDI",
    color: "#005AA9",
    products: [
      {
        id: 1,
        name: "Café",
        price: 3.99,
        completed: true,
      },
      {
        id: 2,
        name: "Açúcar",
        price: 1.39,
        completed: false,
      },
      {
        id: 3,
        name: "Farinha",
        price: 1.19,
        completed: false,
      },
      {
        id: 4,
        name: "Fermento",
        price: 0.99,
        completed: false,
      },
      {
        id: 5,
        name: "Manteiga",
        price: 3.29,
        completed: false,
      },
      {
        id: 6,
        name: "Compota",
        price: 8.05,
        completed: false,
      },
    ],
  },
  {
    id: 5,
    store: "Intermarché",
    color: "#E30613",
    products: [
      {
        id: 1,
        name: "Tomate",
        price: 2.19,
        completed: true,
      },
      {
        id: 2,
        name: "Pepino",
        price: 1.09,
        completed: true,
      },
      {
        id: 3,
        name: "Alface",
        price: 1.49,
        completed: true,
      },
      {
        id: 4,
        name: "Cenouras",
        price: 1.39,
        completed: true,
      },
      {
        id: 5,
        name: "Pimentos",
        price: 2.49,
        completed: false,
      },
      {
        id: 6,
        name: "Cogumelos",
        price: 2.29,
        completed: false,
      },
      {
        id: 7,
        name: "Maçãs",
        price: 2.99,
        completed: false,
      },
      {
        id: 8,
        name: "Peras",
        price: 2.59,
        completed: false,
      },
      {
        id: 9,
        name: "Laranjas",
        price: 3.19,
        completed: false,
      },
      {
        id: 10,
        name: "Kiwis",
        price: 2.79,
        completed: false,
      },
      {
        id: 11,
        name: "Morangos",
        price: 15.19,
        completed: false,
      },
    ],
  },
  {
    id: 6,
    store: "Auchan",
    color: "#E31E24",
    products: [
      {
        id: 1,
        name: "Pizza",
        price: 4.99,
        completed: false,
      },
      {
        id: 2,
        name: "Gelado",
        price: 3.49,
        completed: false,
      },
      {
        id: 3,
        name: "Batatas Fritas",
        price: 2.19,
        completed: false,
      },
      {
        id: 4,
        name: "Refrigerante",
        price: 2.59,
        completed: false,
      },
      {
        id: 5,
        name: "Bolachas",
        price: 1.99,
        completed: false,
      },
      {
        id: 6,
        name: "Cereais",
        price: 3.49,
        completed: false,
      },
      {
        id: 7,
        name: "Leite Achocolatado",
        price: 2.69,
        completed: false,
      },
      {
        id: 8,
        name: "Sumo de Laranja",
        price: 5.27,
        completed: false,
      },
    ],
  },
];