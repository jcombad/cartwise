import {
  Trash2,
} from "lucide-react";

import type {
  BaseProduct,
  Product,
  ShoppingListItem,
} from "@/types";

type ShoppingListItemRowProps = {
  item: ShoppingListItem;

  baseProduct?: BaseProduct;
  selectedProduct?: Product;

  isLastItem: boolean;

  onClick: (
    item: ShoppingListItem
  ) => void;

  onComplete: (
    itemId: number
  ) => void;

  onQuantityClick: (
    itemId: number
  ) => void;

  onRemove: (
    itemId: number
  ) => void;
};

export function ShoppingListItemRow({
  item,
  baseProduct,
  isLastItem,
  onClick,
  onComplete,
  onQuantityClick,
  onRemove,
}: ShoppingListItemRowProps) {
  const itemName =
    baseProduct?.name ??
    item.customName ??
    "Produto desconhecido";

  return (
    <div
      className={`
        flex
        min-h-16
        w-full
        items-center
        gap-3
        px-3
        py-2.5
        ${
          !isLastItem
            ? "border-b border-border"
            : ""
        }
      `}
    >
      <button
        type="button"
        aria-label={`Marcar ${itemName} como comprado`}
        onClick={() =>
          onComplete(item.id)
        }
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-full
          transition-[background-color,transform]
          duration-150
          ease-out
          hover:bg-muted/70
          active:scale-90
          active:bg-muted
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-primary/30
        "
      >
        <span
          className="
            h-6
            w-6
            rounded-full
            border-2
            border-muted-foreground/40
            transition-colors
            duration-150
          "
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        onClick={() =>
          onClick(item)
        }
        className="
          min-w-0
          flex-1
          py-2
          text-left
          transition-colors
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-primary/30
        "
      >
        <span className="block truncate font-semibold text-card-foreground">
          {itemName}
        </span>
      </button>

      <button
        type="button"
        onClick={() =>
          onQuantityClick(item.id)
        }
        aria-label={`Alterar quantidade de ${itemName}`}
        className="
          shrink-0
          rounded-full
          bg-muted
          px-2.5
          py-1.5
          text-xs
          font-semibold
          text-muted-foreground
          transition-[background-color,transform]
          duration-150
          hover:bg-muted/80
          active:scale-95
          active:bg-muted
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-primary/30
        "
      >
        {item.quantity}×
      </button>

      <button
        type="button"
        onClick={() =>
          onRemove(item.id)
        }
        aria-label={`Remover ${itemName} da lista`}
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-full
          text-muted-foreground
          transition-[background-color,color,transform]
          duration-150
          hover:bg-destructive/10
          hover:text-destructive
          active:scale-90
          active:bg-destructive/15
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-destructive/30
        "
      >
        <Trash2
          className="h-5 w-5"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}