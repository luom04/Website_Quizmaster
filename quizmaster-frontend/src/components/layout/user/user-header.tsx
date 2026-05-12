import { NavLink } from "react-router-dom";
import { History, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/shared/logo";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

const userNavItems = [
  {
    label: "Quizzes",
    href: ROUTES.USER.QUIZZES,
  },
  {
    label: "History",
    href: ROUTES.USER.HISTORY,
  },
  {
    label: "Profile",
    href: ROUTES.USER.PROFILE,
  },
];

export function UserHeader() {
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

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <History className="size-4" />
          </Button>

          <Button variant="outline" size="sm">
            <UserRound className="size-4" />
            Account
          </Button>
        </div>
      </div>
    </header>
  );
}
