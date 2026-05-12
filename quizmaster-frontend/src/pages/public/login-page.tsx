import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PasswordField } from "@/components/forms/password-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { authApi } from "@/features/auth/auth.api";
import { useLogin } from "@/features/auth/auth.hooks";
import { loginSchema, type LoginFormValues } from "@/features/auth/auth.schema";
import { AuthCard } from "@/features/auth/components/auth-card";
import { getApiErrorMessage } from "@/lib/axios";
import { getAuthenticatedRedirectPath } from "@/lib/auth-redirect";
import { useAuthStore } from "@/stores/auth.store";

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      await loginMutation.mutateAsync(values);

      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);

      toast.success("Đăng nhập thành công");

      navigate(getAuthenticatedRedirectPath(currentUser.role), {
        replace: true,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Email hoặc mật khẩu không đúng"));
    }
  }

  const isSubmitting = loginMutation.isPending;

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Đăng nhập"
      description="Tiếp tục vào Quizmaster để làm quiz, xem lịch sử bài làm hoặc quản lý hệ thống."
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link
            to={ROUTES.AUTH.REGISTER}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Tạo tài khoản
          </Link>
        </>
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

        <PasswordField
          id="password"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          autoComplete="current-password"
          disabled={isSubmitting}
          error={errors.password?.message}
          rightLabel={
            <Link
              to={ROUTES.AUTH.FORGOT_PASSWORD}
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          }
          {...register("password")}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
