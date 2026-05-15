import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
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
        eyebrow="Password updated"
        title="Đặt lại mật khẩu thành công"
        description="Mã khôi phục cũ đã hết hiệu lực. Hãy lưu mã mới bên dưới để dùng khi cần khôi phục tài khoản."
        footer={
          <p className="text-sm text-muted-foreground">
            Đã lưu mã?{" "}
            <button
              type="button"
              onClick={handleGoToLogin}
              className="font-medium text-foreground underline underline-offset-4"
            >
              Quay lại đăng nhập
            </button>
          </p>
        }
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-dashed bg-muted/50 p-4">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Recovery Code mới
            </p>

            <div className="break-all rounded-xl bg-background px-4 py-3 font-mono text-lg font-semibold tracking-wide">
              {newRecoveryCode}
            </div>
          </div>

          <div className="rounded-2xl border bg-background p-4 text-sm text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Lưu ý quan trọng
            </div>

            <p>
              Mã này chỉ hiển thị sau khi đặt lại mật khẩu. Nếu bạn tiếp tục mà
              chưa lưu, bạn sẽ không thể xem lại mã này trong hệ thống.
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

            <Button type="button" onClick={handleGoToLogin}>
              Tôi đã lưu mã
            </Button>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Đặt lại mật khẩu"
      description="Nhập email, mã khôi phục đã được cấp khi đăng ký và mật khẩu mới của bạn."
      footer={
        <p className="text-sm text-muted-foreground">
          Đã nhớ mật khẩu?{" "}
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
          disabled={isSubmitting}
          error={errors.email?.message}
          {...register("email")}
        />

        <TextField
          id="recoveryCode"
          label="Mã khôi phục"
          type="text"
          autoComplete="off"
          placeholder="QM-ABCD-1234-EF56"
          disabled={isSubmitting}
          error={errors.recoveryCode?.message}
          {...register("recoveryCode")}
        />

        <PasswordField
          id="newPassword"
          label="Mật khẩu mới"
          autoComplete="new-password"
          placeholder="Nhập mật khẩu mới"
          disabled={isSubmitting}
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <PasswordField
          id="confirmPassword"
          label="Xác nhận mật khẩu mới"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu mới"
          disabled={isSubmitting}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang đặt lại...
            </>
          ) : (
            "Đặt lại mật khẩu"
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
