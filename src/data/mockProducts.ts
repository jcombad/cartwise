import type { Product } from "@/types";

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Papel higiénico",
    brand: "Renova",
    category: "Casa",
    packageQuantity: 48,
    packageUnit: "unit",
    comparisonUnit: "unit",
  },
  {
    id: 2,
    name: "Leite meio-gordo",
    category: "Laticínios",
    packageQuantity: 1,
    packageUnit: "l",
    comparisonUnit: "l",
  },
  {
    id: 3,
    name: "Arroz agulha",
    category: "Mercearia",
    packageQuantity: 1,
    packageUnit: "kg",
    comparisonUnit: "kg",
  },
  {
  id: 4,
  name: "Cereais",
  brand: "Exemplo",
  category: "Pequeno-almoço",
  packageQuantity: 500,
  packageUnit: "g",
  comparisonUnit: "kg",
},
];