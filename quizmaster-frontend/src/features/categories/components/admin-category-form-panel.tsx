import { Loader2, Plus, Save, X } from "lucide-react";
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

  useEffect(() => {
    setName(category?.name ?? "");
  }, [category]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName.length < 2) return;

    if (category) {
      onUpdate(category.id, { name: trimmedName });
      return;
    }

    onCreate({ name: trimmedName });
    setName("");
  }

  return (
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>
            {isEditing ? "Chỉnh sửa category" : "Tạo category mới"}
          </CardTitle>
          <CardDescription>
            Category giúp nhóm quiz và câu hỏi theo chủ đề.
          </CardDescription>
        </div>

        {isEditing ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancelEdit}
          >
            <X className="size-4" />
            Hủy sửa
          </Button>
        ) : null}
      </CardHeader>

      <CardContent>
        <form
          className="grid gap-4 lg:grid-cols-[1fr_auto]"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="text-sm font-medium">Tên category</label>
            <Input
              value={name}
              disabled={isSubmitting}
              className="mt-2 h-10 rounded-xl"
              placeholder="Ví dụ: Backend, Frontend, SQL..."
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full lg:w-auto"
              disabled={isSubmitting || name.trim().length < 2}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang lưu...
                </>
              ) : isEditing ? (
                <>
                  <Save className="size-4" />
                  Lưu thay đổi
                </>
              ) : (
                <>
                  <Plus className="size-4" />
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
