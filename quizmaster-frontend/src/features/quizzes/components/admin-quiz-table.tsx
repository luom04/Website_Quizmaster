import {
  CalendarClock,
  Clock3,
  Edit3,
  Eye,
  HelpCircle,
  LockKeyhole,
  Unlock,
  RotateCcw,
  Trash2,
  XCircle,
  ListChecks,
  KeyRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Quiz, QuizStatus } from "@/types/quiz";

type AdminQuizTableProps = {
  quizzes: Quiz[];
  isMutating?: boolean;
  onView: (quiz: Quiz) => void;
  onEdit: (quiz: Quiz) => void;
  onManageQuestions: (quiz: Quiz) => void;
  onViewPassword: (quiz: Quiz) => void;
  onDelete?: (quiz: Quiz) => void;
  onRestore?: (quiz: Quiz) => void;
  onPermanentDelete?: (quiz: Quiz) => void;
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusLabel(status?: QuizStatus) {
  const labels: Record<string, string> = {
    DRAFT: "Draft",
    UPCOMING: "Upcoming",
    ONGOING: "Ongoing",
    ENDED: "Ended",
    DELETED: "Deleted",
  };

  return status ? labels[status] || status : "—";
}

function getStatusClassName(status?: QuizStatus) {
  switch (status) {
    case "ONGOING":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "UPCOMING":
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300";
    case "ENDED":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300";
    case "DELETED":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "DRAFT":
    default:
      return "border-muted bg-muted text-muted-foreground";
  }
}

export function AdminQuizTable({
  quizzes,
  isMutating,
  onView,
  onEdit,
  onManageQuestions,
  onViewPassword,
  onDelete,
  onRestore,
  onPermanentDelete,
}: AdminQuizTableProps) {
  if (quizzes.length === 0) {
    return (
      <div className="rounded-3xl border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
        Không có quiz nào khớp với bộ lọc hiện tại.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Quiz</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Access</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Settings</th>
              <th className="px-4 py-3 font-medium">Schedule</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {quizzes.map((quiz) => {
              const isPasswordQuiz = quiz.accessMode === "password_required";
              const questionCount =
                quiz.questionCount ?? quiz._count?.quizQuestions ?? 0;
              const isDeleted = quiz.status === "DELETED";

              return (
                <tr key={quiz.id} className="bg-card">
                  <td className="px-4 py-3">
                    <p className="line-clamp-2 max-w-xl font-medium">
                      {quiz.title}
                    </p>

                    <p className="mt-1 line-clamp-1 max-w-xl text-xs text-muted-foreground">
                      {quiz.description || "Chưa có mô tả"}
                    </p>

                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      {quiz.id}
                    </p>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {quiz.category?.name || "General"}
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant={isPasswordQuiz ? "outline" : "secondary"}>
                      {isPasswordQuiz ? (
                        <LockKeyhole className="size-3.5" />
                      ) : (
                        <Unlock className="size-3.5" />
                      )}
                      {isPasswordQuiz ? "Password" : "Public"}
                    </Badge>
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={getStatusClassName(quiz.status)}
                    >
                      {getStatusLabel(quiz.status)}
                    </Badge>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <HelpCircle className="size-3.5" />
                        {questionCount} questions
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="size-3.5" />
                        {quiz.durationMinutes} minutes
                      </span>

                      <span>Max attempts: {quiz.maxAttempts}</span>

                      <span>Passing score: {quiz.passingScore}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="size-3.5" />
                        Start: {formatDateTime(quiz.startsAt)}
                      </span>

                      <span>End: {formatDateTime(quiz.endsAt)}</span>

                      <span>Published: {quiz.isPublished ? "Yes" : "No"}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isMutating}
                        onClick={() => onView(quiz)}
                      >
                        <Eye className="size-4" />
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isMutating}
                        onClick={() => onManageQuestions(quiz)}
                      >
                        <ListChecks className="size-4" />
                        Questions
                      </Button>

                      {isPasswordQuiz ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isMutating}
                          onClick={() => onViewPassword(quiz)}
                        >
                          <KeyRound className="size-4" />
                          Password
                        </Button>
                      ) : null}

                      {!isDeleted ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isMutating}
                            onClick={() => onEdit(quiz)}
                          >
                            <Edit3 className="size-4" />
                            Edit
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isMutating}
                            onClick={() => onDelete?.(quiz)}
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
                            onClick={() => onRestore?.(quiz)}
                          >
                            <RotateCcw className="size-4" />
                            Restore
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isMutating}
                            onClick={() => onPermanentDelete?.(quiz)}
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
