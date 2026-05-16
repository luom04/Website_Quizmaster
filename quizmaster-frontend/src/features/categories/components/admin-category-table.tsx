import {
  Edit3,
  FolderTree,
  Link2,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";

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
      <div className="rounded-3xl border border-dashed bg-background p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
          <FolderTree className="size-6" />
        </div>

        <h3 className="mt-4 text-sm font-semibold">Không có category nào</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Không có category nào khớp với bộ lọc hiện tại.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border bg-background shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Quizzes</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => {
              const isDeleted = Boolean(category.deletedAt);
              const quizCount = category._count?.quizzes ?? 0;

              return (
                <tr
                  key={category.id}
                  className="border-t transition hover:bg-muted/40"
                >
                  <td className="max-w-[320px] px-4 py-4 align-top">
                    <div className="font-medium">{category.name}</div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      ID: {category.id}
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-700">
                      <Link2 className="size-3.5" />
                      {quizCount} quizzes
                    </span>
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
                      <Badge
                        variant="outline"
                        className="rounded-full border-emerald-200 bg-emerald-500/10 px-2.5 py-1 text-emerald-700"
                      >
                        Active
                      </Badge>
                    )}
                  </td>

                  <td className="px-4 py-4 align-top text-muted-foreground">
                    {formatDateTime(category.createdAt)}
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap justify-end gap-2">
                      {!isDeleted ? (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer"
                            disabled={isMutating}
                            onClick={() => onEdit(category)}
                          >
                            <Edit3 className="mr-2 size-4" />
                            Edit
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer text-destructive hover:text-destructive disabled:cursor-not-allowed"
                            disabled={isMutating}
                            onClick={() => onDelete(category)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer"
                            disabled={isMutating}
                            onClick={() => onRestore(category)}
                          >
                            <RotateCcw className="mr-2 size-4" />
                            Restore
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer text-destructive hover:text-destructive disabled:cursor-not-allowed"
                            disabled={isMutating}
                            onClick={() => onPermanentDelete(category)}
                          >
                            <XCircle className="mr-2 size-4" />
                            Delete forever
                          </Button>
                        </>
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
