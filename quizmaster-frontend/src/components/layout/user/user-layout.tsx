import { Outlet } from "react-router-dom";

import { UserHeader } from "@/components/layout/user/user-header";

export function UserLayout() {
  return (
    <div className="min-h-screen bg-muted/20 text-foreground">
      <UserHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
