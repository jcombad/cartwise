import { Route, Routes } from "react-router-dom";

import { MainLayout } from "@/components/layout/MainLayout";

import { Toaster } from "@/components/ui/sonner";

import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Settings from "@/pages/Settings";
import ShoppingLists from "@/pages/ShoppingLists";
import Statistics from "@/pages/Statistics";

function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/shoppinglists"
            element={<ShoppingLists />}
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