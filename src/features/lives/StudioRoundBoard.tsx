import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import {
  purchasesApi,
  roundsApi,
  walletsApi,
  type Purchase,
} from "@/api/resources";
import { COLOR_TOKENS, type LudoColor } from "@/lib/colors";
import { formatMoney, solesToCents, visualStatusFromBackend } from "@/lib/money";
import { getErrorMessage, isForceCancelWarning } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type StudioRoundBoardProps = {
  roundId: string;
  /** Vista densa para el panel lateral del estudio */
  compact?: boolean;
};

function colorSummary(colors: Record<string, number>) {
  return Object.entries(colors)
    .filter(([, qty]) => qty > 0)
    .map(([color, qty]) => {
      const label = COLOR_TOKENS[color as LudoColor]?.label ?? color;
      return `${label} ×${qty}`;
    })
    .join(" · ");
}

export function StudioRoundBoard({ roundId, compact = false }: StudioRoundBoardProps) {
  const qc = useQueryClient();
  const [paymentDraft, setPaymentDraft] = useState<Record<string, string>>({});
  const [cancelTarget, setCancelTarget] = useState<Purchase | null>(null);
  const [forceCancel, setForceCancel] = useState(false);

  const purchasesQuery = useQuery({
    queryKey: ["purchases", roundId],
    queryFn: () => roundsApi.purchases(roundId),
    refetchInterval: 8_000,
  });

  const walletsQuery = useQuery({
    queryKey: ["round", roundId, "wallets"],
    queryFn: () => roundsApi.wallets(roundId),
    refetchInterval: 8_000,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["purchases", roundId] });
    void qc.invalidateQueries({ queryKey: ["round", roundId, "wallets"] });
    void qc.invalidateQueries({ queryKey: ["inventory", roundId] });
  };

  const activePurchases = useMemo(
    () => (purchasesQuery.data ?? []).filter((p) => p.status === "ACTIVE"),
    [purchasesQuery.data],
  );

  const cancelMutation = useMutation({
    mutationFn: (opts: { force?: boolean }) =>
      purchasesApi.cancel(cancelTarget!.id, {
        reason: "Cancelado por el anfitrión",
        force: opts.force,
      }),
    onSuccess: () => {
      toast.success("Compra eliminada");
      setCancelTarget(null);
      setForceCancel(false);
      invalidate();
    },
    onError: (e) => {
      if (isForceCancelWarning(e)) {
        setForceCancel(true);
        return;
      }
      toast.error(getErrorMessage(e));
    },
  });

  const paymentMutation = useMutation({
    mutationFn: ({ userId, soles }: { userId: string; soles: number }) =>
      walletsApi.payment(userId, { amountCents: solesToCents(soles) }),
    onSuccess: (_data, vars) => {
      toast.success(`Pago registrado · ${formatMoney(solesToCents(vars.soles))}`);
      setPaymentDraft((prev) => ({ ...prev, [vars.userId]: "" }));
      invalidate();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <>
      <div
        className={cn(
          "grid gap-4",
          compact ? "grid-cols-1" : "gap-5 xl:grid-cols-2",
        )}
      >
        <Card className={cn(compact && "border-border/80 shadow-none")}>
          <CardHeader className={cn("pb-3", compact && "p-3 pb-2")}>
            <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
              <span>Compras</span>
              <Badge variant="secondary">{activePurchases.length} activas</Badge>
            </CardTitle>
            {!compact && (
              <p className="text-sm font-semibold text-muted">
                Quién pidió, qué color y cuántos. Puedes borrar una compra si te
                equivocaste.
              </p>
            )}
          </CardHeader>
          <CardContent className={cn(compact && "p-3 pt-0")}>
            {activePurchases.length === 0 ? (
              <p
                className={cn(
                  "rounded-xl border border-dashed border-border bg-muted-bg text-center text-sm font-semibold text-muted",
                  compact ? "px-3 py-4 text-xs" : "px-4 py-8",
                )}
              >
                Aún no hay compras.
              </p>
            ) : (
              <ul
                className={cn(
                  "space-y-2 overflow-y-auto pr-1",
                  compact ? "max-h-[220px]" : "max-h-[420px]",
                )}
              >
                {activePurchases.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-white px-3 py-2.5 shadow-sm"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-sm font-black text-white">
                      {(p.username?.[0] ?? "?").toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-black text-foreground">
                        {p.username ?? "Jugador"}
                      </p>
                      <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-foreground">
                        <span
                          className={cn(
                            "inline-flex size-3 rounded-full",
                            COLOR_TOKENS[p.color].swatch,
                          )}
                        />
                        <span>{COLOR_TOKENS[p.color].label}</span>
                        <span className="text-muted">×</span>
                        <span className="tabular-nums">{p.quantity}</span>
                        <span className="text-muted">·</span>
                        <span className="tabular-nums text-muted">
                          {formatMoney(
                            (p.unitPriceCents ?? 0) * (p.quantity ?? 0),
                          )}
                        </span>
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="shrink-0 text-danger hover:bg-rose-50 hover:text-danger"
                      onClick={() => {
                        setCancelTarget(p);
                        setForceCancel(false);
                      }}
                    >
                      <Trash2 className="size-4" />
                      Borrar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className={cn(compact && "border-border/80 shadow-none")}>
          <CardHeader className={cn("pb-3", compact && "p-3 pb-2")}>
            <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
              <span>Mochilas</span>
              <Badge variant="secondary">
                {(walletsQuery.data ?? []).length} jugadores
              </Badge>
            </CardTitle>
            {!compact && (
              <p className="text-sm font-semibold text-muted">
                Saldo de cada uno. Si te pagaron en efectivo, escribe el monto y
                pulsa Pagar.
              </p>
            )}
          </CardHeader>
          <CardContent className={cn(compact && "p-3 pt-0")}>
            {walletsQuery.isError ? (
              <p
                className={cn(
                  "rounded-xl border border-dashed border-rose-200 bg-rose-50 text-center text-sm font-semibold text-rose-700",
                  compact ? "px-3 py-4 text-xs" : "px-4 py-8",
                )}
              >
                No se pudieron cargar las mochilas. Reintenta.
              </p>
            ) : (walletsQuery.data ?? []).length === 0 ? (
              <p
                className={cn(
                  "rounded-xl border border-dashed border-border bg-muted-bg text-center text-sm font-semibold text-muted",
                  compact ? "px-3 py-4 text-xs" : "px-4 py-8",
                )}
              >
                {activePurchases.length > 0
                  ? "Hay compras, pero aún no aparecen mochilas. Espera un momento…"
                  : "Cuando un jugador entre al live o compre, verás su mochila aquí para registrar el pago."}
              </p>
            ) : (
              <ul
                className={cn(
                  "space-y-3 overflow-y-auto pr-1",
                  compact ? "max-h-[220px]" : "max-h-[420px]",
                )}
              >
                {(walletsQuery.data ?? []).map((w) => {
                  const balance = w.wallet?.balanceCents ?? 0;
                  const visual = visualStatusFromBackend(
                    w.wallet?.visualStatus,
                    balance,
                  );
                  const draft = paymentDraft[w.userId] ?? "";
                  const soles = Number(draft);
                  const canPay = Number.isFinite(soles) && soles > 0;
                  const summary = colorSummary(w.colors ?? {});
                  const online = w.online !== false;

                  return (
                    <li
                      key={w.userId}
                      className="rounded-2xl border border-border bg-white p-3 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 text-base font-black text-foreground">
                            <span
                              className={cn(
                                "inline-flex size-2.5 shrink-0 rounded-full",
                                online ? "bg-emerald-500" : "bg-zinc-300",
                              )}
                              title={online ? "En live" : "Fuera / sin presencia"}
                            />
                            {w.username ?? "Jugador"}
                            {!online ? (
                              <span className="text-[10px] font-bold uppercase tracking-wide text-muted">
                                offline
                              </span>
                            ) : null}
                          </p>
                          <p className="text-xs font-bold text-amber-700">
                            Puntos: {w.pointsBalance ?? 0}
                          </p>
                          {summary ? (
                            <p className="mt-0.5 text-xs font-bold text-muted">
                              Pidió: {summary}
                            </p>
                          ) : null}
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-sm font-black tabular-nums",
                            visual === "NEGATIVE" &&
                              "bg-rose-100 text-rose-800",
                            visual === "ZERO" && "bg-muted-bg text-muted",
                            visual === "POSITIVE" &&
                              "bg-emerald-100 text-emerald-800",
                          )}
                        >
                          {formatMoney(balance)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <label className="sr-only" htmlFor={`pay-${w.userId}`}>
                          Monto pagado por {w.username}
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted">
                            S/
                          </span>
                          <Input
                            id={`pay-${w.userId}`}
                            type="number"
                            min="0"
                            step="0.5"
                            inputMode="decimal"
                            placeholder="0.00"
                            className="h-10 w-28 pl-9 font-bold tabular-nums"
                            value={draft}
                            onChange={(e) =>
                              setPaymentDraft((prev) => ({
                                ...prev,
                                [w.userId]: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="h-10"
                          disabled={
                            !canPay ||
                            (paymentMutation.isPending &&
                              paymentMutation.variables?.userId === w.userId)
                          }
                          onClick={() =>
                            paymentMutation.mutate({
                              userId: w.userId,
                              soles,
                            })
                          }
                        >
                          Registrar pago
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!cancelTarget && !forceCancel}
        onOpenChange={(o) => !o && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar esta compra?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget ? (
                <>
                  Se quitará{" "}
                  <strong>
                    {COLOR_TOKENS[cancelTarget.color].label} ×
                    {cancelTarget.quantity}
                  </strong>{" "}
                  de <strong>{cancelTarget.username ?? "Jugador"}</strong> y se
                  devolverá el saldo a su mochila.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate({})}
            >
              Sí, borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={forceCancel} onOpenChange={setForceCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Forzar borrado</AlertDialogTitle>
            <AlertDialogDescription>
              El servidor pidió confirmación extra. ¿Forzar la eliminación?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setForceCancel(false);
                setCancelTarget(null);
              }}
            >
              No
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate({ force: true })}
            >
              Forzar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
