import * as React from "react";
import type { ColorStock, Promo } from "@/api/resources";
import { LUDO_COLORS, COLOR_TOKENS, type LudoColor } from "@/lib/colors";
import { formatMoney, multiplyCents } from "@/lib/money";
import { cn } from "@/lib/utils";
import { t } from "@/i18n/es";
import { ColorChip } from "@/components/game/ColorChip";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

function remainingFor(stock: ColorStock | undefined): number {
  if (!stock) return 0;
  if (typeof stock.remaining === "number") return Math.max(0, stock.remaining);
  return Math.max(0, stock.capacity - stock.sold);
}

function activePromoFor(
  promos: Promo[],
  color: LudoColor,
): Promo | undefined {
  return promos.find((p) => p.color === color && p.active);
}

function promoLabel(promo: Promo): string {
  const left = Math.max(0, promo.slots - promo.sold);
  return `Promo ×${promo.multiplier} (${left} cupos)`;
}

export type ColorBoardProps = {
  inventory: ColorStock[];
  promos: Promo[];
  priceCents: number;
  purchasesOpen: boolean;
  disabled?: boolean;
  loadingColor?: LudoColor | null;
  onBuy: (color: LudoColor, quantity: number) => void;
  className?: string;
};

export function ColorBoard({
  inventory,
  promos,
  priceCents,
  purchasesOpen,
  disabled = false,
  loadingColor = null,
  onBuy,
  className,
}: ColorBoardProps) {
  const stockByColor = React.useMemo(() => {
    const map = new Map<LudoColor, ColorStock>();
    for (const item of inventory) {
      map.set(item.color, item);
    }
    return map;
  }, [inventory]);

  const [qtyByColor, setQtyByColor] = React.useState<
    Partial<Record<LudoColor, string>>
  >({});

  const getQty = (color: LudoColor, max: number): number => {
    const raw = qtyByColor[color] ?? "1";
    const n = Math.trunc(Number(raw));
    if (!Number.isFinite(n) || n < 1) return 1;
    return max > 0 ? Math.min(n, max) : 1;
  };

  const boardDisabled = disabled || !purchasesOpen;

  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      aria-disabled={boardDisabled}
    >
      {LUDO_COLORS.map((color) => {
        const stock = stockByColor.get(color);
        const remaining = remainingFor(stock);
        const promo = activePromoFor(promos, color);
        const qty = getQty(color, remaining);
        const totalCents = multiplyCents(priceCents, qty);
        const noStock = remaining <= 0;
        const isLoading = loadingColor === color;
        const canBuy =
          !boardDisabled && !noStock && !isLoading && remaining >= qty;

        const qtyOptions = Array.from(
          { length: Math.min(remaining, 10) || 1 },
          (_, i) => i + 1,
        );

        return (
          <Card
            key={color}
            className={cn(
              COLOR_TOKENS[color].border,
              COLOR_TOKENS[color].bg,
              noStock && "opacity-60",
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between gap-2">
                <ColorChip color={color} size="lg" />
                <span className="text-sm font-normal text-muted">
                  {noStock ? t("purchase.noStock") : `${remaining} disp.`}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {promo && (
                <Badge variant="secondary" className="w-full justify-center">
                  {promoLabel(promo)}
                </Badge>
              )}
              <p className="text-sm text-muted">
                {t("purchase.summary", {
                  qty,
                  unit: formatMoney(priceCents),
                  total: formatMoney(totalCents),
                })}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  Cantidad
                </span>
                <Select
                  value={String(qty)}
                  onValueChange={(v) =>
                    setQtyByColor((prev) => ({ ...prev, [color]: v }))
                  }
                  disabled={boardDisabled || noStock}
                >
                  <SelectTrigger className="w-24" aria-label={`Cantidad ${COLOR_TOKENS[color].label}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qtyOptions.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="button"
                className="w-full"
                disabled={!canBuy}
                onClick={() => onBuy(color, qty)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden />
                    {t("common.loading")}
                  </>
                ) : (
                  t("purchase.buy")
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
