import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { userNavItems } from "@/components/layout/user/user-nav-items";
import { cn } from "@/lib/utils";

type UserMobileMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
};

export function UserMobileMenu({
  open,
  onOpenChange,
  onLogout,
  isLoggingOut,
}: UserMobileMenuProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <nav className="mt-6 space-y-1">
          {userNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => onOpenChange(false)}
              className={({ isActive }) =>
                cn(
                  "block rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  isActive && "bg-muted text-foreground",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 border-t pt-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={isLoggingOut}
            onClick={onLogout}
          >
            <LogOut className="size-4" />
            {isLoggingOut ? "Đang thoát..." : "Logout"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
