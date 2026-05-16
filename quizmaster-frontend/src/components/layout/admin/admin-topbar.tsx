import { ExternalLink, LogOut, Menu, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="size-5" />
            <span className="sr-only">Mở admin menu</span>
          </Button>

          <div className="shrink-0 lg:hidden">
            <Logo showText={false} />
          </div>

          <div className="hidden min-w-0 flex-col lg:flex">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="size-4" />
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  Admin workspace
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Manage quizzes, questions, users and monitoring data.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
            <Link to={ROUTES.USER.QUIZZES}>
              <ExternalLink className="mr-2 size-4" />
              View site
            </Link>
          </Button>

          <Button
            variant="outline"
            className="cursor-pointer"
            size="sm"
            disabled={logoutMutation.isPending}
            onClick={handleLogout}
          >
            <LogOut className="size-4 sm:mr-2" />
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
