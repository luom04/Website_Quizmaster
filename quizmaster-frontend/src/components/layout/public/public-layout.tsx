import { Outlet } from "react-router-dom";

import { Logo } from "@/components/layout/shared/logo";

export function PublicLayout() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden border-r bg-muted/30 px-10 py-8 lg:flex lg:flex-col">
          <Logo />

          <div className="mt-auto max-w-xl pb-10">
            <p className="text-sm font-medium text-muted-foreground">
              Quizmaster Platform
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              Tạo quiz, làm bài và theo dõi kết quả trong một hệ thống gọn gàng.
            </h1>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Giao diện được chia rõ cho người dùng và quản trị viên, phù hợp để
              mở rộng thành một hệ thống quiz hoàn chỉnh.
            </p>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>

            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
}
