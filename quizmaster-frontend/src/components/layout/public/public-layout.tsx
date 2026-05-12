import {
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Outlet } from "react-router-dom";

import { Logo } from "@/components/layout/shared/logo";

const featureCards = [
  {
    icon: BookOpenCheck,
    title: "Create focused quizzes",
    description: "Tổ chức câu hỏi, danh mục và bài quiz rõ ràng.",
  },
  {
    icon: ShieldCheck,
    title: "Track attempts",
    description: "Theo dõi lượt làm và các hành vi đáng chú ý.",
  },
  {
    icon: BarChart3,
    title: "Review insights",
    description: "Xem kết quả, tiến độ và thống kê hệ thống.",
  },
];

const previewSteps = ["Choose quiz", "Answer questions", "Review result"];

export function PublicLayout() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="grid min-h-dvh lg:grid-cols-[1fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r bg-muted/20 px-10 py-8 lg:flex lg:flex-col">
          <div className="pointer-events-none absolute -left-24 top-20 size-72 rounded-full bg-primary/10 blur-3xl auth-soft-pulse" />
          <div className="pointer-events-none absolute -right-24 bottom-20 size-80 rounded-full bg-muted-foreground/10 blur-3xl auth-soft-pulse" />

          <div className="relative z-10">
            <Logo />
          </div>

          <div className="relative z-10 my-auto max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="size-3.5 text-primary" />
              Quizmaster workspace
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight xl:text-5xl">
              Một không gian gọn gàng để tạo quiz, làm bài và theo dõi kết quả.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
              Quizmaster được thiết kế cho cả người học và quản trị viên: dễ bắt
              đầu, dễ quản lý và đủ rõ ràng để theo dõi quá trình làm bài.
            </p>

            <div className="mt-8 grid gap-3 xl:grid-cols-3">
              {featureCards.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border bg-background/70 p-4 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-background"
                  >
                    <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>

                    <p className="mt-3 text-sm font-medium">{item.title}</p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="auth-float mt-10 max-w-lg rounded-[2rem] border bg-background/75 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Learning flow</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    A simple path from quiz discovery to result review.
                  </p>
                </div>

                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Layers3 className="size-5" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {previewSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-2xl border bg-muted/30 p-3"
                  >
                    <div className="flex size-7 items-center justify-center rounded-full bg-background text-xs font-medium">
                      {index + 1}
                    </div>

                    <p className="text-sm">{step}</p>

                    <CheckCircle2 className="ml-auto size-4 text-primary" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 pb-2 text-xs text-muted-foreground">
            Built for clean quiz management and focused learning.
          </div>
        </section>

        <section className="flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-[430px]">
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
