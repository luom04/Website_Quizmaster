import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

const QUESTION_BANK_PAGE_SIZE = 10;

export function AdminQuizQuestionManager({
  quiz,
  onClose,
}: AdminQuizQuestionManagerProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [orderIndex, setOrderIndex] = useState(1);
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionPage, setQuestionPage] = useState(1);

  const hasQuizCategory = Boolean(quiz?.categoryId);
  const trimmedQuestionSearch = questionSearch.trim();

  const quizDetailQuery = useQuizDetail(quiz?.id);
  const questionsQuery = useQuestions(
    {
      page: questionPage,
      limit: QUESTION_BANK_PAGE_SIZE,
      categoryId: quiz?.categoryId ?? undefined,
      search: trimmedQuestionSearch || undefined,
    },
    hasQuizCategory,
  );

  const addQuestionMutation = useAddQuestionToQuiz();
  const removeQuestionMutation = useRemoveQuestionFromQuiz();

  const quizDetail = quizDetailQuery.data;
  const quizQuestions = quizDetail?.quizQuestions ?? [];
  const questionBank = questionsQuery.data?.items ?? [];
  const questionMeta = questionsQuery.data?.meta;

  const addedQuestionIds = useMemo(
    () => new Set(quizQuestions.map((item) => item.questionId)),
    [quizQuestions],
  );

  const availableQuestions = questionBank.filter(
    (question) => !addedQuestionIds.has(question.id),
  );

  const totalQuestionPages = questionMeta?.totalPages ?? 1;
  const totalQuestionCount = questionMeta?.total ?? 0;

  const isLoading = quizDetailQuery.isLoading || questionsQuery.isLoading;
  const isQuestionBankFetching = questionsQuery.isFetching;
  const isMutating =
    addQuestionMutation.isPending || removeQuestionMutation.isPending;

  useEffect(() => {
    setSelectedQuestionId("");
    setQuestionSearch("");
    setQuestionPage(1);
    setOrderIndex(1);
  }, [quiz?.id]);

  if (!quiz) return null;

  function handleQuestionSearchChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setQuestionSearch(event.target.value);
    setQuestionPage(1);
    setSelectedQuestionId("");
  }

  async function handleAddQuestion() {
    if (!quiz) return;

    if (!hasQuizCategory) {
      toast.error("Quiz cần có category trước khi thêm câu hỏi.");
      return;
    }

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
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Quản lý câu hỏi trong quiz</CardTitle>
          <CardDescription>
            Thêm hoặc xóa câu hỏi khỏi quiz:{" "}
            <span className="font-medium text-foreground">{quiz.title}</span>
          </CardDescription>
          <CardDescription>
            Category:{" "}
            <span className="font-medium text-foreground">
              {quiz.category?.name ?? "Chưa có category"}
            </span>
          </CardDescription>
        </div>

        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="mr-2 size-4" />
          Đóng
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-2xl border bg-muted/30 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Thêm câu hỏi từ ngân hàng</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Chỉ hiển thị câu hỏi active, chưa có trong quiz, và thuộc cùng
              category với quiz hiện tại.
            </p>
          </div>

          {!hasQuizCategory ? (
            <div className="rounded-xl border border-dashed bg-background p-4 text-sm text-muted-foreground">
              Quiz này chưa có category. Vui lòng cập nhật category cho quiz
              trước khi thêm câu hỏi.
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                value={questionSearch}
                onChange={handleQuestionSearchChange}
                placeholder="Tìm câu hỏi trong category này..."
              />

              <div className="grid gap-3 lg:grid-cols-[1fr_140px_auto]">
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedQuestionId}
                  disabled={
                    isQuestionBankFetching || availableQuestions.length === 0
                  }
                  onChange={(event) =>
                    setSelectedQuestionId(event.target.value)
                  }
                >
                  <option value="">
                    {isQuestionBankFetching
                      ? "Đang tải câu hỏi..."
                      : "Chọn câu hỏi từ question bank"}
                  </option>

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
                  disabled={isMutating}
                  onChange={(event) =>
                    setOrderIndex(Number(event.target.value))
                  }
                />

                <Button
                  type="button"
                  disabled={
                    isMutating ||
                    !selectedQuestionId ||
                    !hasQuizCategory ||
                    orderIndex < 1
                  }
                  onClick={handleAddQuestion}
                >
                  {addQuestionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 size-4" />
                      Thêm câu hỏi
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <div>
                  Tổng câu hỏi trong category: {totalQuestionCount}. Trang{" "}
                  {questionPage}/{totalQuestionPages}.
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={questionPage <= 1 || isQuestionBankFetching}
                    onClick={() =>
                      setQuestionPage((current) => Math.max(1, current - 1))
                    }
                  >
                    Trước
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      questionPage >= totalQuestionPages ||
                      isQuestionBankFetching
                    }
                    onClick={() =>
                      setQuestionPage((current) =>
                        Math.min(totalQuestionPages, current + 1),
                      )
                    }
                  >
                    Sau
                  </Button>
                </div>
              </div>

              {!isQuestionBankFetching && availableQuestions.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-background p-4 text-sm text-muted-foreground">
                  Không có câu hỏi phù hợp trên trang này. Hãy thử tìm kiếm khác
                  hoặc chuyển trang.
                </div>
              ) : null}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Đang tải danh sách câu hỏi trong quiz...
          </div>
        ) : quizQuestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
            Quiz này chưa có câu hỏi nào.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Question</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Options</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {quizQuestions.map((item) => (
                  <tr key={item.questionId} className="border-t">
                    <td className="px-4 py-3 font-medium">{item.orderIndex}</td>

                    <td className="px-4 py-3">
                      <div className="font-medium">{item.question.content}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {item.questionId}
                      </div>
                    </td>

                    <td className="px-4 py-3">{item.question.type}</td>

                    <td className="px-4 py-3">
                      {item.question.options?.length ?? 0} options
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isMutating}
                        onClick={() => handleRemoveQuestion(item.questionId)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
