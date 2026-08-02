import {
  ChartColumn,
  Package,
  Settings,
  ShoppingCart,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { ActionTile } from "@/components/cards/ActionTile";
import { AppButton } from "@/components/forms/AppButton";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            CartWise
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Organiza as compras e encontra automaticamente
            onde cada produto fica mais barato.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted">
              <ShoppingCart
                className="h-6 w-6 text-muted-foreground"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Lista de compras
              </p>

              <h2 className="mt-1 text-xl font-bold text-card-foreground">
                O que está a faltar?
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Adiciona produtos e o CartWise distribui-os
                automaticamente pelos supermercados recomendados.
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
  <AppButton
    variant="secondary"
    className="flex-1"
    onClick={() =>
      navigate("/shoppinglists")
    }
  >
    + Adicionar produto
  </AppButton>

  <AppButton
    className="flex-1"
    onClick={() =>
      navigate("/shoppinglists")
    }
  >
    Abrir lista
  </AppButton>
</div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Ações rápidas
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <ActionTile
            title="Lista"
            icon={ShoppingCart}
            onClick={() =>
              navigate("/shoppinglists")
            }
          />

          <ActionTile
            title="Produtos"
            icon={Package}
            onClick={() =>
              navigate("/products")
            }
          />

          <ActionTile
            title="Estatísticas"
            icon={ChartColumn}
            onClick={() =>
              navigate("/statistics")
            }
          />

          <ActionTile
            title="Definições"
            icon={Settings}
            onClick={() =>
              navigate("/settings")
            }
          />
        </div>
      </section>
    </div>
  );
}