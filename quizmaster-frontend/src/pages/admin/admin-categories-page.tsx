import { AlertCircle, FolderTree, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminCategoryFilters } from "@/features/categories/components/admin-category-filters";
import { AdminCategoryFormPanel } from "@/features/categories/components/admin-category-form-panel";
import { AdminCategoryTable } from "@/features/categories/components/admin-category-table";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  usePermanentlyDeleteCategory,
  useRestoreCategory,
  useUpdateCategory,
} from "@/features/categories/categories.hooks";
import { getApiErrorMessage } from "@/lib/axios";
import type { Category, CreateCategoryRequest } from "@/types/category";

function CategoriesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 rounded-3xl" />
      <Skeleton className="h-32 rounded-3xl" />
      <Skeleton className="h-20 rounded-3xl" />
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );
}

export function AdminCategoriesPage() {
  const [search, setSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const categoriesQuery = useCategories({
    includeDeleted,
  });

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const restoreCategoryMutation = useRestoreCategory();
  const permanentlyDeleteCategoryMutation = usePermanentlyDeleteCategory();

  const categories = categoriesQuery.data ?? [];

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return categories;

    return categories.filter((category) =>
      category.name.toLowerCase().includes(keyword),
    );
  }, [categories, search]);

  const isInitialLoading = categoriesQuery.isLoading && !categoriesQuery.data;

  const isMutating =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    deleteCategoryMutation.isPending ||
    restoreCategoryMutation.isPending ||
    permanentlyDeleteCategoryMutation.isPending;

  async function handleCreateCategory(payload: CreateCategoryRequest) {
    try {
      await createCategoryMutation.mutateAsync(payload);
      toast.success("Tạo category thành công");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Không thể tạo category. Vui lòng thử lại."),
      );
    }
  }

  async function handleUpdateCategory(
    categoryId: string,
    payload: CreateCategoryRequest,
  ) {
    try {
      await updateCategoryMutation.mutateAsync({
        categoryId,
        payload,
      });

      toast.success("Cập nhật category thành công");
      setEditingCategory(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể cập nhật category. Vui lòng thử lại.",
        ),
      );
    }
  }

  async function handleDeleteCategory(category: Category) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa category "${category.name}" không?`,
    );

    if (!confirmed) return;

    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      toast.success("Đã xóa category");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Không thể xóa category. Vui lòng thử lại."),
      );
    }
  }

  async function handleRestoreCategory(category: Category) {
    try {
      await restoreCategoryMutation.mutateAsync(category.id);
      toast.success("Đã restore category");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể restore category. Vui lòng thử lại.",
        ),
      );
    }
  }

  async function handlePermanentDeleteCategory(category: Category) {
    const confirmed = window.confirm(
      `Xóa vĩnh viễn category "${category.name}"? Hành động này không thể hoàn tác.`,
    );

    if (!confirmed) return;

    try {
      await permanentlyDeleteCategoryMutation.mutateAsync(category.id);
      toast.success("Đã xóa vĩnh viễn category");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể xóa vĩnh viễn category. Vui lòng thử lại.",
        ),
      );
    }
  }

  if (isInitialLoading) {
    return <CategoriesLoading />;
  }

  if (categoriesQuery.isError) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="Không thể tải danh sách categories"
        description="Có lỗi xảy ra khi lấy dữ liệu category. Vui lòng thử lại sau."
        action={
          <Button onClick={() => categoriesQuery.refetch()}>
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
          eyebrow="Category management"
          title="Quản lý categories"
          description="Tạo và quản lý các nhóm chủ đề dùng cho quiz và ngân hàng câu hỏi."
          icon={FolderTree}
          tone="amber"
          meta={
            <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
              Total categories: {categories.length}
            </span>
          }
          actions={
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => categoriesQuery.refetch()}
            >
              <RefreshCcw className="mr-2 size-4" />
              Refresh
            </Button>
          }
        />
      </section>

      <AdminCategoryFormPanel
        category={editingCategory}
        isSubmitting={
          createCategoryMutation.isPending || updateCategoryMutation.isPending
        }
        onCancelEdit={() => setEditingCategory(null)}
        onCreate={handleCreateCategory}
        onUpdate={handleUpdateCategory}
      />

      <AdminCategoryFilters
        search={search}
        includeDeleted={includeDeleted}
        onSearchChange={setSearch}
        onIncludeDeletedChange={setIncludeDeleted}
      />

      {categoriesQuery.isFetching ? (
        <p className="text-sm text-muted-foreground">
          Đang cập nhật danh sách categories...
        </p>
      ) : null}

      <AdminCategoryTable
        categories={filteredCategories}
        isMutating={isMutating}
        onEdit={setEditingCategory}
        onDelete={handleDeleteCategory}
        onRestore={handleRestoreCategory}
        onPermanentDelete={handlePermanentDeleteCategory}
      />
    </div>
  );
}
