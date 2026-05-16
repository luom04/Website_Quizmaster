import {
  Edit3,
  FileText,
  RotateCcw,
  Trash2,
  Trophy,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/types/user";

type AdminUserTableProps = {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onRestore: (user: AdminUser) => void;
  isMutating?: boolean;
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getInitials(name?: string | null, email?: string) {
  const value = name || email || "U";

  return value
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getRoleClassName(role: AdminUser["role"]) {
  return role === "admin"
    ? "border-violet-200 bg-violet-500/10 text-violet-700"
    : "border-blue-200 bg-blue-500/10 text-blue-700";
}

export function AdminUserTable({
  users,
  onEdit,
  onDelete,
  onRestore,
  isMutating,
}: AdminUserTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed bg-background p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-500/10 text-slate-700">
          <UserRound className="size-6" />
        </div>

        <h3 className="mt-4 text-sm font-semibold">Không có user nào</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Không có user nào khớp với bộ lọc hiện tại. Hãy thử đổi search, role
          hoặc trạng thái.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border bg-background shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3">Deleted</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const isDeleted = Boolean(user.deletedAt);
              const quizCount = user._count?.quizzes ?? 0;
              const attemptCount = user._count?.attempts ?? 0;

              return (
                <tr
                  key={user.id}
                  className="border-t transition hover:bg-muted/40"
                >
                  <td className="max-w-[320px] px-4 py-4 align-top">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name || user.email}
                          className="size-11 rounded-2xl object-cover"
                        />
                      ) : (
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-500/10 text-sm font-semibold text-slate-700">
                          {getInitials(user.name, user.email)}
                        </span>
                      )}

                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {user.name || "Unnamed user"}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <Badge
                      variant="outline"
                      className={`rounded-full px-2.5 py-1 capitalize ${getRoleClassName(
                        user.role,
                      )}`}
                    >
                      {user.role}
                    </Badge>
                  </td>

                  <td className="px-4 py-4 align-top">
                    {user.isActive ? (
                      <Badge
                        variant="outline"
                        className="rounded-full border-emerald-200 bg-emerald-500/10 px-2.5 py-1 text-emerald-700"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="rounded-full border-amber-200 bg-amber-500/10 px-2.5 py-1 text-amber-700"
                      >
                        Inactive
                      </Badge>
                    )}
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-700">
                        <FileText className="size-3.5" />
                        {quizCount} quizzes
                      </span>

                      <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700">
                        <Trophy className="size-3.5" />
                        {attemptCount} attempts
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    {isDeleted ? (
                      <Badge
                        variant="outline"
                        className="rounded-full border-rose-200 bg-rose-500/10 px-2.5 py-1 text-rose-700"
                      >
                        Deleted
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  <td className="px-4 py-4 align-top text-muted-foreground">
                    {formatDateTime(user.createdAt)}
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                        disabled={isMutating}
                        onClick={() => onEdit(user)}
                      >
                        <Edit3 className="mr-2 size-4" />
                        Edit
                      </Button>

                      {isDeleted ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer"
                          disabled={isMutating}
                          onClick={() => onRestore(user)}
                        >
                          <RotateCcw className="mr-2 size-4" />
                          Restore
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer text-destructive hover:text-destructive disabled:cursor-not-allowed"
                          disabled={isMutating}
                          onClick={() => onDelete(user)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
