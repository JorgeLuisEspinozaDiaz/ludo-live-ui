import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { roundsApi, type Purchase } from "@/api/resources";
import { COLOR_TOKENS } from "@/lib/colors";
import { formatMoney, visualStatusFromBackend } from "@/lib/money";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Tab = "mochilas" | "compras";

type PlayerBoardModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roundId: string | null;
  myPurchases: Purchase[];
};

export function PlayerBoardModal({
  open,
  onOpenChange,
  roundId,
  myPurchases,
}: PlayerBoardModalProps) {
  const [tab, setTab] = useState<Tab>("mochilas");

  const boardQuery = useQuery({
    queryKey: ["round", roundId, "wallets"],
    queryFn: () => roundsApi.wallets(roundId!),
    enabled: open && !!roundId,
    refetchInterval: open ? 5000 : false,
  });

  const rows = boardQuery.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-md gap-0 overflow-hidden rounded-2xl border-white/10 bg-[#16122a] p-0 text-white">
        <DialogHeader className="border-b border-white/10 px-4 py-3">
          <DialogTitle className="text-base text-white">Sala</DialogTitle>
          <p className="text-xs font-semibold text-white/50">
            Mochilas de todos y tus compras
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-1 border-b border-white/10 p-2">
          <button
            type="button"
            onClick={() => setTab("mochilas")}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-black transition",
              tab === "mochilas"
                ? "bg-amber-400 text-[#1a120b]"
                : "bg-white/5 text-white/70 hover:bg-white/10",
            )}
          >
            Mochilas
          </button>
          <button
            type="button"
            onClick={() => setTab("compras")}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-black transition",
              tab === "compras"
                ? "bg-amber-400 text-[#1a120b]"
                : "bg-white/5 text-white/70 hover:bg-white/10",
            )}
          >
            Mis compras
            {myPurchases.length > 0 ? (
              <span className="ml-1 tabular-nums">({myPurchases.length})</span>
            ) : null}
          </button>
        </div>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto px-3 py-3">
          {tab === "mochilas" ? (
            !roundId ? (
              <p className="px-2 py-8 text-center text-sm font-semibold text-white/50">
                Aún no hay ronda activa
              </p>
            ) : boardQuery.isLoading ? (
              <p className="px-2 py-8 text-center text-sm font-semibold text-white/50">
                Cargando…
              </p>
            ) : rows.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm font-semibold text-white/50">
                Nadie conectado todavía
              </p>
            ) : (
              rows.map((row) => {
                const balance = row.wallet?.balanceCents ?? 0;
                const visual = visualStatusFromBackend(
                  row.wallet?.visualStatus,
                  balance,
                );
                return (
                  <div
                    key={row.userId}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-sm font-black text-white">
                      {(row.username?.[0] ?? "?").toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">
                        {row.username ?? "Jugador"}
                      </p>
                      <p className="text-[11px] font-bold text-amber-200/90">
                        Puntos: {row.pointsBalance ?? 0}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-black tabular-nums",
                        visual === "NEGATIVE" && "bg-rose-500/25 text-rose-200",
                        visual === "ZERO" && "bg-white/10 text-white/70",
                        visual === "POSITIVE" &&
                          "bg-emerald-500/25 text-emerald-200",
                      )}
                    >
                      {formatMoney(balance)}
                    </span>
                  </div>
                );
              })
            )
          ) : myPurchases.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm font-semibold text-white/50">
              Todavía no pediste ningún color
            </p>
          ) : (
            myPurchases.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5"
              >
                <span
                  className={cn(
                    "size-10 shrink-0 rounded-full ring-2 ring-white/30",
                    COLOR_TOKENS[p.color].swatch,
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black">
                    {COLOR_TOKENS[p.color].label}
                  </p>
                  <p className="text-[11px] font-bold text-white/50">
                    {formatMoney((p.unitPriceCents ?? 0) * p.quantity)}
                  </p>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-sm font-black tabular-nums">
                  ×{p.quantity}
                </span>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
