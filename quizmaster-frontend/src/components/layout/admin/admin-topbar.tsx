import { useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AdminMobileSidebar } from "@/components/layout/admin/admin-mobile-sidebar";
import { Logo } from "@/components/layout/shared/logo";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { useLogout } from "@/features/auth/auth.hooks";

export function AdminTopbar() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const logoutMutation = useLogout();

  async function handleLogout() {
    await logoutMutation.mutateAsync().catch(() => null);

    toast.success("Đã đăng xuất");
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="size-5" />
            <span className="sr-only">Mở admin menu</span>
          </Button>

          <div className="lg:hidden">
            <Logo showText={false} />
          </div>
          <div className="hidden items-center gap-2 rounded-full border bg-muted/30 px-4 py-2 text-sm text-muted-foreground lg:flex">
            <span className="size-2 rounded-full bg-primary" />
            Admin workspace
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={logoutMutation.isPending}
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">
              {logoutMutation.isPending ? "Đang thoát..." : "Logout"}
            </span>
          </Button>
        </div>
      </div>

      <AdminMobileSidebar
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
      />
    </header>
  );
}
