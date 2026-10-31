import { COLOR_HEX, COLOR_TOKENS, type LudoColor } from "@/lib/colors";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RoundResultOverlayProps = {
  open: boolean;
  onClose: () => void;
  winnerColor: LudoColor;
  iWon: boolean;
  prizeCents?: number;
  balanceCents?: number;
  wonQty?: number;
  pointsEarned?: number;
  boughtQty?: number;
  promoQty?: number;
};

export function RoundResultOverlay({
  open,
  onClose,
  winnerColor,
  iWon,
  prizeCents,
  balanceCents,
  wonQty = 0,
  pointsEarned,
  boughtQty,
  promoQty,
}: RoundResultOverlayProps) {
  if (!open) return null;

  const color = COLOR_TOKENS[winnerColor];
  const hex = COLOR_HEX[winnerColor];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="round-result-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <div
        className={cn(
          "round-result-panel relative w-full max-w-md overflow-hidden rounded-[2rem] border-4 p-1 shadow-2xl",
          iWon ? "round-result-win border-amber-300" : "round-result-lose border-slate-400",
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-[1.7rem] px-5 pb-6 pt-8 text-center",
            iWon
              ? "bg-gradient-to-b from-[#8b0000] via-[#c62828] to-[#4a0000]"
              : "bg-gradient-to-b from-[#1a2332] via-[#243447] to-[#0d121a]",
          )}
        >
          {/* Rayos / atmósfera */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 opacity-40",
              iWon ? "round-result-rays" : "round-result-haze",
            )}
          />

          {/* Monedas / chispas decorativas */}
          {iWon ? (
            <>
              <span className="round-coin absolute left-[8%] top-[18%] text-2xl">🪙</span>
              <span className="round-coin round-coin-delay absolute right-[10%] top-[22%] text-xl">
                🪙
              </span>
              <span className="round-coin round-coin-delay-2 absolute left-[18%] bottom-[28%] text-lg">
                ✨
              </span>
              <span className="round-coin absolute right-[16%] bottom-[30%] text-2xl">✨</span>
            </>
          ) : (
            <>
              <span className="absolute left-[12%] top-[20%] text-xl opacity-40">💨</span>
              <span className="absolute right-[14%] top-[24%] text-xl opacity-40">🃏</span>
            </>
          )}

          <p
            className={cn(
              "relative text-[11px] font-black uppercase tracking-[0.35em]",
              iWon ? "text-amber-200" : "text-slate-300",
            )}
          >
            Ronda finalizada
          </p>

          <h2
            id="round-result-title"
            className={cn(
              "round-result-title relative mt-3 text-5xl font-black leading-none tracking-tight sm:text-6xl",
              iWon ? "text-amber-300" : "text-slate-200",
            )}
          >
            {iWon ? "¡GANASTE!" : "PERDISTE"}
          </h2>

          <div className="relative mx-auto mt-5 flex w-fit flex-col items-center gap-2 rounded-3xl border-2 border-white/25 bg-black/35 px-6 py-4 backdrop-blur-sm">
            <span
              className={cn(
                "size-14 rounded-full shadow-lg ring-4 ring-white/40",
                color.swatch,
              )}
              style={{ backgroundColor: hex.bg }}
            />
            <p className="text-lg font-black text-white">
              Ganó {color.label}
            </p>
            {iWon && wonQty > 0 ? (
              <p className="text-sm font-bold text-amber-200">
                Tenías {wonQty} {wonQty === 1 ? "casilla" : "casillas"} de ese color
              </p>
            ) : !iWon ? (
              <p className="text-sm font-bold text-slate-300">
                Suerte para la próxima
              </p>
            ) : null}
          </div>

          <div className="relative mt-5 space-y-1.5">
            {iWon && prizeCents != null && prizeCents > 0 && (
              <p className="text-base font-black text-amber-100">
                Tu premio: {formatMoney(prizeCents)}
              </p>
            )}
            {pointsEarned != null && pointsEarned > 0 && (
              <div className="space-y-0.5">
                <p className="text-sm font-black text-amber-200">
                  +{pointsEarned} puntos
                </p>
                {boughtQty != null && boughtQty > 0 && (
                  <p className="text-xs font-semibold text-white/65">
                    {boughtQty} {boughtQty === 1 ? "casilla comprada" : "casillas compradas"}{" "}
                    en total
                    {promoQty && pointsEarned > boughtQty
                      ? ` · ${promoQty} con promo (+${pointsEarned - boughtQty} extra)`
                      : ""}
                  </p>
                )}
              </div>
            )}
            {balanceCents != null && (
              <p className="text-sm font-bold text-white/80">
                Tu mochila: {formatMoney(balanceCents)}
              </p>
            )}
          </div>

          <Button
            type="button"
            size="lg"
            className={cn(
              "relative mt-6 h-12 w-full max-w-[220px] rounded-full text-base font-black shadow-lg",
              iWon
                ? "bg-amber-400 text-[#1a120b] hover:bg-amber-300"
                : "bg-slate-200 text-slate-900 hover:bg-white",
            )}
            onClick={onClose}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
