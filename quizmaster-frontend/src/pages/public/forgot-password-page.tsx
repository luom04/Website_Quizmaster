import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { useForgotPassword } from "@/features/auth/auth.hooks";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/auth.schema";
import { AuthCard } from "@/features/auth/components/auth-card";
import { getApiErrorMessage } from "@/lib/axios";

export function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      await forgotPasswordMutation.mutateAsync(values);

      toast.success(
        "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.",
      );

      reset();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.",
        ),
      );
    }
  }

  const isSubmitting = forgotPasswordMutation.isPending;

  return (
    <AuthCard
      eyebrow="Password recovery"
      title="Quên mật khẩu"
      description="Nhập email đã đăng ký. Nếu tài khoản hợp lệ, hệ thống sẽ gửi liên kết đặt lại mật khẩu cho bạn."
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
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang gửi...
            </>
          ) : (
            "Gửi liên kết đặt lại mật khẩu"
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
