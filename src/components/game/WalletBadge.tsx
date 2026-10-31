import {
  formatMoney,
  visualStatusClass,
  type WalletVisualStatus,
} from "@/lib/money";
import { cn } from "@/lib/utils";
import { t } from "@/i18n/es";

export type WalletBadgeProps = {
  balanceCents: number | string | null | undefined;
  visualStatus: WalletVisualStatus;
  className?: string;
  showLabel?: boolean;
};

export function WalletBadge({
  balanceCents,
  visualStatus,
  className,
  showLabel = true,
}: WalletBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold tabular-nums",
        visualStatusClass(visualStatus),
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {showLabel && (
        <span className="font-medium opacity-80">{t("wallet.balance")}</span>
      )}
      <span>{formatMoney(balanceCents)}</span>
    </div>
  );
}
