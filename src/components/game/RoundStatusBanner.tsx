import type { Round } from "@/api/resources";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { t } from "@/i18n/es";
import { COLOR_TOKENS } from "@/lib/colors";

export type RoundStatus = Round["status"];

const STATUS_CONFIG: Record<
  RoundStatus,
  {
    labelKey: string;
    variant: "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
  }
> = {
  CREATED: { labelKey: "round.created", variant: "secondary" },
  PURCHASES_OPEN: { labelKey: "round.purchasesOpen", variant: "success" },
  PURCHASES_CLOSED: { labelKey: "round.purchasesClosed", variant: "warning" },
  FINISHED: { labelKey: "round.finished", variant: "default" },
  CANCELLED: { labelKey: "common.cancel", variant: "destructive" },
};

export type RoundStatusBannerProps = {
  status: RoundStatus;
  winnerColor?: Round["winnerColor"];
  className?: string;
};

export function RoundStatusBanner({
  status,
  winnerColor,
  className,
}: RoundStatusBannerProps) {
  const cfg = STATUS_CONFIG[status];
  const label = t(cfg.labelKey);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted-bg px-4 py-3",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Badge variant={cfg.variant}>{label}</Badge>
      {status === "FINISHED" && winnerColor && (
        <span className="text-sm font-bold text-foreground">
          {t("round.winner", {
            color: COLOR_TOKENS[winnerColor].label,
          })}
        </span>
      )}
    </div>
  );
}
