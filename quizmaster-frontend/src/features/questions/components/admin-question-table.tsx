import {
  ClipboardList,
  Edit3,
  Link2,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Question } from "@/types/question";

type AdminQuestionTableProps = {
  questions: Question[];
  isMutating?: boolean;
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
  onRestore: (question: Question) => void;
  onPermanentDelete: (question: Question) => void;
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getQuestionTypeLabel(type: Question["type"]) {
  return type === "multiple" ? "Multiple choice" : "Single choice";
}

function getQuestionTypeClassName(type: Question["type"]) {
  return type === "multiple"
    ? "border-violet-200 bg-violet-500/10 text-violet-700"
    : "border-blue-200 bg-blue-500/10 text-blue-700";
}

export function AdminQuestionTable({
  questions,
  isMutating,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
}: AdminQuestionTableProps) {
  if (questions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed bg-background p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <ClipboardList className="size-6" />
        </div>

        <h3 className="mt-4 text-sm font-semibold">Không có câu hỏi nào</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Không có câu hỏi nào khớp với bộ lọc hiện tại. Hãy thử đổi search,
          category hoặc type.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border bg-background shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Question</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Options</th>
              <th className="px-4 py-3">Relations</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {questions.map((question) => {
              const correctCount = question.options.filter(
                (option) => option.isCorrect,
              ).length;
              const isDeleted = Boolean(question.deletedAt);
              const quizRelationCount = question._count?.quizQuestions ?? 0;
              const attemptRelationCount =
                question._count?.attemptQuestions ?? 0;
              const relationCount = quizRelationCount + attemptRelationCount;
              const canPermanentDelete = isDeleted && relationCount === 0;

              const previewOptions = question.options.slice(0, 2);
              const hiddenOptionsCount =
                question.options.length - previewOptions.length;

              return (
                <tr
                  key={question.id}
                  className="border-t transition hover:bg-muted/40"
                >
                  <td className="max-w-[360px] px-4 py-4 align-top">
                    <div className="line-clamp-3 font-medium leading-6">
                      {question.content}
                    </div>

                    <div className="mt-2 truncate text-xs text-muted-foreground">
                      ID: {question.id}
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <Badge
                      variant="outline"
                      className={`rounded-full px-2.5 py-1 ${getQuestionTypeClassName(
                        question.type,
                      )}`}
                    >
                      {getQuestionTypeLabel(question.type)}
                    </Badge>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700">
                      {question.category?.name || "General"}
                    </span>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {question.options.length} options
                        </span>

                        <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          {correctCount} correct
                        </span>
                      </div>

                      {previewOptions.length > 0 ? (
                        <div className="space-y-1">
                          {previewOptions.map((option) => (
                            <div
                              key={option.id}
                              className="max-w-[240px] truncate text-xs text-muted-foreground"
                              title={option.content}
                            >
                              {option.isCorrect ? "✓ " : "• "}
                              {option.content}
                            </div>
                          ))}

                          {hiddenOptionsCount > 0 ? (
                            <div className="text-xs text-muted-foreground">
                              +{hiddenOptionsCount} more options
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-700">
                        <Link2 className="size-3.5" />
                        {quizRelationCount} quiz links
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700">
                        <ClipboardList className="size-3.5" />
                        {attemptRelationCount} attempts
                      </div>
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
                      <Badge
                        variant="outline"
                        className="rounded-full border-emerald-200 bg-emerald-500/10 px-2.5 py-1 text-emerald-700"
                      >
                        Active
                      </Badge>
                    )}
                  </td>

                  <td className="px-4 py-4 align-top text-sm text-muted-foreground">
                    {formatDateTime(question.createdAt)}
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
                            onClick={() => onEdit(question)}
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
                            onClick={() => onDelete(question)}
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
                            onClick={() => onRestore(question)}
                          >
                            <RotateCcw className="mr-2 size-4" />
                            Restore
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer text-destructive hover:text-destructive disabled:cursor-not-allowed"
                            disabled={isMutating || !canPermanentDelete}
                            title={
                              canPermanentDelete
                                ? "Delete forever"
                                : "Không thể xóa vĩnh viễn vì câu hỏi vẫn còn liên kết quiz hoặc attempt."
                            }
                            onClick={() => onPermanentDelete(question)}
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
