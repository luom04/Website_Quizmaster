import {
  AlertCircle,
  Check,
  Clock3,
  Copy,
  KeyRound,
  Loader2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  const [copied, setCopied] = useState(false);

  const passwordQuery = useQuizPassword(quiz?.id);

  if (!quiz) return null;

  const password = passwordQuery.data?.password;

  async function handleCopyPassword() {
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success("Đã copy password");

      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Không thể copy password. Vui lòng copy thủ công.");
    }
  }

  return (
    <Card className="overflow-hidden rounded-3xl shadow-sm">
      <CardHeader className="relative overflow-hidden border-b bg-amber-50/80">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-500/20" />
        <div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-amber-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                <KeyRound className="size-5" />
              </span>

              <div>
                <CardTitle>Password quiz</CardTitle>
                <CardDescription className="mt-1">
                  Xem password tạm của quiz:{" "}
                  <span className="font-medium text-foreground">
                    {quiz.title}
                  </span>
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 font-medium text-amber-600">
                Temporary password
              </span>
              <span className="inline-flex rounded-full bg-background/80 px-2.5 py-1 font-medium text-muted-foreground">
                Auto-expire
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

      <CardContent className="space-y-4 p-4 sm:p-6">
        {passwordQuery.isLoading ? (
          <div className="flex items-center gap-2 rounded-2xl border bg-muted/30 p-5 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Đang tải password...
          </div>
        ) : passwordQuery.isError ? (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">Không thể tải password của quiz.</p>
              <p className="mt-1 text-destructive/80">
                Vui lòng thử lại hoặc kiểm tra quyền admin.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-3xl border bg-muted/20 p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Chỉ admin có quyền mới xem được password tạm này.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer disabled:cursor-not-allowed"
                  disabled={!password}
                  onClick={handleCopyPassword}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 size-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 size-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              {password ? (
                <div className="rounded-2xl border bg-background px-4 py-3 font-mono text-sm font-semibold tracking-wide">
                  {password}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-background p-4 text-sm text-muted-foreground">
                  Password tạm không còn khả dụng hoặc đã bị xóa sau thời gian
                  lưu trữ.
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 rounded-3xl border bg-background p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                <Clock3 className="size-5" />
              </span>

              <div>
                <p className="text-sm font-medium">Expires at</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateTime(passwordQuery.data?.passwordPlainExpiresAt)}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
