import { Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
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

  const nextOrderIndex = useMemo(() => {
    if (quizQuestions.length === 0) return 1;

    return Math.max(...quizQuestions.map((item) => item.orderIndex)) + 1;
  }, [quizQuestions]);

  const totalQuestionPages = questionMeta?.totalPages ?? 1;
  const totalQuestionCount = questionMeta?.total ?? 0;

  const isLoading = quizDetailQuery.isLoading || questionsQuery.isLoading;
  const isQuestionBankFetching = questionsQuery.isFetching;
  const isMutating =
    addQuestionMutation.isPending || removeQuestionMutation.isPending;

  useEffect(() => {
    setQuestionSearch("");
    setQuestionPage(1);
    setOrderIndex(1);
  }, [quiz?.id]);

  useEffect(() => {
    setOrderIndex(nextOrderIndex);
  }, [nextOrderIndex]);

  if (!quiz) return null;

  function handleQuestionSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setQuestionSearch(event.target.value);
    setQuestionPage(1);
  }

  async function handleAddQuestion(questionId: string) {
    if (!quiz) return;

    if (!hasQuizCategory) {
      toast.error("Quiz cần có category trước khi thêm câu hỏi.");
      return;
    }

    if (orderIndex < 1) {
      toast.error("Order index phải lớn hơn hoặc bằng 1.");
      return;
    }

    try {
      await addQuestionMutation.mutateAsync({
        quizId: quiz.id,
        payload: {
          questionId,
          orderIndex,
        },
      });

      toast.success("Đã thêm câu hỏi vào quiz");
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
    <Card className="overflow-hidden rounded-3xl shadow-sm">
      <CardHeader className="border-b bg-gradient-to-br from-violet-500/10 via-background to-blue-500/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Quản lý câu hỏi trong quiz</CardTitle>
            <CardDescription className="mt-2">
              Thêm, tìm kiếm và sắp xếp câu hỏi cho quiz:{" "}
              <span className="font-medium text-foreground">{quiz.title}</span>
            </CardDescription>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex rounded-full bg-violet-500/10 px-2.5 py-1 font-medium text-violet-600">
                Category locked
              </span>

              <span className="inline-flex rounded-full bg-background/80 px-2.5 py-1 font-medium text-muted-foreground">
                {quiz.category?.name ?? "Chưa có category"}
              </span>

              <span className="inline-flex rounded-full bg-background/80 px-2.5 py-1 font-medium text-muted-foreground">
                {quizQuestions.length} questions added
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={onClose}
          >
            <X className="mr-2 size-4" />
            Đóng
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-4 sm:p-6">
        <div className="rounded-3xl border bg-muted/20 p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-sm font-semibold">
                Ngân hàng câu hỏi theo category
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Chỉ hiển thị câu hỏi active, chưa có trong quiz và thuộc cùng
                category với quiz hiện tại.
              </p>
            </div>

            {hasQuizCategory ? (
              <div className="rounded-2xl border bg-background px-3 py-2 text-xs text-muted-foreground">
                Tổng trong category:{" "}
                <span className="font-semibold text-foreground">
                  {totalQuestionCount}
                </span>
              </div>
            ) : null}
          </div>

          {!hasQuizCategory ? (
            <div className="rounded-2xl border border-dashed bg-background p-5 text-sm text-muted-foreground">
              Quiz này chưa có category. Vui lòng cập nhật category cho quiz
              trước khi thêm câu hỏi.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_160px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={questionSearch}
                    onChange={handleQuestionSearchChange}
                    placeholder="Tìm câu hỏi trong category này..."
                    className="pl-9"
                  />
                </div>

                <Input
                  type="number"
                  min={1}
                  value={orderIndex}
                  disabled={isMutating}
                  onChange={(event) =>
                    setOrderIndex(Number(event.target.value))
                  }
                  title="Order index"
                />
              </div>

              {isQuestionBankFetching ? (
                <div className="flex items-center gap-2 rounded-2xl border bg-background px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Đang cập nhật question bank...
                </div>
              ) : null}

              {!isQuestionBankFetching && availableQuestions.length === 0 ? (
                <div className="rounded-2xl border border-dashed bg-background p-5 text-sm text-muted-foreground">
                  Không có câu hỏi phù hợp trên trang này. Hãy thử tìm kiếm khác
                  hoặc chuyển trang.
                </div>
              ) : (
                <div className="grid gap-3">
                  {availableQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="rounded-2xl border bg-background p-4 transition hover:border-violet-200 hover:bg-violet-500/5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                              {question.type}
                            </span>

                            <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
                              {question.options?.length ?? 0} options
                            </span>
                          </div>

                          <p className="line-clamp-3 text-sm font-medium leading-6">
                            {question.content}
                          </p>

                          <p className="mt-2 text-xs text-muted-foreground">
                            ID: {question.id}
                          </p>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          className="cursor-pointer lg:shrink-0"
                          disabled={isMutating || orderIndex < 1}
                          onClick={() => handleAddQuestion(question.id)}
                        >
                          {addQuestionMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 size-4 animate-spin" />
                              Đang thêm...
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 size-4" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <div>
                  Trang {questionPage}/{totalQuestionPages}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer disabled:cursor-not-allowed"
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
                    className="cursor-pointer disabled:cursor-not-allowed"
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
            </div>
          )}
        </div>

        <div>
          <div className="mb-4 flex flex-col gap-1">
            <h3 className="text-sm font-semibold">Câu hỏi đã thêm vào quiz</h3>
            <p className="text-sm text-muted-foreground">
              Danh sách câu hỏi hiện đang nằm trong quiz, được sắp xếp theo
              order index.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 rounded-2xl border bg-muted/20 p-5 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Đang tải danh sách câu hỏi trong quiz...
            </div>
          ) : quizQuestions.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
              Quiz này chưa có câu hỏi nào.
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border bg-background shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
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
                    <tr
                      key={item.questionId}
                      className="border-t transition hover:bg-muted/40"
                    >
                      <td className="px-4 py-3 font-medium">
                        #{item.orderIndex}
                      </td>

                      <td className="px-4 py-3">
                        <div className="line-clamp-2 font-medium">
                          {item.question.content}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {item.questionId}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {item.question.type}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {item.question.options?.length ?? 0} options
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer text-destructive hover:text-destructive disabled:cursor-not-allowed"
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
        </div>
      </CardContent>
    </Card>
  );
}
