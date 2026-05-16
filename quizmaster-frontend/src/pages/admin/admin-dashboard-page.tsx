import {
  AlertCircle,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  FileQuestion,
  RefreshCcw,
  ShieldAlert,
  Trophy,
  Users,
} from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminDashboard,
  useAdminRecentAttempts,
  useAdminTopQuizzes,
} from "@/features/admin/admin.hooks";
import { AdminDashboardSection } from "@/features/admin/components/admin-dashboard-section";
import { AdminStatCard } from "@/features/admin/components/admin-stat-card";
import { RecentAttemptsTable } from "@/features/admin/components/recent-attempts-table";
import { TopQuizzesTable } from "@/features/admin/components/top-quizzes-table";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";

function formatPercent(value?: number | null) {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value)}%`;
}

function formatScore(value?: number | null) {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(1);
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-3xl" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-3xl" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>

      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );
}

type SummaryItem = {
  label: string;
  value: number;
};

function SummaryList({ items }: { items: SummaryItem[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;

        return (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground">
                {item.value} · {percent}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AdminDashboardPage() {
  const dashboardQuery = useAdminDashboard();
  const topQuizzesQuery = useAdminTopQuizzes({
    limit: 5,
  });
  const recentAttemptsQuery = useAdminRecentAttempts({
    page: 1,
    limit: 5,
  });

  const dashboard = dashboardQuery.data;
  const overview = dashboard?.overview;

  const isLoading =
    dashboardQuery.isLoading ||
    topQuizzesQuery.isLoading ||
    recentAttemptsQuery.isLoading;

  const isError =
    dashboardQuery.isError ||
    topQuizzesQuery.isError ||
    recentAttemptsQuery.isError;

  function handleRefetch() {
    dashboardQuery.refetch();
    topQuizzesQuery.refetch();
    recentAttemptsQuery.refetch();
  }

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (isError || !dashboard || !overview) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="Không thể tải dashboard"
        description="Có lỗi xảy ra khi lấy dữ liệu quản trị. Vui lòng thử lại sau."
        action={
          <Button onClick={handleRefetch}>
            <RefreshCcw className="size-4" />
            Tải lại
          </Button>
        }
      />
    );
  }

  const attemptStatusItems = [
    {
      label: "Submitted",
      value: dashboard.attemptStatus.submitted ?? 0,
    },
    {
      label: "In progress",
      value: dashboard.attemptStatus.inProgress ?? 0,
    },
    {
      label: "Timed out",
      value: dashboard.attemptStatus.timedOut ?? 0,
    },
  ];

  const passFailItems = [
    {
      label: "Passed",
      value: dashboard.passFail.passed ?? 0,
    },
    {
      label: "Failed",
      value: dashboard.passFail.failed ?? 0,
    },
  ];

  const eventItems = [
    {
      label: "Tab blur",
      value: dashboard.eventSummary.tab_blur ?? 0,
    },
    {
      label: "Tab focus",
      value: dashboard.eventSummary.tab_focus ?? 0,
    },
    {
      label: "Copy attempt",
      value: dashboard.eventSummary.copy_attempt ?? 0,
    },
    {
      label: "Right click",
      value: dashboard.eventSummary.right_click ?? 0,
    },
    {
      label: "Auto submitted",
      value: dashboard.eventSummary.auto_submitted ?? 0,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
        <AdminPageHeader
          eyebrow="Admin dashboard"
          title="Tổng quan hệ thống"
          description="Theo dõi nhanh người dùng, quiz, câu hỏi, lượt làm bài và các dấu hiệu bất thường trong Quizmaster."
          icon={BarChart3}
          tone="blue"
          actions={
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={handleRefetch}
            >
              <RefreshCcw className="mr-2 size-4" />
              Làm mới dữ liệu
            </Button>
          }
        />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Total users"
          value={overview.totalUsers}
          description={`${overview.totalActiveUsers} active users`}
          icon={Users}
        />

        <AdminStatCard
          title="Total quizzes"
          value={overview.totalQuizzes}
          description={`${overview.totalPublishedQuizzes} published`}
          icon={BookOpenCheck}
        />

        <AdminStatCard
          title="Total questions"
          value={overview.totalQuestions}
          description="Question bank"
          icon={FileQuestion}
        />

        <AdminStatCard
          title="Total attempts"
          value={overview.totalAttempts}
          description="All quiz attempts"
          icon={CheckCircle2}
        />

        <AdminStatCard
          title="Average score"
          value={formatScore(overview.averageScore)}
          description="Across submitted attempts"
          icon={BarChart3}
        />

        <AdminStatCard
          title="Pass rate"
          value={formatPercent(overview.passRate)}
          description="Submitted attempts"
          icon={Trophy}
        />

        <AdminStatCard
          title="Suspicious events"
          value={overview.totalSuspiciousEvents}
          description="Logged anti-cheating events"
          icon={ShieldAlert}
        />

        <AdminStatCard
          title="Published quizzes"
          value={overview.totalPublishedQuizzes}
          description="Available to users"
          icon={BookOpenCheck}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminDashboardSection
          title="Attempt status"
          description="Tỷ lệ trạng thái các lượt làm bài."
        >
          <SummaryList items={attemptStatusItems} />
        </AdminDashboardSection>

        <AdminDashboardSection
          title="Pass / fail"
          description="Tổng quan kết quả các bài đã nộp."
        >
          <SummaryList items={passFailItems} />
        </AdminDashboardSection>

        <AdminDashboardSection
          title="Event summary"
          description="Tổng hợp hành vi đáng chú ý trong lúc làm bài."
        >
          <SummaryList items={eventItems} />
        </AdminDashboardSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminDashboardSection
          title="Top quizzes"
          description="Các quiz có nhiều lượt làm hoặc hiệu suất nổi bật."
        >
          <TopQuizzesTable items={topQuizzesQuery.data ?? []} />
        </AdminDashboardSection>

        <AdminDashboardSection
          title="Recent attempts"
          description="Các lượt làm bài gần đây nhất trong hệ thống."
        >
          <RecentAttemptsTable items={recentAttemptsQuery.data?.items ?? []} />
        </AdminDashboardSection>
      </div>
    </div>
  );
}
