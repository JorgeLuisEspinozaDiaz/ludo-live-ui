import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  livesApi,
  promosApi,
  purchasesApi,
  roundsApi,
  walletsApi,
  type Purchase,
} from "@/api/resources";
import { LiveSubscriber } from "@/livekit/LiveSubscriber";
import { useSocket } from "@/realtime/SocketProvider";
import { useSocketEvent } from "@/realtime/useSocketEvent";
import { ColorBoard } from "@/components/game/ColorBoard";
import { RoundStatusBanner } from "@/components/game/RoundStatusBanner";
import { WalletBadge } from "@/components/game/WalletBadge";
import { ColorChip } from "@/components/game/ColorChip";
import { useSessionStore } from "@/auth/session-store";
import type { LudoColor } from "@/lib/colors";
import { COLOR_TOKENS } from "@/lib/colors";
import {
  addCents,
  centsToNumber,
  formatMoney,
  multiplyCents,
  visualStatusFromBackend,
} from "@/lib/money";
import { getErrorMessage } from "@/lib/errors";
import { t } from "@/i18n/es";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { getStoredRoundId, setStoredRoundId } from "./live-round-storage";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";

type PendingBuy = { color: LudoColor; quantity: number };

export default function LiveWatchPage() {
  const { liveId = "" } = useParams<{ liveId: string }>();
  const userId = useSessionStore((s) => s.user?.id);
  const qc = useQueryClient();
  const { joinLive, leaveLive, connected } = useSocket();
  const hadSocketConnected = useRef(false);
  const shownFinishForRound = useRef<string | null>(null);

  const [roundId, setRoundId] = useState<string | null>(() =>
    liveId ? getStoredRoundId(liveId) : null,
  );
  const [pendingBuy, setPendingBuy] = useState<PendingBuy | null>(null);
  const [loadingColor, setLoadingColor] = useState<LudoColor | null>(null);
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [finishPayload, setFinishPayload] = useState<{
    winnerColor: LudoColor;
    prizeCents?: number;
    points?: number;
    balanceCents?: number;
  } | null>(null);

  useEffect(() => {
    if (!liveId) return;
    joinLive(liveId);
    return () => leaveLive(liveId);
  }, [liveId, joinLive, leaveLive]);

  useSocketEvent<{ roundId: string; liveId: string }>("round:created", (p) => {
    if (p.liveId === liveId) {
      setRoundId(p.roundId);
      setStoredRoundId(liveId, p.roundId);
    }
  });

  useSocketEvent<{ roundId: string; winnerColor: LudoColor }>("round:finished", (p) => {
    if (p.roundId === roundId) {
      setFinishPayload({ winnerColor: p.winnerColor });
      setFinishModalOpen(true);
    }
  });

  useEffect(() => {
    if (!roundId || !connected) return;
    if (hadSocketConnected.current) {
      void qc.invalidateQueries({ queryKey: ["round", roundId] });
      void qc.invalidateQueries({ queryKey: ["inventory", roundId] });
      void qc.invalidateQueries({ queryKey: ["purchases", roundId] });
      void qc.invalidateQueries({ queryKey: ["wallet", "me"] });
    } else {
      hadSocketConnected.current = true;
    }
  }, [connected, roundId, qc]);

  const liveQuery = useQuery({
    queryKey: ["live", liveId],
    queryFn: () => livesApi.get(liveId),
    enabled: !!liveId,
  });

  const tokenQuery = useQuery({
    queryKey: ["live", liveId, "token"],
    queryFn: () => livesApi.token(liveId),
    enabled: !!liveId && liveQuery.data?.status === "LIVE",
    staleTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const roundQuery = useQuery({
    queryKey: ["round", roundId],
    queryFn: () => roundsApi.get(roundId!),
    enabled: !!roundId,
  });

  const inventoryQuery = useQuery({
    queryKey: ["inventory", roundId],
    queryFn: () => roundsApi.inventory(roundId!),
    enabled: !!roundId,
  });

  const promosQuery = useQuery({
    queryKey: ["promos", roundId],
    queryFn: () => promosApi.list(roundId!),
    enabled: !!roundId,
  });

  const purchasesQuery = useQuery({
    queryKey: ["purchases", roundId],
    queryFn: () => roundsApi.purchases(roundId!),
    enabled: !!roundId,
  });

  const walletQuery = useQuery({
    queryKey: ["wallet", "me"],
    queryFn: () => walletsApi.me(),
  });

  const roundWalletsQuery = useQuery({
    queryKey: ["round", roundId, "wallets"],
    queryFn: () => roundsApi.wallets(roundId!),
    enabled: !!roundId,
  });

  const purchaseMutation = useMutation({
    mutationFn: (buy: PendingBuy) =>
      purchasesApi.create(roundId!, { color: buy.color, quantity: buy.quantity }),
    onSuccess: () => {
      // Notificación vía socket purchase:created
      setPendingBuy(null);
      setLoadingColor(null);
      void qc.invalidateQueries({ queryKey: ["purchases", roundId] });
      void qc.invalidateQueries({ queryKey: ["inventory", roundId] });
      void qc.invalidateQueries({ queryKey: ["wallet", "me"] });
    },
    onError: (e) => {
      setLoadingColor(null);
      toast.error(getErrorMessage(e));
    },
  });

  const round = roundQuery.data;
  const myPurchases = (purchasesQuery.data ?? []).filter(
    (p: Purchase) => p.userId === userId && p.status === "ACTIVE",
  );

  const priceCents = round?.priceCents ?? 0;
  const pendingTotal =
    pendingBuy != null ? multiplyCents(priceCents, pendingBuy.quantity) : 0;
  const balanceBefore = centsToNumber(walletQuery.data?.balanceCents);
  const balanceAfter = addCents(balanceBefore, -pendingTotal);
  const wouldNegative = balanceAfter < 0;

  useEffect(() => {
    if (
      roundId &&
      round?.status === "FINISHED" &&
      round.winnerColor &&
      shownFinishForRound.current !== roundId
    ) {
      shownFinishForRound.current = roundId;
      setFinishPayload({
        winnerColor: round.winnerColor,
        prizeCents: round.prizeCents,
        balanceCents: walletQuery.data?.balanceCents,
      });
      setFinishModalOpen(true);
    }
  }, [roundId, round?.status, round?.winnerColor, round?.prizeCents, walletQuery.data?.balanceCents]);

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-8 md:max-w-xl">
      <PageHeader
        className="mb-4"
        title={liveQuery.data?.title ?? "En vivo"}
        backTo="/lives"
        backLabel="Transmisiones"
        actions={
          <Badge variant={connected ? "success" : "secondary"} className="text-xs">
            {connected ? t("common.connected") : t("common.disconnected")}
          </Badge>
        }
      />

      {walletQuery.data && (
        <WalletBadge
          balanceCents={walletQuery.data.balanceCents}
          visualStatus={visualStatusFromBackend(
            walletQuery.data.visualStatus,
            walletQuery.data.balanceCents,
          )}
          className="w-full justify-center"
        />
      )}

      {tokenQuery.data?.token ? (
        <LiveSubscriber token={tokenQuery.data.token} serverUrl={tokenQuery.data.url} />
      ) : (
        <div className="aspect-video rounded-lg bg-slate-200 flex items-center justify-center text-sm text-muted">
          {liveQuery.data?.status === "LIVE" ? t("common.loading") : "Transmisión no activa"}
        </div>
      )}

      {!roundId ? (
        <p className="text-center text-sm text-muted">
          Esperando ronda del anfitrión…
        </p>
      ) : (
        <>
          {round && (
            <RoundStatusBanner status={round.status} winnerColor={round.winnerColor} />
          )}

          <ColorBoard
            inventory={inventoryQuery.data ?? []}
            promos={promosQuery.data ?? []}
            priceCents={priceCents}
            purchasesOpen={round?.status === "PURCHASES_OPEN"}
            disabled={purchaseMutation.isPending}
            loadingColor={loadingColor}
            onBuy={(color, quantity) => setPendingBuy({ color, quantity })}
          />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Mis compras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {myPurchases.length === 0 ? (
                <p className="text-muted">Sin compras en esta ronda.</p>
              ) : (
                myPurchases.map((p) => (
                  <div key={p.id} className="flex justify-between">
                    <ColorChip color={p.color} size="sm" />
                    <span>×{p.quantity}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Mochilas en la ronda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {(roundWalletsQuery.data ?? []).slice(0, 15).map((w) => (
                <div key={w.userId} className="flex justify-between">
                  <span>{w.username ?? "Participante"}</span>
                  {w.wallet && (
                    <span className="tabular-nums">{formatMoney(w.wallet.balanceCents)}</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={!!pendingBuy} onOpenChange={(o) => !o && setPendingBuy(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar compra</DialogTitle>
          </DialogHeader>
          {pendingBuy && (
            <div className="space-y-3 text-sm">
              <ColorChip color={pendingBuy.color} size="md" />
              <p>
                {t("purchase.summary", {
                  qty: pendingBuy.quantity,
                  unit: formatMoney(priceCents),
                  total: formatMoney(pendingTotal),
                })}
              </p>
              <p>
                Saldo actual: {formatMoney(balanceBefore)} → {formatMoney(balanceAfter)}
              </p>
              {wouldNegative && (
                <p className="font-medium text-red-600">{t("purchase.negativeWarn")}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingBuy(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              disabled={purchaseMutation.isPending || !pendingBuy}
              onClick={() => {
                if (!pendingBuy) return;
                setLoadingColor(pendingBuy.color);
                purchaseMutation.mutate(pendingBuy);
              }}
            >
              {purchaseMutation.isPending ? t("common.loading") : t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={finishModalOpen} onOpenChange={setFinishModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("round.finished")}</DialogTitle>
          </DialogHeader>
          {finishPayload && (
            <div className="space-y-3 text-center">
              <p className="text-lg font-semibold">
                {t("round.winner", {
                  color: COLOR_TOKENS[finishPayload.winnerColor].label,
                })}
              </p>
              {finishPayload.prizeCents != null && (
                <p>Premio: {formatMoney(finishPayload.prizeCents)}</p>
              )}
              {finishPayload.points != null && (
                <p>Puntos: {finishPayload.points}</p>
              )}
              {finishPayload.balanceCents != null && (
                <p>Tu mochila: {formatMoney(finishPayload.balanceCents)}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setFinishModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
