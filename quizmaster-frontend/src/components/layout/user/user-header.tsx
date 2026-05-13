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
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden h-full items-center gap-1 md:flex">
          {userNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "relative flex h-full items-center px-4 text-sm font-semibold transition-all duration-200",
                  "text-muted-foreground hover:text-primary",
                  isActive && "text-primary",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {/* Thanh Indicator phía dưới khi Active */}
                  {isActive && (
                    <span className="absolute bottom-[-1px] left-0 h-0.5 w-full rounded-t-full bg-primary shadow-[0_-2px_8px_rgba(var(--primary),0.4)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Button
            variant="ghost"
            size="sm"
            disabled={logoutMutation.isPending}
            onClick={handleLogout}
            className="group flex items-center gap-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
          >
            <LogOut className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="font-medium">
              {logoutMutation.isPending ? "Đang thoát..." : "Logout"}
            </span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl md:hidden"
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
