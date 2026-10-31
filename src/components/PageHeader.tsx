import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  backTo,
  backLabel = "Volver",
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {backTo ? (
          <Link
            to={backTo}
            className="mb-1 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
          >
            <ArrowLeft className="size-4" />
            {backLabel}
          </Link>
        ) : null}
        <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sm font-semibold text-muted md:text-base">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
