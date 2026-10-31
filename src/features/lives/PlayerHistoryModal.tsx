import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, History } from "lucide-react";
import { historyApi } from "@/api/resources";
import { COLOR_TOKENS, isLudoColor, type LudoColor } from "@/lib/colors";
import { formatMoney } from "@/lib/money";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PlayerHistoryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  liveId: string;
};

type ParticipantSnap = {
  userId: string;
  spentCents?: number;
  prizeCents?: number;
  points?: number;
  balanceBefore?: number | null;
  balanceAfter?: number | null;
  purchases?: Array<{
    color?: string;
    quantity?: number;
    multiplier?: number;
  }>;
};

type HistoryRow = {
  id: string;
  roundId?: string;
  liveId?: string;
  winnerColor?: string | null;
  finishedAt?: string;
  payload?: {
    winnerColor?: string;
    config?: { prizeCents?: number; priceCents?: number };
    participants?: ParticipantSnap[];
  };
};

export function PlayerHistoryModal({
  open,
  onOpenChange,
  liveId,
}: PlayerHistoryModalProps) {
  const [detailId, setDetailId] = useState<string | null>(null);

  const listQ = useQuery({
    queryKey: ["history", "live", liveId],
    queryFn: () => historyApi.list({ liveId, take: 50, page: 1 }),
    enabled: open && !!liveId,
  });

  const detailQ = useQuery({
    queryKey: ["history", detailId],
    queryFn: () => historyApi.get(detailId!),
    enabled: open && !!detailId,
  });

  const rows = useMemo(() => {
    const data = (listQ.data?.data ?? []) as HistoryRow[];
    return data.filter((r) => (r.payload?.participants ?? []).length > 0);
  }, [listQ.data]);

  const detail = detailQ.data as HistoryRow | undefined;
  const mine = detail?.payload?.participants?.[0];
  const winner =
    (detail?.winnerColor || detail?.payload?.winnerColor) as string | undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setDetailId(null);
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[85vh] max-w-md gap-0 overflow-hidden rounded-2xl border-white/10 bg-[#16122a] p-0 text-white">
        <DialogHeader className="border-b border-white/10 px-4 py-3">
          <DialogTitle className="flex items-center gap-2 text-base text-white">
            {detailId ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sky-300 hover:underline"
                onClick={() => setDetailId(null)}
              >
                <ArrowLeft className="size-4" />
                Volver
              </button>
            ) : (
              <>
                <History className="size-4 text-sky-300" />
                Mis rondas
              </>
            )}
          </DialogTitle>
          <p className="text-xs font-semibold text-white/50">
            {detailId
              ? "Resumen fácil de lo que te pasó"
              : "Toca una tarjeta para ver el detalle"}
          </p>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto px-3 py-3">
          {!detailId && (
            <>
              {listQ.isLoading && (
                <p className="py-6 text-center text-sm text-white/50">Cargando…</p>
              )}
              {!listQ.isLoading && rows.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/15 px-4 py-8 text-center">
                  <p className="text-sm font-bold text-white/70">
                    Aún no jugaste ninguna ronda aquí
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    Cuando compres colores y termine la ronda, verás el resultado
                    en esta lista.
                  </p>
                </div>
              )}
              <ul className="space-y-2">
                {rows.map((r, index) => {
                  const w = (r.winnerColor ||
                    r.payload?.winnerColor) as string | undefined;
                  const p = r.payload?.participants?.[0];
                  const won =
                    !!w &&
                    (p?.purchases ?? []).some(
                      (x) => x.color === w && (x.quantity ?? 0) > 0,
                    );
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => setDetailId(r.id)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-left hover:bg-white/10"
                      >
                        <span
                          className={cn(
                            "size-11 shrink-0 rounded-full ring-2 ring-white/20",
                            w && isLudoColor(w)
                              ? COLOR_TOKENS[w].swatch
                              : "bg-white/20",
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-white">
                            Ronda {rows.length - index}
                            {w && isLudoColor(w)
                              ? ` · ganó ${COLOR_TOKENS[w].label}`
                              : ""}
                          </p>
                          <p className="text-xs font-semibold text-white/55">
                            {r.finishedAt
                              ? new Date(r.finishedAt).toLocaleString("es-PE", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                            {typeof p?.points === "number"
                              ? ` · +${p.points} pts`
                              : ""}
                          </p>
                        </div>
                        <Badge
                          variant={won ? "success" : "secondary"}
                          className="shrink-0"
                        >
                          {won ? "¡Ganaste!" : "Sin premio"}
                        </Badge>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {detailId && (
            <div className="space-y-3">
              {detailQ.isLoading && (
                <p className="py-6 text-center text-sm text-white/50">Cargando…</p>
              )}
              {detail && (
                <>
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-center">
                    <p className="text-[11px] font-black uppercase tracking-wide text-amber-200/80">
                      Color que salió
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      {winner && isLudoColor(winner) && (
                        <span
                          className={cn(
                            "size-10 rounded-full ring-2 ring-white/40",
                            COLOR_TOKENS[winner as LudoColor].swatch,
                          )}
                        />
                      )}
                      <p className="text-2xl font-black">
                        {winner && isLudoColor(winner)
                          ? COLOR_TOKENS[winner as LudoColor].label
                          : winner ?? "—"}
                      </p>
                    </div>
                    <p className="mt-2 text-xs font-bold text-white/55">
                      {detail.finishedAt
                        ? new Date(detail.finishedAt).toLocaleString("es-PE")
                        : ""}
                    </p>
                  </div>

                  {!mine ? (
                    <p className="text-center text-sm text-white/50">
                      No participaste en esta ronda.
                    </p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <Stat label="Lo que gastaste" value={formatMoney(mine.spentCents ?? 0)} />
                        <Stat
                          label="Tu premio"
                          value={formatMoney(mine.prizeCents ?? 0)}
                          highlight={(mine.prizeCents ?? 0) > 0}
                        />
                        <Stat label="Puntos ganados" value={`+${mine.points ?? 0}`} />
                        <Stat
                          label="Tu mochila quedó en"
                          value={formatMoney(mine.balanceAfter ?? 0)}
                        />
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-black uppercase tracking-wide text-white/45">
                          Colores que pediste
                        </p>
                        {(mine.purchases ?? []).length === 0 ? (
                          <p className="text-sm text-white/50">No pediste nada</p>
                        ) : (
                          <ul className="space-y-1.5">
                            {(mine.purchases ?? []).map((p, i) => {
                              const color = p.color;
                              const label =
                                color && isLudoColor(color)
                                  ? COLOR_TOKENS[color].label
                                  : color ?? "?";
                              const isWin = color === winner;
                              return (
                                <li
                                  key={`${color}-${i}`}
                                  className={cn(
                                    "flex items-center justify-between rounded-xl border px-3 py-2 text-sm font-bold",
                                    isWin
                                      ? "border-emerald-400/40 bg-emerald-500/15"
                                      : "border-white/10 bg-white/5",
                                  )}
                                >
                                  <span className="flex items-center gap-2">
                                    {color && isLudoColor(color) && (
                                      <span
                                        className={cn(
                                          "size-3 rounded-full",
                                          COLOR_TOKENS[color].swatch,
                                        )}
                                      />
                                    )}
                                    {label} ×{p.quantity ?? 0}
                                    {isWin ? " ✓" : ""}
                                  </span>
                                  <span className="text-white/55">
                                    {(p.multiplier ?? 1) > 1
                                      ? `promo ×${p.multiplier}`
                                      : "normal"}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </>
                  )}

                  <Button
                    variant="outline"
                    className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
                    onClick={() => setDetailId(null)}
                  >
                    Ver todas mis rondas
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-wide text-white/45">
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-black tabular-nums",
          highlight ? "text-emerald-300" : "text-white",
        )}
      >
        {value}
      </p>
    </div>
  );
}
