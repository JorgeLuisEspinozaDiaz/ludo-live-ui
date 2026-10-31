import { Trophy, X } from "lucide-react";
import { COLOR_TOKENS, type LudoColor } from "@/lib/colors";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StudioWinnerBannerProps = {
  winnerColor: LudoColor;
  finishedAt: Date;
  onClose: () => void;
};

export function StudioWinnerBanner({
  winnerColor,
  finishedAt,
  onClose,
}: StudioWinnerBannerProps) {
  const color = COLOR_TOKENS[winnerColor];
  const when = finishedAt.toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-winner-title"
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border-4 border-amber-300 bg-gradient-to-b from-[#fff8e7] to-white p-6 text-center shadow-2xl">
        <button
          type="button"
          className="absolute right-3 top-3 rounded-full p-1 text-muted hover:bg-black/5"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X className="size-5" />
        </button>

        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-400 text-[#1a120b] shadow-lg">
          <Trophy className="size-7" />
        </div>

        <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-amber-800/70">
          Ronda terminada
        </p>
        <h2
          id="studio-winner-title"
          className="mt-1 text-3xl font-black text-[#1a120b]"
        >
          ¡Ganó {color.label}!
        </h2>

        <div className="mx-auto mt-4 flex w-fit items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3">
          <span
            className={cn("size-12 rounded-full shadow ring-4 ring-white", color.swatch)}
          />
          <div className="text-left">
            <p className="text-lg font-black text-foreground">{color.label}</p>
            <p className="text-xs font-bold text-muted">Color ganador</p>
          </div>
        </div>

        <p className="mt-4 text-sm font-bold text-muted">
          Hora: <span className="text-foreground">{when}</span>
        </p>

        <Button
          className="mt-5 w-full rounded-full font-black"
          onClick={onClose}
        >
          Entendido
        </Button>
      </div>
    </div>
  );
}
