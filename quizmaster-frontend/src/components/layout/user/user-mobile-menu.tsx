import { NavLink } from "react-router-dom";
import {
  BookOpenCheck,
  Clock3,
  Loader2,
  LogOut,
  UserRound,
} from "lucide-react";

import { userNavItems } from "@/components/layout/user/user-nav-items";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { cn } from "@/lib/utils";

type UserMobileMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
};

function getNavIcon(label: string) {
  switch (label) {
    case "Quizzes":
      return BookOpenCheck;

    case "History":
      return Clock3;

    case "Profile":
      return UserRound;

    default:
      return BookOpenCheck;
  }
}

export function UserMobileMenu({
  open,
  onOpenChange,
  onLogout,
  isLoggingOut,
}: UserMobileMenuProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex h-dvh w-80 flex-col p-0">
        <div className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-b bg-muted/25 px-5 py-5 text-left">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BookOpenCheck className="size-5" />
            </div>

            <SheetTitle className="text-xl font-bold tracking-tight">
              Quizmaster
            </SheetTitle>

            <p className="text-sm leading-6 text-muted-foreground">
              Điều hướng nhanh đến danh sách quiz, lịch sử làm bài và hồ sơ cá
              nhân.
            </p>
          </SheetHeader>

          <nav className="flex-1 space-y-2 px-4 py-5">
            {userNavItems.map((item) => {
              const Icon = getNavIcon(item.label);

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => onOpenChange(false)}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all",
                      "bg-background text-muted-foreground hover:bg-hover-surface hover:text-foreground",
                      isActive &&
                        "border-primary/20 bg-primary/10 text-primary shadow-sm",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors",
                          isActive && "bg-primary text-primary-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>

                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto border-t bg-background p-4">
            <div className="rounded-2xl border bg-muted/25 p-3">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                Tài khoản
              </p>

              <Button
                type="button"
                variant="outline"
                className="h-11 w-full justify-center rounded-2xl border-destructive/20 bg-background font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={isLoggingOut}
                onClick={onLogout}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Đang đăng xuất...
                  </>
                ) : (
                  <>
                    <LogOut className="size-4" />
                    Đăng xuất
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
