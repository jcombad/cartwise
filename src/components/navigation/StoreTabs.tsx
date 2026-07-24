import type { ShoppingList } from "@/data/mockShoppingLists";

type StoreTabsProps = {
  shoppingLists: ShoppingList[];
  selectedId: number;
  onSelect: (id: number) => void;
};

export function StoreTabs({
  shoppingLists,
  selectedId,
  onSelect,
}: StoreTabsProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex w-max gap-2 rounded-2xl bg-muted p-1">
        {shoppingLists.map((shoppingList) => {
          const active = shoppingList.id === selectedId;

          const completed =
            shoppingList.products.length > 0 &&
            shoppingList.products.every(
              (product) => product.completed
            );

          return (
            <button
              key={shoppingList.id}
              type="button"
              onClick={() => onSelect(shoppingList.id)}
              className={`
                whitespace-nowrap
                rounded-xl
                px-4
                py-2
                text-sm
                font-medium
                transition-all
                duration-200
                ${
                  active
                    ? "bg-background text-foreground shadow"
                    : "text-muted-foreground"
                }
              `}
            >
              {completed
                ? `✓ ${shoppingList.store}`
                : shoppingList.store}
            </button>
          );
        })}
      </div>
    </div>
  );
}