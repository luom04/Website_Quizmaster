import {
  AlertCircle,
  ArrowLeft,
  FileCheck2,
  History,
  Home,
  ListChecks,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { ROUTES } from "@/config/routes";

import { ResultQuestionReview } from "@/features/attempts/components/result-question-review";
import { ResultSummaryCard } from "@/features/attempts/components/result-summary-card";
import { useAttemptResult } from "@/features/attempts/attempts.hooks";

function ResultLoading() {
  return (
    <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] qm-exam-focus-bg px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="qm-page-shell-wide space-y-6">
        <section className="qm-soft-card overflow-hidden">
          <div className="border-b bg-muted/25 p-6 sm:p-8">
            <Skeleton className="h-7 w-32 rounded-full" />
            <Skeleton className="mt-5 h-10 w-72 max-w-full" />
            <Skeleton className="mt-3 h-5 w-[520px] max-w-full" />
          </div>

          <div className="p-5 sm:p-6">
            <Skeleton className="h-3 w-full rounded-full" />

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-2xl" />
              ))}
            </div>
          </div>
        </section>

        <section className="qm-soft-card p-5 sm:p-6">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="mt-3 h-5 w-[460px] max-w-full" />
        </section>

        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  );
}

export function ResultPage() {
  const { attemptId } = useParams();
  const resultQuery = useAttemptResult(attemptId);

  const result = resultQuery.data;

  if (resultQuery.isLoading) {
    return <ResultLoading />;
  }

  if (resultQuery.isError || !result) {
    return (
      <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] qm-exam-focus-bg px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="qm-page-shell">
          <EmptyState
            icon={<AlertCircle className="size-6" />}
            title="Không thể tải bài làm"
            description="Attempt có thể không tồn tại, chưa được nộp hoặc bạn không có quyền xem bài làm này."
            action={
              <Button asChild className="rounded-2xl">
                <Link to={ROUTES.USER.QUIZZES}>
                  <ArrowLeft className="size-4" />
                  Quay lại danh sách quiz
                </Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const showAnswer = result.quiz.showAnswer;

  return (
    <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] qm-exam-focus-bg px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="qm-page-shell-wide space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            asChild
            variant="ghost"
            className="w-fit rounded-xl px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
          >
            <Link to={ROUTES.USER.QUIZZES}>
              <ArrowLeft className="size-4" />
              Quay lại danh sách quiz
            </Link>
          </Button>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              asChild
              variant="outline"
              className="rounded-2xl bg-background/75"
            >
              <Link to={ROUTES.USER.HISTORY}>
                <History className="size-4" />
                Lịch sử làm bài
              </Link>
            </Button>

            <Button asChild className="rounded-2xl shadow-sm">
              <Link to={ROUTES.USER.QUIZZES}>
                <Home className="size-4" />
                Về danh sách quiz
              </Link>
            </Button>
          </div>
        </div>

        <ResultSummaryCard result={result} />

        <section className="space-y-4">
          <div className="qm-soft-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="qm-section-eyebrow">
                  {showAnswer ? (
                    <ListChecks className="size-3.5" />
                  ) : (
                    <FileCheck2 className="size-3.5" />
                  )}
                  Review bài làm
                </p>

                <h2 className="qm-section-title mt-4 text-2xl font-bold tracking-tight">
                  {showAnswer ? "Chi tiết câu trả lời" : "Câu trả lời đã nộp"}
                </h2>

                <p className="qm-section-description mt-2 max-w-2xl text-sm leading-6">
                  {showAnswer
                    ? "Xem lại đáp án đã chọn và đáp án đúng của từng câu hỏi."
                    : "Xem lại các lựa chọn bạn đã nộp. Đáp án đúng không được hiển thị cho quiz này."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:w-fit">
                <div className="rounded-2xl border bg-background/75 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Số câu</p>
                  <p className="mt-0.5 text-sm font-semibold">
                    {result.totalQuestions}
                  </p>
                </div>

                <div className="rounded-2xl border bg-background/75 px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Hiển thị đáp án
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">
                    {showAnswer ? "Có" : "Không"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {result.questions.map((question, index) => (
              <ResultQuestionReview
                key={question.id}
                question={question}
                questionNumber={index + 1}
                showAnswer={showAnswer}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
