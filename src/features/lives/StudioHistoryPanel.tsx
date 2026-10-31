import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { historyApi } from "@/api/resources";
import { COLOR_TOKENS, isLudoColor, type LudoColor } from "@/lib/colors";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StudioHistoryPanelProps = {
  liveId: string;
};

type Participant = {
  userId: string;
  username?: string;
  prizeCents?: number;
  points?: number;
  spentCents?: number;
  purchases?: Array<{ color?: string; quantity?: number }>;
};

type HistoryItem = {
  id: string;
  winnerColor?: string | null;
  finishedAt?: string;
  payload?: {
    winnerColor?: string;
    participants?: Participant[];
  };
};

export function StudioHistoryPanel({ liveId }: StudioHistoryPanelProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const listQ = useQuery({
    queryKey: ["history", "studio", liveId],
    queryFn: () => historyApi.list({ liveId, take: 30, page: 1 }),
    refetchInterval: 15_000,
  });

  const rows = (listQ.data?.data ?? []) as HistoryItem[];

  const detail = useMemo(
    () => rows.find((r) => r.id === openId) ?? null,
    [rows, openId],
  );

  if (listQ.isLoading) {
    return <p className="py-6 text-center text-sm text-muted">Cargando historial…</p>;
  }

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted-bg/50 px-4 py-8 text-center">
        <p className="text-sm font-bold text-muted">
          Todavía no hay rondas terminadas en esta transmisión.
        </p>
        <p className="mt-1 text-xs text-muted">
          Cuando declares un color ganador, aparecerá aquí con la hora y quiénes
          jugaron.
        </p>
      </div>
    );
  }

  if (detail) {
    const winner = (detail.winnerColor ||
      detail.payload?.winnerColor) as string | undefined;
    const parts = detail.payload?.participants ?? [];
    const winners = parts.filter((p) => (p.prizeCents ?? 0) > 0);

    return (
      <div className="space-y-3">
        <Button
          size="sm"
          variant="ghost"
          className="px-0 font-bold text-primary"
          onClick={() => setOpenId(null)}
        >
          ← Volver a la lista
        </Button>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-center">
          <p className="text-[11px] font-black uppercase tracking-wide text-amber-800/70">
            Color que ganó
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            {winner && isLudoColor(winner) && (
              <span
                className={cn(
                  "size-10 rounded-full ring-2 ring-white shadow",
                  COLOR_TOKENS[winner as LudoColor].swatch,
                )}
              />
            )}
            <p className="text-2xl font-black text-[#1a120b]">
              {winner && isLudoColor(winner)
                ? COLOR_TOKENS[winner as LudoColor].label
                : winner ?? "—"}
            </p>
          </div>
          <p className="mt-2 text-sm font-bold text-muted">
            {detail.finishedAt
              ? new Date(detail.finishedAt).toLocaleString("es-PE", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl border border-border bg-white px-2 py-2">
            <p className="text-[10px] font-black uppercase text-muted">Jugadores</p>
            <p className="text-lg font-black">{parts.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-white px-2 py-2">
            <p className="text-[10px] font-black uppercase text-muted">Con premio</p>
            <p className="text-lg font-black text-emerald-700">{winners.length}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wide text-muted">
            Quién jugó
          </p>
          {parts.length === 0 ? (
            <p className="text-sm text-muted">Nadie compró en esta ronda.</p>
          ) : (
            <ul className="max-h-[280px] space-y-2 overflow-y-auto">
              {parts.map((p) => {
                const name = p.username ?? p.userId.slice(0, 8);
                const won = (p.prizeCents ?? 0) > 0;
                const colors = (p.purchases ?? [])
                  .map((c) => {
                    const label =
                      c.color && isLudoColor(c.color)
                        ? COLOR_TOKENS[c.color].label
                        : c.color;
                    return `${label}×${c.quantity ?? 0}`;
                  })
                  .join(" · ");
                return (
                  <li
                    key={p.userId}
                    className={cn(
                      "rounded-xl border px-3 py-2",
                      won
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-border bg-white",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-black">{name}</p>
                      <Badge variant={won ? "success" : "secondary"}>
                        {won ? "Ganó" : "Sin premio"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-muted">
                      {colors || "Sin compras"}
                    </p>
                    <p className="mt-1 text-xs font-bold">
                      Premio {formatMoney(p.prizeCents ?? 0)}
                      {typeof p.points === "number" ? ` · +${p.points} pts` : ""}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted">
        Toca una ronda para ver quién ganó, a qué hora y el detalle de cada
        jugador.
      </p>
      <ul className="space-y-2">
        {rows.map((r, index) => {
          const winner = (r.winnerColor || r.payload?.winnerColor) as
            | string
            | undefined;
          const parts = r.payload?.participants ?? [];
          const winners = parts.filter((p) => (p.prizeCents ?? 0) > 0).length;
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setOpenId(r.id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-white px-3 py-3 text-left shadow-sm transition hover:border-primary/40 hover:bg-sky-50/50"
              >
                <span
                  className={cn(
                    "size-11 shrink-0 rounded-full shadow ring-2 ring-white",
                    winner && isLudoColor(winner)
                      ? COLOR_TOKENS[winner as LudoColor].swatch
                      : "bg-muted-bg",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black">
                    Ronda {rows.length - index}
                    {winner && isLudoColor(winner)
                      ? ` · ganó ${COLOR_TOKENS[winner as LudoColor].label}`
                      : ""}
                  </p>
                  <p className="text-xs font-semibold text-muted">
                    {r.finishedAt
                      ? new Date(r.finishedAt).toLocaleString("es-PE", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                    {" · "}
                    {parts.length} jugador{parts.length === 1 ? "" : "es"}
                    {winners > 0 ? ` · ${winners} con premio` : ""}
                  </p>
                </div>
                <span className="text-xs font-black text-primary">Ver</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
