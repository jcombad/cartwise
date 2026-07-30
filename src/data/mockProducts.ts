import type { Product } from "../types";

export const mockProducts: Product[] = [
  {
    id: 1,
    baseProductId: 1,
    name: "Esparguete Continente",
    brand: "Continente",
    packageQuantity: 500,
    packageUnit: "g",
  },
  {
    id: 2,
    baseProductId: 1,
    name: "Esparguete Combino",
    brand: "Combino",
    packageQuantity: 500,
    packageUnit: "g",
  },
  {
    id: 3,
    baseProductId: 2,
    name: "Leite Meio Gordo Continente",
    brand: "Continente",
    packageQuantity: 1,
    packageUnit: "l",
  },
  {
    id: 4,
    baseProductId: 2,
    name: "Leite Meio Gordo Mimosa",
    brand: "Mimosa",
    packageQuantity: 1,
    packageUnit: "l",
  },
  {
    id: 5,
    baseProductId: 3,
    name: "Papel Higiénico Continente 24 Rolos",
    brand: "Continente",
    packageQuantity: 24,
    packageUnit: "unit",
  },
];