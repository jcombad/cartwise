import { Outlet } from "react-router-dom";

import { AppHeader } from "./AppHeader";
import { BottomNavigation } from "./BottomNavigation";

export function MainLayout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <AppHeader />

      <main className="flex-1 px-4 pt-20 pb-20">
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  );
}