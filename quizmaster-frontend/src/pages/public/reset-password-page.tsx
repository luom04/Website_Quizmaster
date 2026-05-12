import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { PasswordField } from "@/components/forms/password-field";
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
  const [searchParams] = useSearchParams();
  const resetPasswordMutation = useResetPassword();

  const token = searchParams.get("token")?.trim() || "";
  const hasToken = token.length > 0;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!hasToken) {
      toast.error("Liên kết đặt lại mật khẩu không hợp lệ.");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: values.newPassword,
      });

      toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");

      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể đặt lại mật khẩu. Liên kết có thể đã hết hạn.",
        ),
      );
    }
  }

  const isSubmitting = resetPasswordMutation.isPending;

  return (
    <AuthCard
      eyebrow="Reset password"
      title="Đặt lại mật khẩu"
      description="Tạo mật khẩu mới cho tài khoản của bạn. Sau khi hoàn tất, bạn có thể đăng nhập lại bằng mật khẩu mới."
      footer={
        <Link
          to={ROUTES.AUTH.LOGIN}
          className="inline-flex items-center justify-center gap-2 font-medium text-primary underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Quay lại đăng nhập
        </Link>
      }
    >
      {!hasToken ? (
        <div className="rounded-3xl border bg-muted/30 p-5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="size-5" />
          </div>

          <p className="mt-4 text-sm font-medium">
            Liên kết đặt lại mật khẩu không hợp lệ.
          </p>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Vui lòng mở lại liên kết từ email đặt lại mật khẩu hoặc gửi yêu cầu
            mới.
          </p>

          <Button asChild className="mt-5 w-full">
            <Link to={ROUTES.AUTH.FORGOT_PASSWORD}>
              Gửi lại yêu cầu đặt lại mật khẩu
            </Link>
          </Button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang đặt lại...
              </>
            ) : (
              "Đặt lại mật khẩu"
            )}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
