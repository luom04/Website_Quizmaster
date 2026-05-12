import { Loader2 } from "lucide-react";

export function AuthLoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="flex items-center gap-3 rounded-2xl border bg-card px-5 py-4 shadow-sm">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Đang kiểm tra phiên đăng nhập...
        </p>
      </div>
    </main>
  );
}
