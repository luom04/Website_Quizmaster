import { Outlet } from "react-router-dom";

import { AdminSidebar } from "@/components/layout/admin/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin/admin-topbar";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-muted/20 text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[18rem_1fr]">
        <AdminSidebar />

        <div className="min-w-0">
          <AdminTopbar />

          <main className="px-4 py-8 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
