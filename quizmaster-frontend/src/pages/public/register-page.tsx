import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  KeyRound,
  Loader2,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PasswordField } from "@/components/forms/password-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";

import { ROUTES } from "@/config/routes";

import { useRegister } from "@/features/auth/auth.hooks";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/auth.schema";
import { AuthCard } from "@/features/auth/components/auth-card";

import { getApiErrorMessage } from "@/lib/axios";

function getRegisterErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.status === 409) {
    return "Email này đã được sử dụng.";
  }

  return getApiErrorMessage(
    error,
    "Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin.",
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      const data = await registerMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });

      setRecoveryCode(data.recoveryCode);
      toast.success("Tạo tài khoản thành công. Hãy lưu mã khôi phục.");
    } catch (error) {
      toast.error(getRegisterErrorMessage(error));
    }
  }

  async function handleCopyRecoveryCode() {
    if (!recoveryCode) return;

    try {
      await navigator.clipboard.writeText(recoveryCode);
      setHasCopied(true);
      toast.success("Đã copy mã khôi phục.");
    } catch {
      toast.error("Không thể copy mã. Vui lòng sao chép thủ công.");
    }
  }

  function handleConfirmSaved() {
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  }

  const isSubmitting = registerMutation.isPending;

  return (
    <>
      <AuthCard
        eyebrow="Create account"
        title="Tạo tài khoản"
        description="Tạo tài khoản Quizmaster để bắt đầu làm quiz, lưu lịch sử bài làm và xem lại kết quả sau khi nộp."
        footer={
          <>
            Đã có tài khoản?{" "}
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

            <PasswordField
              id="password"
              label="Mật khẩu"
              placeholder="Tạo mật khẩu"
              autoComplete="new-password"
              disabled={isSubmitting}
              error={errors.password?.message}
              {...register("password")}
            />

            <PasswordField
              id="confirmPassword"
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              disabled={isSubmitting}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>

          <div className="rounded-2xl border bg-muted/25 p-4 text-xs leading-5 text-muted-foreground">
            Sau khi tạo tài khoản, hệ thống sẽ hiển thị một mã khôi phục. Bạn
            cần lưu mã này để có thể đặt lại mật khẩu trong tương lai.
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
                Đang tạo tài khoản...
              </>
            ) : (
              <>
                <UserPlus className="size-4" />
                Tạo tài khoản
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </AuthCard>

      {recoveryCode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="qm-soft-card w-full max-w-xl overflow-hidden bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b bg-muted/25 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <CheckCircle2 className="size-6" />
                </div>

                <div>
                  <p className="qm-section-eyebrow">
                    <KeyRound className="size-3.5" />
                    Account recovery
                  </p>

                  <h2 className="qm-section-title mt-4 text-2xl font-bold tracking-tight">
                    Lưu mã khôi phục
                  </h2>

                  <p className="qm-section-description mt-2 text-sm leading-6">
                    Mã này chỉ hiển thị một lần. Hãy copy hoặc lưu lại trước khi
                    tiếp tục.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              <div className="rounded-2xl border bg-muted/25 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Recovery code
                  </p>

                  <ShieldCheck className="size-4 text-primary" />
                </div>

                <div className="rounded-xl border bg-background px-4 py-3">
                  <p className="break-all font-mono text-sm font-semibold leading-6 text-foreground">
                    {recoveryCode}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-300">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                  <p>
                    Hệ thống chỉ lưu bản mã hóa của mã này trong database. Nếu
                    bạn làm mất mã, bạn sẽ không thể dùng recovery code cũ để
                    khôi phục mật khẩu.
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
                  onClick={handleConfirmSaved}
                >
                  Tôi đã lưu mã
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
