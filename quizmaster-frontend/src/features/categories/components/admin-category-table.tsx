import { Edit3, RotateCcw, Trash2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/category";

type AdminCategoryTableProps = {
  categories: Category[];
  isMutating?: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onRestore: (category: Category) => void;
  onPermanentDelete: (category: Category) => void;
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminCategoryTable({
  categories,
  isMutating,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
}: AdminCategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-3xl border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
        Không có category nào khớp với bộ lọc hiện tại.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Quizzes</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {categories.map((category) => {
              const isDeleted = Boolean(category.deletedAt);
              const quizCount = category._count?.quizzes ?? 0;

              return (
                <tr key={category.id} className="bg-card">
                  <td className="px-4 py-3">
                    <p className="font-medium">{category.name}</p>
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      {category.id}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant="outline">{quizCount} quizzes</Badge>
                  </td>

                  <td className="px-4 py-3">
                    {isDeleted ? (
                      <Badge variant="outline">Deleted</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(category.createdAt)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isMutating || isDeleted}
                        onClick={() => onEdit(category)}
                      >
                        <Edit3 className="size-4" />
                        Edit
                      </Button>

                      {isDeleted ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isMutating}
                            onClick={() => onRestore(category)}
                          >
                            <RotateCcw className="size-4" />
                            Restore
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isMutating}
                            onClick={() => onPermanentDelete(category)}
                          >
                            <XCircle className="size-4" />
                            Delete forever
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isMutating}
                          onClick={() => onDelete(category)}
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
