import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PasswordField } from "@/components/forms/password-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { authApi } from "@/features/auth/auth.api";
import { useRegister } from "@/features/auth/auth.hooks";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/auth.schema";
import { AuthCard } from "@/features/auth/components/auth-card";
import { getApiErrorMessage } from "@/lib/axios";
import { getAuthenticatedRedirectPath } from "@/lib/auth-redirect";
import { useAuthStore } from "@/stores/auth.store";

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
  const setUser = useAuthStore((state) => state.setUser);

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
      await registerMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });

      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);

      toast.success("Tạo tài khoản thành công");

      navigate(getAuthenticatedRedirectPath(currentUser.role), {
        replace: true,
      });
    } catch (error) {
      toast.error(getRegisterErrorMessage(error));
    }
  }

  const isSubmitting = registerMutation.isPending;

  return (
    <AuthCard
      eyebrow="Get started"
      title="Tạo tài khoản"
      description="Đăng ký tài khoản Quizmaster để bắt đầu làm quiz và theo dõi kết quả học tập của bạn."
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Đăng nhập
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang tạo tài khoản...
            </>
          ) : (
            "Tạo tài khoản"
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
