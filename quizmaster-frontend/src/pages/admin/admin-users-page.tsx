import { AlertCircle, RefreshCcw, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminUserEditPanel } from "@/features/users/components/admin-user-edit-panel";
import { AdminUserFilters } from "@/features/users/components/admin-user-filters";
import { AdminUserTable } from "@/features/users/components/admin-user-table";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import {
  useAdminDeleteUser,
  useAdminRestoreUser,
  useAdminUpdateUser,
  useAdminUsers,
} from "@/features/users/users.hooks";
import { useDebounce } from "@/hooks/useDebounce";
import { getApiErrorMessage } from "@/lib/axios";
import type { AdminUpdateUserRequest, AdminUser, UserRole } from "@/types/user";

function UsersLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 rounded-3xl" />
      <Skeleton className="h-20 rounded-3xl" />
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );
}

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"" | UserRole>("");
  const [activeStatus, setActiveStatus] = useState<"" | "active" | "inactive">(
    "",
  );
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const debouncedSearch = useDebounce(search);

  const usersParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      role: role || undefined,
      isActive: activeStatus === "" ? undefined : activeStatus === "active",
      includeDeleted,
    }),
    [activeStatus, debouncedSearch, includeDeleted, page, role],
  );

  const usersQuery = useAdminUsers(usersParams);
  const updateUserMutation = useAdminUpdateUser();
  const deleteUserMutation = useAdminDeleteUser();
  const restoreUserMutation = useAdminRestoreUser();

  const users = usersQuery.data?.items ?? [];
  const meta = usersQuery.data?.meta;

  const isMutating =
    updateUserMutation.isPending ||
    deleteUserMutation.isPending ||
    restoreUserMutation.isPending;

  function resetPage() {
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    resetPage();
  }

  function handleRoleChange(value: "" | UserRole) {
    setRole(value);
    resetPage();
  }

  function handleActiveStatusChange(value: "" | "active" | "inactive") {
    setActiveStatus(value);
    resetPage();
  }

  function handleIncludeDeletedChange(value: boolean) {
    setIncludeDeleted(value);
    resetPage();
  }

  async function handleUpdateUser(payload: AdminUpdateUserRequest) {
    if (!editingUser) return;

    try {
      await updateUserMutation.mutateAsync({
        userId: editingUser.id,
        payload,
      });

      toast.success("Cập nhật user thành công");
      setEditingUser(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Không thể cập nhật user. Vui lòng thử lại."),
      );
    }
  }

  async function handleDeleteUser(user: AdminUser) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa user "${user.email}" không?`,
    );

    if (!confirmed) return;

    try {
      await deleteUserMutation.mutateAsync(user.id);
      toast.success("Đã xóa user");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Không thể xóa user. Vui lòng thử lại."),
      );
    }
  }

  async function handleRestoreUser(user: AdminUser) {
    try {
      await restoreUserMutation.mutateAsync(user.id);
      toast.success("Đã restore user");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Không thể restore user. Vui lòng thử lại."),
      );
    }
  }

  if (usersQuery.isPending && usersQuery.data === undefined) {
    return <UsersLoading />;
  }

  if (usersQuery.isError) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="Không thể tải danh sách users"
        description="Có lỗi xảy ra khi lấy dữ liệu người dùng. Vui lòng thử lại sau."
        action={
          <Button onClick={() => usersQuery.refetch()}>
            <RefreshCcw className="size-4" />
            Tải lại
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
        <AdminPageHeader
          eyebrow="User management"
          title="Quản lý người dùng"
          description="Theo dõi tài khoản, phân quyền, trạng thái hoạt động và xử lý các tài khoản đã bị xóa mềm."
          icon={Users}
          tone="slate"
          meta={
            <span className="inline-flex rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-medium text-slate-700">
              Total users: {meta?.total ?? 0}
            </span>
          }
          actions={
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => usersQuery.refetch()}
            >
              <RefreshCcw className="mr-2 size-4" />
              Refresh
            </Button>
          }
        />
      </section>

      <AdminUserFilters
        search={search}
        role={role}
        activeStatus={activeStatus}
        includeDeleted={includeDeleted}
        onSearchChange={handleSearchChange}
        onRoleChange={handleRoleChange}
        onActiveStatusChange={handleActiveStatusChange}
        onIncludeDeletedChange={handleIncludeDeletedChange}
      />

      <AdminUserEditPanel
        user={editingUser}
        isSubmitting={updateUserMutation.isPending}
        onCancel={() => setEditingUser(null)}
        onSubmit={handleUpdateUser}
      />
      {usersQuery.isFetching ? (
        <p className="text-sm text-muted-foreground">
          Đang cập nhật danh sách users...
        </p>
      ) : null}

      <AdminUserTable
        users={users}
        isMutating={isMutating}
        onEdit={setEditingUser}
        onDelete={handleDeleteUser}
        onRestore={handleRestoreUser}
      />

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 rounded-3xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} / {meta.totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="cursor-pointer disabled:cursor-not-allowed"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              className="cursor-pointer disabled:cursor-not-allowed"
              disabled={page >= meta.totalPages}
              onClick={() =>
                setPage((current) => Math.min(meta.totalPages, current + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
