import { Edit3, RotateCcw, Trash2 } from "lucide-react";

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

export function AdminUserTable({
  users,
  onEdit,
  onDelete,
  onRestore,
  isMutating,
}: AdminUserTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-3xl border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
        Không có user nào khớp với bộ lọc hiện tại.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Deleted</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {users.map((user) => {
              const isDeleted = Boolean(user.deletedAt);

              return (
                <tr key={user.id} className="bg-card">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted text-xs font-semibold">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name || user.email}
                            className="size-full object-cover"
                          />
                        ) : (
                          getInitials(user.name, user.email)
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium">
                          {user.name || "Unnamed user"}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      variant={user.role === "admin" ? "secondary" : "outline"}
                    >
                      {user.role}
                    </Badge>
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant={user.isActive ? "secondary" : "outline"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>

                  <td className="px-4 py-3">
                    {isDeleted ? (
                      <Badge variant="outline">Deleted</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(user.createdAt)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isMutating || isDeleted}
                        onClick={() => onEdit(user)}
                      >
                        <Edit3 className="size-4" />
                        Edit
                      </Button>

                      {isDeleted ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isMutating}
                          onClick={() => onRestore(user)}
                        >
                          <RotateCcw className="size-4" />
                          Restore
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isMutating}
                          onClick={() => onDelete(user)}
                        >
                          <Trash2 className="size-4" />
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
