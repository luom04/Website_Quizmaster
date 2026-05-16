import { ExternalLink } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Logo } from "@/components/layout/shared/logo";
import { adminNavItems } from "@/components/layout/admin/admin-nav-items";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  return (
    <aside className="hidden min-h-screen border-r bg-background/95 lg:block">
      <div className="sticky top-0 flex h-screen w-68 flex-col px-4 py-5">
        <div className="rounded-2xl border bg-muted/30 px-3 py-3">
          <Logo />
        </div>

        <div className="mt-6">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Admin
          </p>

          <nav className="mt-3 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === ROUTES.ADMIN.DASHBOARD}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-hover-surface hover:text-foreground cursor-pointer",
                      isActive &&
                        "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground",
                    )
                  }
                >
                  <span className="flex size-8 items-center justify-center rounded-xl bg-background/70 text-muted-foreground transition group-hover:text-foreground group-[.bg-primary]:bg-primary-foreground/15 group-[.bg-primary]:text-primary-foreground">
                    <Icon className="size-4" />
                  </span>

                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto space-y-3">
          <NavLink
            to={ROUTES.USER.QUIZZES}
            className="flex cursor-pointer items-center justify-between rounded-2xl border bg-background px-4 py-3 text-sm font-medium transition hover:bg-hover-surface"
          >
            <span>View user site</span>
            <ExternalLink className="size-4 text-muted-foreground" />
          </NavLink>

          <div className="rounded-2xl border bg-muted/40 p-4">
            <p className="text-sm font-semibold">Admin workspace</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Quản lý quiz, câu hỏi, người dùng và theo dõi hoạt động trong hệ
              thống Quizmaster.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
