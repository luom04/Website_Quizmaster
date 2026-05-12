import { Bell, Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/shared/logo";

export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="size-4" />
          </Button>

          <div className="lg:hidden">
            <Logo showText={false} />
          </div>

          <div className="hidden items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2 text-sm text-muted-foreground md:flex">
            <Search className="size-4" />
            Search admin pages...
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="size-4" />
          </Button>

          <Button variant="outline" size="sm">
            Admin
          </Button>
        </div>
      </div>
    </header>
  );
}
