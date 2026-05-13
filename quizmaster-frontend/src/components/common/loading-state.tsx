import { Skeleton } from "@/components/ui/skeleton";

export function QuizGridLoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-3xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-48" />
            </div>

            <Skeleton className="h-7 w-20 rounded-full" />
          </div>

          <Skeleton className="mt-5 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />

          <div className="mt-6 grid grid-cols-3 gap-2">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
          </div>

          <Skeleton className="mt-5 h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
