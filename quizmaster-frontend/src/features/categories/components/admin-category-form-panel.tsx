import { FolderPlus, FolderTree, Loader2, Plus, Save, X } from "lucide-react";
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
import type { Category, CreateCategoryRequest } from "@/types/category";

type AdminCategoryFormPanelProps = {
  category: Category | null;
  isSubmitting?: boolean;
  onCancelEdit: () => void;
  onCreate: (payload: CreateCategoryRequest) => void;
  onUpdate: (categoryId: string, payload: CreateCategoryRequest) => void;
};

export function AdminCategoryFormPanel({
  category,
  isSubmitting,
  onCancelEdit,
  onCreate,
  onUpdate,
}: AdminCategoryFormPanelProps) {
  const [name, setName] = useState("");

  const isEditing = Boolean(category);
  const trimmedName = name.trim();
  const submitDisabled = isSubmitting || trimmedName.length < 2;

  useEffect(() => {
    setName(category?.name ?? "");
  }, [category]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (trimmedName.length < 2) return;

    if (category) {
      onUpdate(category.id, { name: trimmedName });
      return;
    }

    onCreate({ name: trimmedName });
    setName("");
  }

  return (
    <Card className="overflow-hidden rounded-3xl shadow-sm">
      <CardHeader className="relative overflow-hidden border-b bg-amber-50/80">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-500/20" />
        <div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-amber-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>
              {isEditing ? "Chỉnh sửa category" : "Tạo category mới"}
            </CardTitle>
            <CardDescription className="mt-2">
              Category giúp nhóm quiz và câu hỏi theo cùng một chủ đề.
            </CardDescription>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 font-medium text-amber-700">
                {isEditing ? "Edit mode" : "Create mode"}
              </span>

              <span className="inline-flex rounded-full bg-background/80 px-2.5 py-1 font-medium text-muted-foreground">
                Question bank group
              </span>
            </div>
          </div>

          {isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={isSubmitting}
              onClick={onCancelEdit}
            >
              <X className="mr-2 size-4" />
              Hủy sửa
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="rounded-3xl border bg-background p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                {isEditing ? (
                  <FolderTree className="size-5" />
                ) : (
                  <FolderPlus className="size-5" />
                )}
              </span>

              <div>
                <h3 className="text-sm font-semibold">Thông tin category</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Đặt tên ngắn gọn, dễ hiểu để admin chọn đúng nhóm câu hỏi khi
                  tạo quiz.
                </p>
              </div>
            </div>

            <label className="text-sm font-medium">Tên category</label>
            <Input
              value={name}
              disabled={isSubmitting}
              className="mt-2 h-10 rounded-xl"
              placeholder="Ví dụ: SQL, Python, Data Engineering..."
              onChange={(event) => setName(event.target.value)}
            />

            {trimmedName.length > 0 && trimmedName.length < 2 ? (
              <p className="mt-2 text-xs text-destructive">
                Tên category cần ít nhất 2 ký tự.
              </p>
            ) : null}
          </section>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="cursor-pointer disabled:cursor-not-allowed"
              disabled={submitDisabled}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Đang lưu...
                </>
              ) : isEditing ? (
                <>
                  <Save className="mr-2 size-4" />
                  Lưu thay đổi
                </>
              ) : (
                <>
                  <Plus className="mr-2 size-4" />
                  Tạo category
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
