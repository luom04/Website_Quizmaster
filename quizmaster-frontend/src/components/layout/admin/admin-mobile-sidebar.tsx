import { NavLink } from "react-router-dom";

import { Logo } from "@/components/layout/shared/logo";
import { adminNavItems } from "@/components/layout/admin/admin-nav-items";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

type AdminMobileSidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AdminMobileSidebar({
  open,
  onOpenChange,
}: AdminMobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex h-full flex-col px-4 py-5">
          <SheetHeader className="text-left">
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            <Logo />
          </SheetHeader>

          <nav className="mt-8 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === ROUTES.ADMIN.DASHBOARD}
                  onClick={() => onOpenChange(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                      isActive && "bg-muted text-foreground",
                    )
                  }
                >
                  <Icon className="size-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border bg-muted/40 p-4">
            <p className="text-sm font-medium">Admin workspace</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Quản lý hệ thống Quizmaster trên thiết bị nhỏ.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
