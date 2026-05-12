import { NavLink } from "react-router-dom";
import {
  BarChart3,
  BookOpenCheck,
  FolderTree,
  LayoutDashboard,
  ListChecks,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

import { Logo } from "@/components/layout/shared/logo";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

const adminNavItems = [
  {
    label: "Dashboard",
    href: ROUTES.ADMIN.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: ROUTES.ADMIN.USERS,
    icon: UsersRound,
  },
  {
    label: "Categories",
    href: ROUTES.ADMIN.CATEGORIES,
    icon: FolderTree,
  },
  {
    label: "Questions",
    href: ROUTES.ADMIN.QUESTIONS,
    icon: ListChecks,
  },
  {
    label: "Quizzes",
    href: ROUTES.ADMIN.QUIZZES,
    icon: BookOpenCheck,
  },
  {
    label: "Recent Attempts",
    href: ROUTES.ADMIN.RECENT_ATTEMPTS,
    icon: BarChart3,
  },
  {
    label: "Suspicious",
    href: ROUTES.ADMIN.SUSPICIOUS_ATTEMPTS,
    icon: ShieldAlert,
  },
];

export function AdminSidebar() {
  return (
    <aside className="hidden min-h-screen border-r bg-background lg:block">
      <div className="sticky top-0 flex h-screen w-72 flex-col px-4 py-5">
        <Logo />

        <nav className="mt-8 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === ROUTES.ADMIN.DASHBOARD}
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
            Quản lý quiz, câu hỏi, người dùng và các cảnh báo trong hệ thống.
          </p>
        </div>
      </div>
    </aside>
  );
}
