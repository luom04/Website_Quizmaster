import { Search, SlidersHorizontal } from "lucide-react";

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
  return (
    <div className="rounded-3xl border bg-card p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto] lg:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            placeholder="Tìm theo tên hoặc email..."
            className="h-10 rounded-xl bg-background pl-9"
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <select
            value={role}
            className="h-10 w-full appearance-none rounded-xl border border-input bg-background px-9 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            onChange={(event) =>
              onRoleChange(event.target.value as "" | UserRole)
            }
          >
            <option value="">Tất cả role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <select
          value={activeStatus}
          className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          onChange={(event) =>
            onActiveStatusChange(
              event.target.value as "" | "active" | "inactive",
            )
          }
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <label className="flex h-10 items-center gap-2 rounded-xl border bg-background px-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={includeDeleted}
            className="size-4"
            onChange={(event) => onIncludeDeletedChange(event.target.checked)}
          />
          Include deleted
        </label>
      </div>
    </div>
  );
}
