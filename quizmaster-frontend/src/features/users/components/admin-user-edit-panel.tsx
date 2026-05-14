import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AdminUpdateUserRequest, AdminUser, UserRole } from "@/types/user";

type AdminUserEditPanelProps = {
  user: AdminUser | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (payload: AdminUpdateUserRequest) => void;
};

export function AdminUserEditPanel({
  user,
  isSubmitting,
  onCancel,
  onSubmit,
}: AdminUserEditPanelProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!user) return;

    setName(user.name || "");
    setRole(user.role);
    setIsActive(user.isActive);
  }, [user]);

  if (!user) return null;

  return (
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Chỉnh sửa user</CardTitle>
          <CardDescription>
            Cập nhật tên, role và trạng thái hoạt động của tài khoản.
          </CardDescription>
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="size-4" />
          Đóng
        </Button>
      </CardHeader>

      <CardContent>
        <form
          className="grid gap-4 lg:grid-cols-[1fr_180px_180px_auto]"
          onSubmit={(event) => {
            event.preventDefault();

            onSubmit({
              name: name.trim(),
              role,
              isActive,
            });
          }}
        >
          <div>
            <label className="text-sm font-medium">Tên hiển thị</label>
            <Input
              value={name}
              disabled={isSubmitting}
              className="mt-2 h-10 rounded-xl"
              placeholder="Nhập tên user"
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Role</label>
            <select
              value={role}
              disabled={isSubmitting}
              className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(event) => setRole(event.target.value as UserRole)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Trạng thái</label>
            <select
              value={isActive ? "active" : "inactive"}
              disabled={isSubmitting}
              className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(event) => setIsActive(event.target.value === "active")}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || name.trim().length < 2}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
