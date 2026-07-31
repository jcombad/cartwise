import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import { MainLayout } from "@/components/layout/MainLayout";

import { Toaster } from "@/components/ui/sonner";

import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import ShoppingLists from "@/pages/ShoppingLists";
import Statistics from "@/pages/Statistics";
import Settings from "@/pages/Settings";

import {
  shoppingLists as initialShoppingLists,
  type ShoppingList,
} from "@/data/mockShoppingLists";

const SHOPPING_LISTS_STORAGE_KEY =
  "cartwise-shopping-lists";

function getInitialShoppingLists(): ShoppingList[] {
  try {
    const storedShoppingLists = localStorage.getItem(
      SHOPPING_LISTS_STORAGE_KEY
    );

    if (!storedShoppingLists) {
      return initialShoppingLists;
    }

    const parsedShoppingLists = JSON.parse(
      storedShoppingLists
    ) as ShoppingList[];

    if (!Array.isArray(parsedShoppingLists)) {
      return initialShoppingLists;
    }

    return parsedShoppingLists;
  } catch {
    return initialShoppingLists;
  }
}

function App() {
  const [shoppingLists, setShoppingLists] =
    useState<ShoppingList[]>(getInitialShoppingLists);

  useEffect(() => {
    localStorage.setItem(
      SHOPPING_LISTS_STORAGE_KEY,
      JSON.stringify(shoppingLists)
    );
  }, [shoppingLists]);

  function handleToggleProduct(
    shoppingListId: number,
    productId: number
  ) {
    setShoppingLists((currentShoppingLists) =>
      currentShoppingLists.map((shoppingList) =>
        shoppingList.id === shoppingListId
          ? {
              ...shoppingList,
              products: shoppingList.products.map((product) =>
                product.id === productId
                  ? {
                      ...product,
                      completed: !product.completed,
                    }
                  : product
              ),
            }
          : shoppingList
      )
    );
  }

  return (
    <>
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={
            <Dashboard shoppingLists={shoppingLists} />
          }
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/shoppinglists"
          element={
            <ShoppingLists
              shoppingLists={shoppingLists}
              onToggleProduct={handleToggleProduct}
            />
          }
        />

        <Route
          path="/shoppinglists/:listId"
          element={
            <ShoppingLists
              shoppingLists={shoppingLists}
              onToggleProduct={handleToggleProduct}
            />
          }
        />

        <Route
          path="/statistics"
          element={<Statistics />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />
      </Route>
    </Routes>

     <Toaster
      position="top-center"
      richColors
    />
    </>
  );
}

export default App;