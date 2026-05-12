import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/shared/logo";
import { UserMobileMenu } from "@/components/layout/user/user-mobile-menu";
import { userNavItems } from "@/components/layout/user/user-nav-items";
import { ROUTES } from "@/config/routes";
import { useLogout } from "@/features/auth/auth.hooks";
import { cn } from "@/lib/utils";

export function UserHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const logoutMutation = useLogout();

  async function handleLogout() {
    await logoutMutation.mutateAsync().catch(() => null);

    setMobileMenuOpen(false);
    toast.success("Đã đăng xuất");
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {userNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  isActive && "bg-muted text-foreground",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="outline"
            size="sm"
            disabled={logoutMutation.isPending}
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            {logoutMutation.isPending ? "Đang thoát..." : "Logout"}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="size-5" />
          <span className="sr-only">Mở menu</span>
        </Button>

        <UserMobileMenu
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
          onLogout={handleLogout}
          isLoggingOut={logoutMutation.isPending}
        />
      </div>
    </header>
  );
}
