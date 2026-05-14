import { AlertCircle, Clock3, KeyRound, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuizPassword } from "@/features/quizzes/quizzes.hooks";
import type { Quiz } from "@/types/quiz";

type AdminQuizPasswordPanelProps = {
  quiz: Quiz | null;
  onClose: () => void;
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminQuizPasswordPanel({
  quiz,
  onClose,
}: AdminQuizPasswordPanelProps) {
  const passwordQuery = useQuizPassword(quiz?.id);

  if (!quiz) return null;

  return (
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary" />
            Password quiz
          </CardTitle>

          <CardDescription>
            Xem password tạm của quiz:{" "}
            <span className="font-medium text-foreground">{quiz.title}</span>
          </CardDescription>
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          <X className="size-4" />
          Đóng
        </Button>
      </CardHeader>

      <CardContent>
        {passwordQuery.isLoading ? (
          <div className="flex items-center gap-2 rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Đang tải password...
          </div>
        ) : passwordQuery.isError ? (
          <div className="flex items-start gap-3 rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
            <AlertCircle className="mt-0.5 size-4 text-destructive" />
            Không thể tải password của quiz. Vui lòng thử lại.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Password</p>

              {passwordQuery.data?.password ? (
                <p className="mt-2 break-all rounded-xl bg-background px-3 py-2 font-mono text-sm font-semibold">
                  {passwordQuery.data.password}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Password tạm không còn khả dụng hoặc đã bị xóa sau thời gian
                  lưu trữ.
                </p>
              )}
            </div>

            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="size-3.5" />
                Expires at
              </p>

              <p className="mt-2 text-sm font-medium">
                {formatDateTime(passwordQuery.data?.passwordPlainExpiresAt)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
