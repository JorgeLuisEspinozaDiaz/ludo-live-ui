import type { ColorStock, Promo } from "@/api/resources";
import { LUDO_COLORS, COLOR_TOKENS, type LudoColor } from "@/lib/colors";
import { cn } from "@/lib/utils";

function remainingFor(stock: ColorStock | undefined): number {
  if (!stock) return 0;
  if (typeof stock.remaining === "number") return Math.max(0, stock.remaining);
  return Math.max(0, stock.capacity - stock.sold);
}

export type PlayerColorPickerProps = {
  inventory: ColorStock[];
  promos: Promo[];
  purchasesOpen: boolean;
  disabled?: boolean;
  loadingColor?: LudoColor | null;
  onSelect: (color: LudoColor) => void;
  className?: string;
};

/** Botones de color con cupos restantes y promos bien visibles. */
export function PlayerColorPicker({
  inventory,
  promos,
  purchasesOpen,
  disabled = false,
  loadingColor = null,
  onSelect,
  className,
}: PlayerColorPickerProps) {
  const stockByColor = new Map(inventory.map((i) => [i.color, i]));
  const locked = disabled || !purchasesOpen;
  const activePromos = promos.filter((p) => p.active);

  return (
    <div className={cn("space-y-3", className)}>
      {activePromos.length > 0 ? (
        <div className="space-y-2">
          {activePromos.map((promo) => {
            const left = Math.max(0, promo.slots - promo.sold);
            return (
              <div
                key={promo.id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5",
                  COLOR_TOKENS[promo.color].border,
                  COLOR_TOKENS[promo.color].bg,
                )}
              >
                <span
                  className={cn(
                    "size-9 shrink-0 rounded-full ring-2 ring-white/70",
                    COLOR_TOKENS[promo.color].swatch,
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-black",
                      COLOR_TOKENS[promo.color].text,
                    )}
                  >
                    PROMO {COLOR_TOKENS[promo.color].label} ×{promo.multiplier}
                  </p>
                  <p className="text-[11px] font-bold text-muted">
                    Quedan {left} de {promo.slots} cupos promo
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-sm font-black text-white shadow",
                    COLOR_TOKENS[promo.color].swatch,
                  )}
                >
                  ×{promo.multiplier}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {LUDO_COLORS.map((color) => {
          const stock = stockByColor.get(color);
          const remaining = remainingFor(stock);
          const capacity = stock?.capacity ?? 0;
          const promo = promos.find((p) => p.color === color && p.active);
          const noStock = remaining <= 0;
          const loading = loadingColor === color;
          const canPick = !locked && !noStock && !loading;

          return (
            <button
              key={color}
              type="button"
              disabled={!canPick}
              onClick={() => onSelect(color)}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-2.5 transition",
                COLOR_TOKENS[color].border,
                COLOR_TOKENS[color].bg,
                canPick
                  ? "hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
                  : "cursor-not-allowed opacity-45",
              )}
            >
              {promo ? (
                <span
                  className={cn(
                    "absolute -right-1 -top-1 rounded-full px-2 py-0.5 text-[11px] font-black text-white shadow-md ring-2 ring-white",
                    COLOR_TOKENS[color].swatch,
                  )}
                >
                  ×{promo.multiplier}
                </span>
              ) : null}

              <span
                className={cn(
                  "size-9 rounded-full shadow-inner ring-2 ring-white/80",
                  COLOR_TOKENS[color].swatch,
                )}
              />
              <span
                className={cn("text-xs font-black", COLOR_TOKENS[color].text)}
              >
                {COLOR_TOKENS[color].label}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums",
                  noStock
                    ? "bg-rose-500/15 text-rose-700"
                    : "bg-black/10 text-foreground",
                )}
              >
                {noStock
                  ? "Agotado"
                  : capacity > 0
                    ? `${remaining}/${capacity}`
                    : `quedan ${remaining}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
