import { AlertCircle, ArrowLeft, History, Home } from "lucide-react";
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
    <div className="space-y-6">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="mt-5 h-10 w-72" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>

      <Skeleton className="h-64 rounded-3xl" />
      <Skeleton className="h-64 rounded-3xl" />
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
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="Không thể tải bài làm"
        description="Attempt có thể không tồn tại, chưa được nộp hoặc bạn không có quyền xem bài làm này."
        action={
          <Button asChild>
            <Link to={ROUTES.USER.QUIZZES}>
              <ArrowLeft className="size-4" />
              Quay lại danh sách quiz
            </Link>
          </Button>
        }
      />
    );
  }

  const showAnswer = result.quiz.showAnswer;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="ghost" className="w-fit">
          <Link to={ROUTES.USER.QUIZZES}>
            <ArrowLeft className="size-4" />
            Quay lại quiz
          </Link>
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline">
            <Link to={ROUTES.USER.HISTORY}>
              <History className="size-4" />
              Lịch sử làm bài
            </Link>
          </Button>

          <Button asChild>
            <Link to={ROUTES.USER.QUIZZES}>
              <Home className="size-4" />
              Về danh sách quiz
            </Link>
          </Button>
        </div>
      </div>

      <ResultSummaryCard result={result} />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {showAnswer ? "Chi tiết câu trả lời" : "Câu trả lời đã nộp"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {showAnswer
              ? "Xem lại đáp án đã chọn và đáp án đúng của từng câu hỏi."
              : "Xem lại các lựa chọn bạn đã nộp. Đáp án đúng không được hiển thị cho quiz này."}
          </p>
        </div>

        {result.questions.map((question, index) => (
          <ResultQuestionReview
            key={question.id}
            question={question}
            questionNumber={index + 1}
            showAnswer={showAnswer}
          />
        ))}
      </section>
    </div>
  );
}
