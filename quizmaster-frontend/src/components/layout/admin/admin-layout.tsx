import { Outlet } from "react-router-dom";

import { AdminSidebar } from "@/components/layout/admin/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin/admin-topbar";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[17rem_1fr]">
        <AdminSidebar />

        <div className="flex min-w-0 flex-col">
          <AdminTopbar />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1600px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
