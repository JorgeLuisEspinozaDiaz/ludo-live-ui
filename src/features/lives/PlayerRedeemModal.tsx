import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gift } from "lucide-react";
import { gameConfigApi, pointsApi } from "@/api/resources";
import { formatMoney } from "@/lib/money";
import { getErrorMessage } from "@/lib/errors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PlayerRedeemModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function creditCents(points: number, pointsPerSol: number, centsPerUnit: number) {
  if (pointsPerSol <= 0) return 0;
  const units = Math.floor(points / pointsPerSol);
  return units * centsPerUnit;
}

export function PlayerRedeemModal({ open, onOpenChange }: PlayerRedeemModalProps) {
  const qc = useQueryClient();
  const [customPoints, setCustomPoints] = useState("");

  const pointsQ = useQuery({
    queryKey: ["points", "me"],
    queryFn: pointsApi.me,
    enabled: open,
  });
  const cfgQ = useQuery({
    queryKey: ["game-config"],
    queryFn: gameConfigApi.get,
    enabled: open,
  });

  const available = pointsQ.data?.balance ?? 0;
  const cfg = cfgQ.data;
  const min = cfg?.minRedeemPoints ?? 0;
  const multiple = Math.max(1, cfg?.redeemPointsMultiple ?? 1);
  const pointsPerSol = Math.max(1, cfg?.pointsPerSol ?? 1);
  const centsPerUnit = cfg?.centsPerRedeemUnit ?? 100;

  const packages = useMemo(() => {
    if (!cfg) return [];
    const step = Math.max(multiple, min || multiple);
    const opts: number[] = [];
    for (let p = step; p <= available && opts.length < 6; p += step) {
      if (p >= min && p % multiple === 0) opts.push(p);
    }
    // Si no llega al mínimo, igual mostramos el mínimo como referencia
    if (!opts.length && min > 0) opts.push(min);
    return opts;
  }, [available, cfg, min, multiple]);

  const redeemMutation = useMutation({
    mutationFn: (points: number) => pointsApi.redeem(points),
    onSuccess: (data: { pointsRedeemed?: number; creditedCents?: number }) => {
      toast.success(
        `Canjeado: ${data.pointsRedeemed ?? 0} pts → ${formatMoney(data.creditedCents ?? 0)}`,
      );
      void qc.invalidateQueries({ queryKey: ["points", "me"] });
      void qc.invalidateQueries({ queryKey: ["wallet", "me"] });
      setCustomPoints("");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const customNum = Math.trunc(Number(customPoints) || 0);
  const customValid =
    customNum >= min &&
    customNum <= available &&
    customNum % multiple === 0 &&
    customNum > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-md gap-0 overflow-hidden rounded-2xl border-white/10 bg-[#16122a] p-0 text-white">
        <DialogHeader className="border-b border-white/10 px-4 py-3">
          <DialogTitle className="flex items-center gap-2 text-base text-white">
            <Gift className="size-4 text-amber-300" />
            Promociones de canje
          </DialogTitle>
          <p className="text-xs font-semibold text-white/50">
            Cambia puntos por saldo en tu mochila
          </p>
        </DialogHeader>

        <div className="space-y-4 px-4 py-4">
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-center">
            <p className="text-[11px] font-black uppercase tracking-wide text-amber-200/80">
              Tus puntos
            </p>
            <p className="text-3xl font-black tabular-nums text-amber-200">
              {pointsQ.isLoading ? "…" : available}
            </p>
            {cfg && (
              <p className="mt-1 text-xs font-semibold text-white/55">
                Cada {pointsPerSol} pts → {formatMoney(centsPerUnit)}
                {min > 0 ? ` · mínimo ${min}` : ""}
                {multiple > 1 ? ` · múltiplos de ${multiple}` : ""}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-wide text-white/45">
              Ofertas
            </p>
            {packages.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/15 px-3 py-4 text-center text-sm font-semibold text-white/50">
                {available < min
                  ? `Necesitas al menos ${min} puntos para canjear.`
                  : "No hay paquetes disponibles ahora."}
              </p>
            ) : (
              <ul className="space-y-2">
                {packages.map((pts) => {
                  const cents = creditCents(pts, pointsPerSol, centsPerUnit);
                  const can = pts <= available && pts >= min;
                  return (
                    <li key={pts}>
                      <button
                        type="button"
                        disabled={!can || redeemMutation.isPending}
                        onClick={() => redeemMutation.mutate(pts)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition",
                          can
                            ? "border-emerald-400/40 bg-emerald-500/10 hover:bg-emerald-500/20"
                            : "border-white/10 bg-white/5 opacity-50",
                        )}
                      >
                        <span>
                          <span className="block text-sm font-black text-white">
                            {pts} puntos
                          </span>
                          <span className="text-xs font-semibold text-white/55">
                            a tu mochila
                          </span>
                        </span>
                        <span className="text-base font-black text-emerald-300">
                          {formatMoney(cents)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="space-y-2 border-t border-white/10 pt-3">
            <Label htmlFor="custom-redeem" className="text-white/70">
              Otra cantidad
            </Label>
            <div className="flex gap-2">
              <Input
                id="custom-redeem"
                type="number"
                min={min}
                step={multiple}
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
                className="border-white/15 bg-white/5 text-white"
                placeholder={`${min || multiple}`}
              />
              <Button
                disabled={!customValid || redeemMutation.isPending}
                onClick={() => redeemMutation.mutate(customNum)}
                className="shrink-0 font-black"
              >
                Canjear
              </Button>
            </div>
            {customValid && (
              <p className="text-xs font-semibold text-emerald-300">
                Recibirás{" "}
                {formatMoney(creditCents(customNum, pointsPerSol, centsPerUnit))}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
