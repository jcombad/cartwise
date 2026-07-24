import type { LucideIcon } from "lucide-react";

type ActionTileProps = {
  title: string;
  icon: LucideIcon;
  onClick?: () => void;
};

export function ActionTile({
  title,
  icon: Icon,
  onClick,
}: ActionTileProps) {
  return (
    <button
      onClick={onClick}
      className="
        flex
        aspect-square
        flex-col
        items-center
        justify-center
        gap-3
        rounded-2xl
        bg-card
        shadow-sm
        transition-all
        duration-200
        hover:shadow-md
        active:scale-95
      "
    >
      <Icon className="h-8 w-8 text-primary" />

      <span className="text-sm font-medium">
        {title}
      </span>
    </button>
  );
}