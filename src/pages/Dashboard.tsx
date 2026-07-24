import { useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Plus,
  Package,
  ChartColumn,
  Settings,
} from "lucide-react";

import { ShoppingListCard } from "@/components/cards/ShoppingListCard";
import { ActionTile } from "@/components/cards/ActionTile";
import { StoreTabs } from "@/components/navigation/StoreTabs";

import type { ShoppingList } from "@/data/mockShoppingLists";

type DashboardProps = {
  shoppingLists: ShoppingList[];
};

export default function Dashboard({
  shoppingLists,
}: DashboardProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const storeIdFromUrl = Number(
    searchParams.get("store")
  );

  const initialStoreId = shoppingLists.some(
    (list) => list.id === storeIdFromUrl
  )
    ? storeIdFromUrl
    : shoppingLists[0]?.id;

  const [selectedStoreId, setSelectedStoreId] = useState(
    initialStoreId
  );

  const selectedShoppingList = shoppingLists.find(
    (list) => list.id === selectedStoreId
  );

  function handleOpenShoppingList() {
    if (!selectedShoppingList) {
      return;
    }

    navigate(
      `/shoppinglists/${selectedShoppingList.id}`
    );
  }

  if (!selectedShoppingList) {
    return (
      <div>
        <h2 className="text-2xl font-bold">
          Compras de hoje
        </h2>

        <p className="mt-2 text-muted-foreground">
          Ainda não existem listas de compras.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-2xl font-bold">
          Compras de hoje
        </h2>

        <StoreTabs
          shoppingLists={shoppingLists}
          selectedId={selectedShoppingList.id}
          onSelect={setSelectedStoreId}
        />

        <div className="mt-4">
          <ShoppingListCard
            shoppingList={selectedShoppingList}
            onOpen={handleOpenShoppingList}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Ações rápidas
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <ActionTile
            title="Nova lista"
            icon={Plus}
            onClick={() => navigate("/shoppinglists")}
          />

          <ActionTile
            title="Produtos"
            icon={Package}
            onClick={() => navigate("/products")}
          />

          <ActionTile
            title="Estatísticas"
            icon={ChartColumn}
            onClick={() => navigate("/statistics")}
          />

          <ActionTile
            title="Definições"
            icon={Settings}
            onClick={() => navigate("/settings")}
          />
        </div>
      </section>
    </div>
  );
}