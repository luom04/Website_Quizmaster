import { Edit3, RotateCcw, Trash2, XCircle } from "lucide-react";

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
      <div className="rounded-3xl border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
        Không có câu hỏi nào khớp với bộ lọc hiện tại.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Question</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Options</th>
              <th className="px-4 py-3 font-medium">Relations</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
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

              return (
                <tr key={question.id} className="bg-card">
                  <td className="px-4 py-3">
                    <p className="line-clamp-2 max-w-xl font-medium">
                      {question.content}
                    </p>
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      {question.id}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant="outline">
                      {question.type === "multiple" ? "Multiple" : "Single"}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {question.category?.name || "General"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span>{question.options.length} options</span>
                      <span className="text-xs text-muted-foreground">
                        {correctCount} correct
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <span>{quizRelationCount} quiz links</span>
                      <span>{attemptRelationCount} attempts</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {isDeleted ? (
                      <Badge variant="outline">Deleted</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(question.createdAt)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {!isDeleted ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isMutating}
                            onClick={() => onEdit(question)}
                          >
                            <Edit3 className="size-4" />
                            Edit
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isMutating}
                            onClick={() => onDelete(question)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isMutating}
                            onClick={() => onRestore(question)}
                          >
                            <RotateCcw className="size-4" />
                            Restore
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isMutating || !canPermanentDelete}
                            title={
                              canPermanentDelete
                                ? "Xóa vĩnh viễn câu hỏi"
                                : "Không thể xóa cứng vì câu hỏi đã có quan hệ với quiz hoặc attempt"
                            }
                            onClick={() => onPermanentDelete(question)}
                          >
                            <XCircle className="size-4" />
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
