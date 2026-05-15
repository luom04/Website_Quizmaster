import { useState } from "react";

import { NavLink, useNavigate } from "react-router-dom";
import { Loader2, LogOut, Menu, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/layout/shared/logo";
import { UserMobileMenu } from "@/components/layout/user/user-mobile-menu";
import { userNavItems } from "@/components/layout/user/user-nav-items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { ROUTES } from "@/config/routes";

import { useLogout } from "@/features/auth/auth.hooks";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

export function UserHeader() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const navItems = isAdmin
    ? [...userNavItems, { label: "Admin", href: ROUTES.ADMIN.DASHBOARD }]
    : userNavItems;

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
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Logo />

          {user ? (
            <div className="hidden min-w-0 items-center gap-2 border-l pl-3 lg:flex">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserRound className="size-4" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold leading-none">
                  {user.name || user.email}
                </p>
                <p className="mt-1 truncate text-[11px] leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <nav className="hidden h-10 items-center gap-1 rounded-2xl border bg-muted/35 p-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "inline-flex h-8 items-center rounded-xl px-3 text-sm font-semibold transition-all",
                  "text-muted-foreground hover:bg-background/80 hover:text-foreground",
                  isActive &&
                    "bg-background text-primary shadow-sm ring-1 ring-border",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user?.role ? (
            <Badge
              variant="outline"
              className="rounded-full border-indigo-200 bg-indigo-50 px-3 py-1 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300"
            >
              <ShieldCheck className="size-3.5" />
              {user.role.toUpperCase()}
            </Badge>
          ) : null}

          <Button
            variant="ghost"
            size="sm"
            disabled={logoutMutation.isPending}
            onClick={handleLogout}
            className="group cursor-pointer rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            {logoutMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4 transition-transform group-hover:-translate-x-0.5" />
            )}

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
