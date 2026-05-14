import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuestions } from "@/features/questions/questions.hooks";
import {
  useAddQuestionToQuiz,
  useQuizDetail,
  useRemoveQuestionFromQuiz,
} from "@/features/quizzes/quizzes.hooks";
import { getApiErrorMessage } from "@/lib/axios";
import type { Quiz } from "@/types/quiz";

type AdminQuizQuestionManagerProps = {
  quiz: Quiz | null;
  onClose: () => void;
};

export function AdminQuizQuestionManager({
  quiz,
  onClose,
}: AdminQuizQuestionManagerProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [orderIndex, setOrderIndex] = useState(1);

  const quizDetailQuery = useQuizDetail(quiz?.id);
  const questionsQuery = useQuestions({
    page: 1,
    limit: 100,
  });

  const addQuestionMutation = useAddQuestionToQuiz();
  const removeQuestionMutation = useRemoveQuestionFromQuiz();

  const quizDetail = quizDetailQuery.data;
  const quizQuestions = quizDetail?.quizQuestions ?? [];
  const questionBank = questionsQuery.data?.items ?? [];

  const addedQuestionIds = useMemo(
    () => new Set(quizQuestions.map((item) => item.questionId)),
    [quizQuestions],
  );

  const availableQuestions = questionBank.filter(
    (question) => !addedQuestionIds.has(question.id),
  );

  const isLoading = quizDetailQuery.isLoading || questionsQuery.isLoading;
  const isMutating =
    addQuestionMutation.isPending || removeQuestionMutation.isPending;

  if (!quiz) return null;

  async function handleAddQuestion() {
    if (!quiz) return;

    if (!selectedQuestionId) {
      toast.error("Vui lòng chọn câu hỏi cần thêm.");
      return;
    }

    try {
      await addQuestionMutation.mutateAsync({
        quizId: quiz.id,
        payload: {
          questionId: selectedQuestionId,
          orderIndex,
        },
      });

      toast.success("Đã thêm câu hỏi vào quiz");
      setSelectedQuestionId("");
      setOrderIndex((current) => current + 1);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể thêm câu hỏi vào quiz. Vui lòng thử lại.",
        ),
      );
    }
  }

  async function handleRemoveQuestion(questionId: string) {
    if (!quiz) return;

    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa câu hỏi này khỏi quiz không?",
    );

    if (!confirmed) return;

    try {
      await removeQuestionMutation.mutateAsync({
        quizId: quiz.id,
        questionId,
      });

      toast.success("Đã xóa câu hỏi khỏi quiz");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể xóa câu hỏi khỏi quiz. Vui lòng thử lại.",
        ),
      );
    }
  }

  return (
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Quản lý câu hỏi trong quiz</CardTitle>
          <CardDescription>
            Thêm hoặc xóa câu hỏi khỏi quiz:{" "}
            <span className="font-medium text-foreground">{quiz.title}</span>
          </CardDescription>
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          <X className="size-4" />
          Đóng
        </Button>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-2xl border bg-muted/30 p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_160px_auto]">
            <select
              value={selectedQuestionId}
              disabled={isLoading || isMutating}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(event) => setSelectedQuestionId(event.target.value)}
            >
              <option value="">Chọn câu hỏi từ question bank</option>

              {availableQuestions.map((question) => (
                <option key={question.id} value={question.id}>
                  {question.content}
                </option>
              ))}
            </select>

            <Input
              type="number"
              min={1}
              value={orderIndex}
              disabled={isLoading || isMutating}
              className="h-10 rounded-xl"
              onChange={(event) => setOrderIndex(Number(event.target.value))}
            />

            <Button
              type="button"
              disabled={
                isLoading || isMutating || !selectedQuestionId || orderIndex < 1
              }
              onClick={handleAddQuestion}
            >
              {addQuestionMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Thêm câu hỏi
                </>
              )}
            </Button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Chỉ hiển thị các câu hỏi active và chưa có trong quiz hiện tại.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border bg-muted/30 p-6 text-sm text-muted-foreground">
            Đang tải danh sách câu hỏi trong quiz...
          </div>
        ) : quizQuestions.length === 0 ? (
          <div className="rounded-2xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Quiz này chưa có câu hỏi nào.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Question</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Options</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {quizQuestions.map((item) => (
                    <tr key={item.questionId} className="bg-card">
                      <td className="px-4 py-3">{item.orderIndex}</td>

                      <td className="px-4 py-3">
                        <p className="line-clamp-2 font-medium">
                          {item.question.content}
                        </p>
                        <p className="mt-1 break-all text-xs text-muted-foreground">
                          {item.questionId}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {item.question.type}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {item.question.options?.length ?? 0} options
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isMutating}
                            onClick={() =>
                              handleRemoveQuestion(item.questionId)
                            }
                          >
                            <Trash2 className="size-4" />
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
