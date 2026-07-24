import { ShoppingCart } from "lucide-react";

export function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-md items-center px-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />

          <h1 className="text-xl font-bold tracking-tight">
            CartWise
          </h1>
        </div>
      </div>
    </header>
  );
}