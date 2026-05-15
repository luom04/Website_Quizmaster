import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { AuthCard } from "@/features/auth/components/auth-card";

export function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Khôi phục mật khẩu"
      description="QuizMaster không gửi email đặt lại mật khẩu. Bạn cần dùng mã khôi phục đã được cấp khi tạo tài khoản."
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
      <div className="space-y-4">
        <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
          <p>
            Nếu bạn đã lưu recovery code, hãy chuyển sang trang đặt lại mật khẩu
            và nhập email, mã khôi phục cùng mật khẩu mới.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link to={ROUTES.AUTH.RESET_PASSWORD}>Đặt lại mật khẩu</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
