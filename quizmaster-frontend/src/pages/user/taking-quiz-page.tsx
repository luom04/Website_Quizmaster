import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  Eye,
  Home,
  Loader2,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import {
  useAttemptForTaking,
  useLogAttemptEvent,
  useSubmitAttempt,
} from "@/features/attempts/attempts.hooks";
import { AttemptProgressPanel } from "@/features/attempts/components/attempt-progress-panel";
import { TakingQuestionCard } from "@/features/attempts/components/taking-question-card";
import { useAttemptCountdown } from "@/features/attempts/use-attempt-countdown";
import { useQuizDetail } from "@/features/quizzes/quizzes.hooks";
import { getApiErrorMessage } from "@/lib/axios";
import type { SubmitAnswerItem } from "@/types/attempt";

type AnswerState = Record<string, string[]>;

function getResultPath(attemptId: string) {
  return ROUTES.USER.RESULT.replace(":attemptId", attemptId);
}

function TakingQuizLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-3xl border bg-card p-6 shadow-sm">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="mt-5 h-6 w-3/4" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-12 rounded-2xl" />
              <Skeleton className="h-12 rounded-2xl" />
              <Skeleton className="h-12 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>

      <Skeleton className="h-64 rounded-3xl" />
    </div>
  );
}

export function TakingQuizPage() {
  const { attemptId } = useParams();

  const attemptQuery = useAttemptForTaking(attemptId);
  const submitAttemptMutation = useSubmitAttempt();
  const logEventMutation = useLogAttemptEvent();

  const attempt = attemptQuery.data;
  const quizQuery = useQuizDetail(attempt?.quizId);

  const { remainingSeconds, isCountdownReady, isExpired } = useAttemptCountdown(
    attempt?.deadlineAt,
  );

  const [answers, setAnswers] = useState<AnswerState>({});
  const [submittedAttemptId, setSubmittedAttemptId] = useState<string | null>(
    null,
  );

  const hasInitializedAnswers = useRef(false);
  const hasSubmitted = useRef(false);
  const lastLoggedEventAt = useRef<Record<string, number>>({});

  const questions = attempt?.questions ?? [];
  const quiz = quizQuery.data;

  const answeredQuestions = useMemo(() => {
    return Object.values(answers).filter(
      (selectedIds) => selectedIds.length > 0,
    ).length;
  }, [answers]);

  const submitPayload = useMemo(() => {
    const payload: SubmitAnswerItem[] = questions.map((question) => ({
      attemptQuestionId: question.id,
      selectedOptionIds: answers[question.id] ?? [],
    }));
    return { answers: payload };
  }, [answers, questions]);

  function updateAnswer(
    attemptQuestionId: string,
    selectedOptionIds: string[],
  ) {
    setAnswers((current) => ({
      ...current,
      [attemptQuestionId]: selectedOptionIds,
    }));
  }

  function logAttemptEvent(
    eventType:
      | "tab_blur"
      | "tab_focus"
      | "copy_attempt"
      | "right_click"
      | "auto_submitted",
  ) {
    if (!attemptId) return;

    const now = Date.now();
    const lastLoggedAt = lastLoggedEventAt.current[eventType] ?? 0;
    if (now - lastLoggedAt < 1500) return;

    lastLoggedEventAt.current[eventType] = now;

    logEventMutation.mutate({
      attemptId,
      payload: {
        eventType,
        metadata: {
          pathname: window.location.pathname,
          loggedAt: new Date().toISOString(),
        },
      },
    });
  }

  async function submitAttempt(options?: { autoSubmitted?: boolean }) {
    if (!attemptId || hasSubmitted.current) return;

    hasSubmitted.current = true;

    try {
      const result = await submitAttemptMutation.mutateAsync({
        attemptId,
        payload: submitPayload,
      });

      if (options?.autoSubmitted) {
        logAttemptEvent("auto_submitted");
      }

      toast.success(
        options?.autoSubmitted
          ? "Hết giờ. Hệ thống đã tự động nộp bài."
          : "Nộp bài thành công.",
      );

      setSubmittedAttemptId(result.id);
    } catch (error) {
      hasSubmitted.current = false;
      toast.error(
        getApiErrorMessage(error, "Không thể nộp bài. Vui lòng thử lại."),
      );
    }
  }

  // Khởi tạo answers từ dữ liệu server (giữ lại đáp án đã chọn trước khi reload)
  useEffect(() => {
    if (!attempt || hasInitializedAnswers.current) return;

    const initialAnswers = attempt.questions.reduce<AnswerState>(
      (accumulator, question) => {
        accumulator[question.id] = question.selectedOptionIds ?? [];
        return accumulator;
      },
      {},
    );

    setAnswers(initialAnswers);
    hasInitializedAnswers.current = true;
  }, [attempt]);

  // Ghi log sự kiện tab/copy/right-click
  useEffect(() => {
    if (!attemptId) return;

    function handleVisibilityChange() {
      if (document.hidden) logAttemptEvent("tab_blur");
      else logAttemptEvent("tab_focus");
    }
    function handleCopy() {
      logAttemptEvent("copy_attempt");
    }
    function handleContextMenu(event: MouseEvent) {
      event.preventDefault();
      logAttemptEvent("right_click");
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  // Auto-submit khi countdown chạy về 0 (đang thi bình thường)
  useEffect(() => {
    if (!attempt || !isCountdownReady || !isExpired || hasSubmitted.current)
      return;

    submitAttempt({ autoSubmitted: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpired, isCountdownReady, attempt]);

  // ✅ FIX: Xử lý trường hợp reload khi đã hết giờ
  // Khi attempt vừa load xong sau reload, isExpired có thể đã true
  // nhưng effect trên không trigger vì isExpired không thay đổi
  useEffect(() => {
    if (!attempt?.deadlineAt || hasSubmitted.current) return;

    const deadlineTime = new Date(attempt.deadlineAt).getTime();
    const delay = Math.max(0, deadlineTime - Date.now());

    const timeoutId = window.setTimeout(() => {
      if (hasSubmitted.current) return;

      void submitAttempt({ autoSubmitted: true });
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.deadlineAt, attemptId]);
  if (attemptQuery.isLoading) {
    return <TakingQuizLoading />;
  }

  if (attemptQuery.isError || !attempt || !attemptId) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="Không thể tiếp tục bài làm"
        description="Attempt có thể đã được nộp, đã hết hạn hoặc không còn ở trạng thái đang làm."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            {attemptId ? (
              <Button asChild>
                <Link to={getResultPath(attemptId)}>
                  <Eye className="size-4" />
                  Xem bài đã nộp
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link to={ROUTES.USER.QUIZZES}>
                <ArrowLeft className="size-4" />
                Quay lại danh sách quiz
              </Link>
            </Button>
          </div>
        }
      />
    );
  }

  if (submittedAttemptId) {
    const canShowAnswers = quiz?.showAnswer === true;
    return (
      <EmptyState
        icon={<CheckCircle2 className="size-6" />}
        title="Bạn đã nộp bài thành công"
        description={
          canShowAnswers
            ? "Quiz này cho phép xem đáp án sau khi nộp. Bạn có thể mở trang kết quả để xem điểm và chi tiết bài làm."
            : "Quiz này không bật xem đáp án đúng, nhưng bạn vẫn có thể xem lại các lựa chọn đã nộp."
        }
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to={getResultPath(submittedAttemptId)}>
                <Eye className="size-4" />
                {canShowAnswers ? "Xem kết quả" : "Xem lại bài làm"}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={ROUTES.USER.QUIZZES}>
                <Home className="size-4" />
                Về danh sách quiz
              </Link>
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <BookOpenCheck className="size-3.5" />
              Attempt #{attempt.attemptNumber}
            </p>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Đang làm bài quiz
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Chọn đáp án cho từng câu hỏi. Với câu multiple choice, bạn có thể
              chọn nhiều đáp án trước khi nộp bài.
            </p>
          </div>

          {submitAttemptMutation.isPending ? (
            <div className="flex items-center gap-2 rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Đang xử lý...
            </div>
          ) : null}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {questions.map((question, index) => (
            <TakingQuestionCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
              selectedOptionIds={answers[question.id] ?? []}
              onChange={updateAnswer}
            />
          ))}
        </div>

        <AttemptProgressPanel
          totalQuestions={questions.length}
          answeredQuestions={answeredQuestions}
          remainingSeconds={remainingSeconds}
          isSubmitting={submitAttemptMutation.isPending}
          onSubmit={() => submitAttempt()}
        />
      </div>
    </div>
  );
}
