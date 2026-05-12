import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function PlaceholderPage({
  eyebrow,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <section className="rounded-2xl border bg-card p-8 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>

      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link to={ROUTES.USER.QUIZZES}>User Home</Link>
        </Button>

        <Button asChild variant="outline">
          <Link to={ROUTES.ADMIN.DASHBOARD}>Admin Dashboard</Link>
        </Button>

        <Button asChild variant="ghost">
          <Link to={ROUTES.AUTH.LOGIN}>Login</Link>
        </Button>
      </div>
    </section>
  );
}
