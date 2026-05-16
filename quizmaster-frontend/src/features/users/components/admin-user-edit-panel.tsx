import {
  Loader2,
  Save,
  ShieldCheck,
  UserCog,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

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

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    onSubmit({
      name: name.trim(),
      role,
      isActive,
    });
  }

  return (
    <Card className="overflow-hidden rounded-3xl shadow-sm">
      <CardHeader className="relative overflow-hidden border-b bg-slate-50/80">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-500/15 via-blue-500/10 to-violet-500/15" />
        <div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-slate-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-slate-500/10 text-slate-700">
                <UserCog className="size-5" />
              </span>

              <div>
                <CardTitle>Chỉnh sửa user</CardTitle>
                <CardDescription className="mt-1">
                  Cập nhật tên hiển thị, role và trạng thái hoạt động của tài
                  khoản.
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex rounded-full bg-violet-500/10 px-2.5 py-1 font-medium text-violet-700">
                {role}
              </span>

              <span className="inline-flex rounded-full bg-background/80 px-2.5 py-1 font-medium text-muted-foreground">
                {isActive ? "Active" : "Inactive"}
              </span>

              <span className="inline-flex rounded-full bg-background/80 px-2.5 py-1 font-medium text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            <X className="mr-2 size-4" />
            Đóng
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="rounded-3xl border bg-background p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-500/10 text-slate-700">
                <UserRound className="size-5" />
              </span>

              <div>
                <h3 className="text-sm font-semibold">Thông tin người dùng</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Tên hiển thị dùng để nhận diện user trong dashboard và lịch sử
                  làm bài.
                </p>
              </div>
            </div>

            <label className="text-sm font-medium">Tên hiển thị</label>
            <Input
              value={name}
              disabled={isSubmitting}
              className="mt-2 h-10 rounded-xl"
              placeholder="Nhập tên hiển thị"
              onChange={(event) => setName(event.target.value)}
            />
          </section>

          <section className="rounded-3xl border bg-background p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700">
                <ShieldCheck className="size-5" />
              </span>

              <div>
                <h3 className="text-sm font-semibold">Quyền và trạng thái</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Cẩn thận khi cấp role admin vì tài khoản này có thể quản lý
                  quiz, câu hỏi và người dùng.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Role</label>
                <select
                  value={role}
                  disabled={isSubmitting}
                  className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-input bg-background px-3 text-sm outline-none transition hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-input bg-background px-3 text-sm outline-none transition hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(event) =>
                    setIsActive(event.target.value === "active")
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="cursor-pointer disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
