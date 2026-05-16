import {
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { UserRole } from "@/types/user";

type AdminUserFiltersProps = {
  search: string;
  role: "" | UserRole;
  activeStatus: "" | "active" | "inactive";
  includeDeleted: boolean;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: "" | UserRole) => void;
  onActiveStatusChange: (value: "" | "active" | "inactive") => void;
  onIncludeDeletedChange: (value: boolean) => void;
};

const roleOptions: Array<{
  value: "" | UserRole;
  label: string;
}> = [
  { value: "", label: "Tất cả role" },
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

const activeStatusOptions: Array<{
  value: "" | "active" | "inactive";
  label: string;
}> = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export function AdminUserFilters({
  search,
  role,
  activeStatus,
  includeDeleted,
  onSearchChange,
  onRoleChange,
  onActiveStatusChange,
  onIncludeDeletedChange,
}: AdminUserFiltersProps) {
  const hasActiveFilters = Boolean(
    search.trim() || role || activeStatus || includeDeleted,
  );

  function handleClearFilters() {
    onSearchChange("");
    onRoleChange("");
    onActiveStatusChange("");
    onIncludeDeletedChange(false);
  }

  return (
    <Card className="overflow-hidden border-dashed bg-background/80">
      <CardContent className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-500/10 text-slate-700">
              <SlidersHorizontal className="size-5" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold">Bộ lọc users</h2>

                {role ? (
                  <span className="inline-flex rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-700">
                    Role: {role}
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    All roles
                  </span>
                )}

                {activeStatus ? (
                  <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    {activeStatus}
                  </span>
                ) : null}

                {includeDeleted ? (
                  <span className="inline-flex rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600">
                    Include deleted
                  </span>
                ) : null}
              </div>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Tìm kiếm user theo email/tên, lọc theo role, trạng thái hoạt
                động và tài khoản đã xóa mềm.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="cursor-pointer justify-start text-muted-foreground disabled:cursor-not-allowed"
            disabled={!hasActiveFilters}
            onClick={handleClearFilters}
          >
            <X className="mr-2 size-4" />
            Clear filters
          </Button>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr_0.7fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              className="h-10 rounded-xl pl-9"
              placeholder="Tìm user theo email hoặc tên..."
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <div className="relative">
            <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={role}
              className="h-10 w-full cursor-pointer rounded-xl border border-input bg-background px-3 pl-9 text-sm outline-none transition hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              onChange={(event) =>
                onRoleChange(event.target.value as "" | UserRole)
              }
            >
              {roleOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <UserCheck className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={activeStatus}
              className="h-10 w-full cursor-pointer rounded-xl border border-input bg-background px-3 pl-9 text-sm outline-none transition hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              onChange={(event) =>
                onActiveStatusChange(
                  event.target.value as "" | "active" | "inactive",
                )
              }
            >
              {activeStatusOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border bg-background px-3 text-sm transition hover:bg-muted/50">
            <input
              type="checkbox"
              checked={includeDeleted}
              className="size-4 cursor-pointer"
              onChange={(event) => onIncludeDeletedChange(event.target.checked)}
            />

            <Trash2 className="size-4 text-muted-foreground" />
            <span className="whitespace-nowrap">Deleted</span>
          </label>
        </div>

        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Active filters:</span>

            {search.trim() ? (
              <span className="inline-flex rounded-full bg-slate-500/10 px-2.5 py-1 font-medium text-slate-700">
                Search: {search.trim()}
              </span>
            ) : null}

            {role ? (
              <span className="inline-flex rounded-full bg-violet-500/10 px-2.5 py-1 font-medium text-violet-700">
                Role: {role}
              </span>
            ) : null}

            {activeStatus ? (
              <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-700">
                Status: {activeStatus}
              </span>
            ) : null}

            {includeDeleted ? (
              <span className="inline-flex rounded-full bg-rose-500/10 px-2.5 py-1 font-medium text-rose-600">
                Include deleted
              </span>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
