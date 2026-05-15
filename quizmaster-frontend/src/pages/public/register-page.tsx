import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { CheckCircle2, Copy, Loader2, ShieldCheck } from "lucide-react";
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
        eyebrow="Start your quiz journey"
        title="Tạo tài khoản QuizMaster"
        description="Đăng ký để lưu lịch sử làm bài, theo dõi kết quả và tham gia các bài quiz phù hợp."
        footer={
          <p className="text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="font-medium text-foreground underline underline-offset-4"
            >
              Đăng nhập
            </Link>
          </p>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isSubmitting || Boolean(recoveryCode)}
            error={errors.email?.message}
            {...register("email")}
          />

          <PasswordField
            id="password"
            label="Mật khẩu"
            autoComplete="new-password"
            placeholder="Nhập mật khẩu"
            disabled={isSubmitting || Boolean(recoveryCode)}
            error={errors.password?.message}
            {...register("password")}
          />

          <PasswordField
            id="confirmPassword"
            label="Xác nhận mật khẩu"
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
            disabled={isSubmitting || Boolean(recoveryCode)}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || Boolean(recoveryCode)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo tài khoản...
              </>
            ) : (
              "Tạo tài khoản"
            )}
          </Button>
        </form>
      </AuthCard>

      {recoveryCode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl">
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-2xl bg-muted p-3">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Account recovery
                </p>
                <h2 className="text-xl font-semibold tracking-tight">
                  Lưu mã khôi phục
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Đây là mã khôi phục tài khoản của bạn. Mã này chỉ hiển thị một
                lần, hãy copy hoặc lưu lại trước khi tiếp tục.
              </p>

              <div className="rounded-2xl border border-dashed bg-muted/50 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Recovery Code
                </p>

                <div className="break-all rounded-xl bg-background px-4 py-3 text-center font-mono text-lg font-semibold tracking-wide">
                  {recoveryCode}
                </div>
              </div>

              <div className="rounded-2xl border bg-background p-4 text-sm text-muted-foreground">
                <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  Lưu ý
                </div>

                <p>
                  Hệ thống chỉ lưu bản mã hóa của mã này trong database. Nếu bạn
                  làm mất mã, bạn sẽ không thể dùng chức năng khôi phục mật khẩu
                  bằng recovery code cũ.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyRecoveryCode}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {hasCopied ? "Đã copy" : "Copy mã"}
                </Button>

                <Button type="button" onClick={handleConfirmSaved}>
                  Tôi đã lưu mã
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
