import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  KeyRound,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PasswordField } from "@/components/forms/password-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";

import { ROUTES } from "@/config/routes";

import { useResetPassword } from "@/features/auth/auth.hooks";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/auth.schema";
import { AuthCard } from "@/features/auth/components/auth-card";

import { getApiErrorMessage } from "@/lib/axios";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPassword();

  const [newRecoveryCode, setNewRecoveryCode] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      recoveryCode: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    try {
      const data = await resetPasswordMutation.mutateAsync({
        email: values.email,
        recoveryCode: values.recoveryCode,
        newPassword: values.newPassword,
      });

      setNewRecoveryCode(data.recoveryCode);

      toast.success(
        "Đặt lại mật khẩu thành công. Hãy lưu mã khôi phục mới của bạn.",
      );

      handleGoToLogin();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể đặt lại mật khẩu. Email hoặc mã khôi phục không hợp lệ.",
        ),
      );
    }
  }

  async function handleCopyRecoveryCode() {
    if (!newRecoveryCode) return;

    try {
      await navigator.clipboard.writeText(newRecoveryCode);
      setHasCopied(true);
      toast.success("Đã copy mã khôi phục mới.");
    } catch {
      toast.error("Không thể copy mã. Vui lòng sao chép thủ công.");
    }
  }

  function handleGoToLogin() {
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  }

  const isSubmitting = resetPasswordMutation.isPending;

  if (newRecoveryCode) {
    return (
      <AuthCard
        eyebrow="Recovery code mới"
        title="Lưu mã khôi phục mới"
        description="Mã khôi phục mới chỉ hiển thị sau khi đặt lại mật khẩu. Hãy copy và lưu lại trước khi tiếp tục."
        footer={
          <>
            Đã lưu mã?{" "}
            <button
              type="button"
              className="font-semibold text-primary underline-offset-4 hover:underline"
              onClick={handleGoToLogin}
            >
              Quay lại đăng nhập
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="rounded-2xl border bg-muted/25 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                New recovery code
              </p>

              <ShieldCheck className="size-4 text-primary" />
            </div>

            <div className="rounded-xl border bg-background px-4 py-3">
              <p className="break-all font-mono text-sm font-semibold leading-6 text-foreground">
                {newRecoveryCode}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-300">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" />
              <p>
                Mã này chỉ hiển thị sau khi đặt lại mật khẩu. Nếu bạn tiếp tục
                mà chưa lưu, bạn sẽ không thể xem lại mã này trong hệ thống.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl bg-background/75 font-semibold"
              onClick={handleCopyRecoveryCode}
            >
              {hasCopied ? (
                <>
                  <CheckCircle2 className="size-4" />
                  Đã copy
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  Copy mã
                </>
              )}
            </Button>

            <Button
              type="button"
              className="h-11 rounded-2xl font-semibold shadow-sm"
              onClick={handleGoToLogin}
            >
              Tôi đã lưu mã
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Reset password"
      title="Đặt lại mật khẩu"
      description="Nhập email, recovery code và mật khẩu mới để khôi phục quyền truy cập tài khoản Quizmaster."
      footer={
        <>
          Đã nhớ mật khẩu?{" "}
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Đăng nhập
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <TextField
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isSubmitting}
            error={errors.email?.message}
            {...register("email")}
          />

          <TextField
            id="recoveryCode"
            label="Recovery code"
            placeholder="Nhập mã khôi phục"
            autoComplete="one-time-code"
            disabled={isSubmitting}
            error={errors.recoveryCode?.message}
            {...register("recoveryCode")}
          />

          <PasswordField
            id="newPassword"
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới"
            autoComplete="new-password"
            disabled={isSubmitting}
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />

          <PasswordField
            id="confirmPassword"
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới"
            autoComplete="new-password"
            disabled={isSubmitting}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>

        <div className="rounded-2xl border bg-muted/25 p-4">
          <div className="flex items-start gap-3 text-xs leading-5 text-muted-foreground">
            <KeyRound className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              Sau khi đặt lại mật khẩu, recovery code cũ sẽ không còn dùng được.
              Hãy lưu recovery code mới nếu hệ thống hiển thị sau khi thành
              công.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full cursor-pointer rounded-2xl font-semibold shadow-sm transition-all hover:-translate-y-0.5"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang đặt lại...
            </>
          ) : (
            <>
              <RotateCcw className="size-4" />
              Đặt lại mật khẩu
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
