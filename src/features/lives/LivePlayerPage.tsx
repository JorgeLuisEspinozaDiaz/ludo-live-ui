import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  livesApi,
  promosApi,
  purchasesApi,
  roundsApi,
  walletsApi,
  type Purchase,
  type Round,
} from "@/api/resources";
import { LiveSubscriber } from "@/livekit/LiveSubscriber";
import { useSocket } from "@/realtime/SocketProvider";
import { useSocketEvent } from "@/realtime/useSocketEvent";
import { RoundStatusBanner } from "@/components/game/RoundStatusBanner";
import { WalletBadge } from "@/components/game/WalletBadge";
import { PlayerColorPicker } from "@/components/game/PlayerColorPicker";
import { LiveChat } from "@/components/live/LiveChat";
import { LivePresenceBadge } from "@/components/live/LivePresenceBadge";
import { useSessionStore } from "@/auth/session-store";
import type { LudoColor } from "@/lib/colors";
import { visualStatusFromBackend } from "@/lib/money";
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
import { toast } from "sonner";
import {
  getStoredRoundId,
  markFinishShown,
  setStoredRoundId,
  wasFinishShown,
} from "./live-round-storage";
import { PlayerBoardModal } from "./PlayerBoardModal";
import { PlayerRedeemModal } from "./PlayerRedeemModal";
import { PlayerHistoryModal } from "./PlayerHistoryModal";
import { RoundResultOverlay } from "./RoundResultOverlay";
import { Gift, History, Users } from "lucide-react";

type PendingBuy = { color: LudoColor; quantity: number };

const ACTIVE_ROUND: Round["status"][] = [
  "CREATED",
  "PURCHASES_OPEN",
  "PURCHASES_CLOSED",
];

function pickActiveRound(rounds: Round[]): Round | undefined {
  return (
    rounds.find((r) => r.status === "PURCHASES_OPEN") ??
    rounds.find((r) => r.status === "PURCHASES_CLOSED") ??
    rounds.find((r) => r.status === "CREATED") ??
    [...rounds].reverse().find((r) => ACTIVE_ROUND.includes(r.status))
  );
}

function remainingFor(
  inventory: { color: LudoColor; remaining?: number; capacity: number; sold: number }[],
  color: LudoColor,
) {
  const stock = inventory.find((i) => i.color === color);
  if (!stock) return 0;
  if (typeof stock.remaining === "number") return Math.max(0, stock.remaining);
  return Math.max(0, stock.capacity - stock.sold);
}

export default function LivePlayerPage() {
  const { liveId = "" } = useParams<{ liveId: string }>();
  const userId = useSessionStore((s) => s.user?.id);
  const username = useSessionStore((s) => s.user?.username);
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
  const [boardOpen, setBoardOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [finishPayload, setFinishPayload] = useState<{
    winnerColor: LudoColor;
    prizeCents?: number;
    balanceCents?: number;
    iWon: boolean;
    wonQty: number;
    pointsEarned?: number;
    boughtQty?: number;
    promoQty?: number;
  } | null>(null);

  useEffect(() => {
    if (!liveId) return;
    joinLive(liveId);
    return () => leaveLive(liveId);
  }, [liveId, joinLive, leaveLive]);

  const roundsListQuery = useQuery({
    queryKey: ["live", liveId, "rounds"],
    queryFn: () => roundsApi.listByLive(liveId),
    enabled: !!liveId,
    refetchInterval: 8000,
  });

  useEffect(() => {
    const rounds = roundsListQuery.data;
    if (!rounds?.length) return;
    const active = pickActiveRound(rounds);
    if (active && active.id !== roundId) {
      setRoundId(active.id);
      setStoredRoundId(liveId, active.id);
    }
  }, [roundsListQuery.data, liveId, roundId]);

  useSocketEvent<{ roundId: string; liveId: string }>("round:created", (p) => {
    if (p.liveId === liveId) {
      setRoundId(p.roundId);
      setStoredRoundId(liveId, p.roundId);
      void qc.invalidateQueries({ queryKey: ["live", liveId, "rounds"] });
    }
  });

  useSocketEvent<{ roundId: string }>("round:purchases_opened", (p) => {
    if (p.roundId === roundId) {
      void qc.invalidateQueries({ queryKey: ["round", roundId] });
      void qc.invalidateQueries({ queryKey: ["inventory", roundId] });
    }
  });

  useSocketEvent<{ roundId: string }>("round:purchases_closed", (p) => {
    if (p.roundId === roundId) {
      void qc.invalidateQueries({ queryKey: ["round", roundId] });
    }
  });

  // Broadcast: solo refresca estado; el modal lo abre round:result (datos del jugador)
  useSocketEvent<{
    roundId: string;
    winnerColor: LudoColor;
    prizeCents?: number;
  }>("round:finished", (p) => {
    if (p.roundId !== roundId) return;
    void qc.invalidateQueries({ queryKey: ["round", p.roundId] });
    void qc.invalidateQueries({ queryKey: ["purchases", p.roundId] });
    void qc.invalidateQueries({ queryKey: ["wallet", "me"] });
    void qc.invalidateQueries({ queryKey: ["points", "me"] });
    void qc.invalidateQueries({ queryKey: ["live", liveId, "rounds"] });
  });

  // Resultado personal (ganaste/perdaste + puntos) — sala de usuario
  useSocketEvent<{
    roundId: string;
    winnerColor: LudoColor;
    iWon: boolean;
    wonQty: number;
    boughtQty?: number;
    promoQty?: number;
    prizeCents?: number;
    pointsEarned?: number;
    balanceCents?: number | null;
    pointsBalance?: number;
  }>("round:result", (p) => {
    // Aceptar aunque roundId local ya cambió (nueva ronda creada).
    // No reabrir tras recarga (sessionStorage).
    if (wasFinishShown(p.roundId) || shownFinishForRound.current === p.roundId) {
      void qc.invalidateQueries({ queryKey: ["points", "me"] });
      void qc.invalidateQueries({ queryKey: ["wallet", "me"] });
      return;
    }
    shownFinishForRound.current = p.roundId;
    markFinishShown(p.roundId);
    if (typeof p.pointsBalance === "number") {
      qc.setQueryData(["points", "me"], (prev: { balance?: number } | undefined) =>
        prev
          ? { ...prev, balance: p.pointsBalance }
          : { id: "me", userId: "me", balance: p.pointsBalance },
      );
    }
    setFinishPayload({
      winnerColor: p.winnerColor,
      iWon: p.iWon,
      wonQty: p.wonQty,
      boughtQty: p.boughtQty,
      promoQty: p.promoQty,
      prizeCents: p.prizeCents,
      pointsEarned: p.pointsEarned,
      balanceCents:
        typeof p.balanceCents === "number"
          ? p.balanceCents
          : walletQuery.data?.balanceCents,
    });
    setFinishModalOpen(true);
    void qc.invalidateQueries({ queryKey: ["wallet", "me"] });
    void qc.invalidateQueries({ queryKey: ["points", "me"] });
    void qc.invalidateQueries({ queryKey: ["purchases", p.roundId] });
  });

  useEffect(() => {
    if (!roundId || !connected) return;
    if (hadSocketConnected.current) {
      void qc.invalidateQueries({ queryKey: ["round", roundId] });
      void qc.invalidateQueries({ queryKey: ["inventory", roundId] });
      void qc.invalidateQueries({ queryKey: ["purchases", roundId] });
      void qc.invalidateQueries({ queryKey: ["wallet", "me"] });
      void qc.invalidateQueries({ queryKey: ["points", "me"] });
    } else {
      hadSocketConnected.current = true;
    }
  }, [connected, roundId, qc]);

  const liveQuery = useQuery({
    queryKey: ["live", liveId],
    queryFn: () => livesApi.get(liveId),
    enabled: !!liveId,
  });

  const viewersQuery = useQuery({
    queryKey: ["live", liveId, "viewers"],
    queryFn: () => livesApi.viewers(liveId),
    enabled: !!liveId && liveQuery.data?.status === "LIVE",
    refetchInterval: 15_000,
  });

  const tokenQuery = useQuery({
    queryKey: ["live", liveId, "token"],
    queryFn: () => livesApi.token(liveId),
    enabled: !!liveId && liveQuery.data?.status === "LIVE",
    retry: 2,
    // Evita refetch que regenera JWT y corta LiveKit (Client initiated disconnect)
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
    refetchInterval: 10000,
  });

  const purchaseMutation = useMutation({
    mutationFn: (buy: PendingBuy) =>
      purchasesApi.create(roundId!, { color: buy.color, quantity: buy.quantity }),
    onSuccess: () => {
      // La notificación bonita llega por socket (purchase:created)
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
  const inventory = inventoryQuery.data ?? [];
  const myPurchases = (purchasesQuery.data ?? []).filter(
    (p: Purchase) => p.userId === userId && p.status === "ACTIVE",
  );
  const isLive = liveQuery.data?.status === "LIVE";
  const purchasesOpen = round?.status === "PURCHASES_OPEN";
  const maxQty = pendingBuy
    ? Math.min(10, Math.max(1, remainingFor(inventory, pendingBuy.color)))
    : 1;

  // Fallback lento: si el socket no trae round:result (desconexión / evento perdido).
  // Espera 2.5s para no pisar el resultado oficial ni mostrar PERDISTE con compras vacías.
  useEffect(() => {
    if (!roundId || round?.status !== "FINISHED" || !round.winnerColor) return;
    if (wasFinishShown(roundId) || shownFinishForRound.current === roundId) return;
    if (!purchasesQuery.isFetched) return;

    const timer = window.setTimeout(() => {
      if (wasFinishShown(roundId) || shownFinishForRound.current === roundId) return;
      shownFinishForRound.current = roundId;
      markFinishShown(roundId);
      const wonQty = myPurchases
        .filter((x) => x.color === round.winnerColor)
        .reduce((acc, x) => acc + x.quantity, 0);
      const pointsEarned = myPurchases.reduce(
        (acc, x) =>
          acc + x.quantity * (x.multiplier || x.pointsMultiplier || 1),
        0,
      );
      setFinishPayload({
        winnerColor: round.winnerColor!,
        prizeCents: wonQty > 0 ? wonQty * (round.prizeCents ?? 0) : 0,
        balanceCents: walletQuery.data?.balanceCents,
        iWon: wonQty > 0,
        wonQty,
        boughtQty: myPurchases.reduce((acc, x) => acc + x.quantity, 0),
        promoQty: myPurchases
          .filter((x) => (x.multiplier ?? 1) > 1)
          .reduce((acc, x) => acc + x.quantity, 0),
        pointsEarned: pointsEarned > 0 ? pointsEarned : undefined,
      });
      setFinishModalOpen(true);
      void qc.invalidateQueries({ queryKey: ["points", "me"] });
      void qc.invalidateQueries({ queryKey: ["wallet", "me"] });
    }, connected ? 2500 : 400);

    return () => window.clearTimeout(timer);
  }, [
    roundId,
    round?.status,
    round?.winnerColor,
    round?.prizeCents,
    walletQuery.data?.balanceCents,
    myPurchases,
    purchasesQuery.isFetched,
    connected,
    qc,
  ]);

  if (!liveId) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="font-bold text-white">Falta el ID de la sala</p>
        <Link to="/entrar" className="mt-3 inline-block text-amber-300 hover:underline">
          Ir a entrar con PIN
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-white/50">
            Sala · {username}
          </p>
          <h1 className="truncate text-lg font-black text-white md:text-xl">
            {liveQuery.data?.title ?? "En vivo"}
          </h1>
        </div>

        <div className="flex max-w-[min(100%,22rem)] flex-wrap items-center justify-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="shrink-0 rounded-full font-black"
            onClick={() => setBoardOpen(true)}
          >
            <Users className="size-4" />
            Mochilas
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0 rounded-full border-amber-400/40 bg-amber-400/10 font-black text-amber-100 hover:bg-amber-400/20"
            onClick={() => setRedeemOpen(true)}
          >
            <Gift className="size-4" />
            Promos
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0 rounded-full border-sky-400/40 bg-sky-400/10 font-black text-sky-100 hover:bg-sky-400/20"
            onClick={() => setHistoryOpen(true)}
          >
            <History className="size-4" />
            Historial
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {walletQuery.data && (
            <WalletBadge
              balanceCents={walletQuery.data.balanceCents}
              visualStatus={visualStatusFromBackend(
                walletQuery.data.visualStatus,
                walletQuery.data.balanceCents,
              )}
              className="border-white/20 bg-black/40 text-white"
            />
          )}
          <LivePresenceBadge
            isLive={isLive}
            viewers={viewersQuery.data?.viewers ?? 0}
            size="sm"
          />
        </div>
      </div>

      {/* Video + chat lado a lado */}
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.65fr)_minmax(260px,0.9fr)] md:items-stretch">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
          <div className="pointer-events-none absolute left-3 top-3 z-10">
            <LivePresenceBadge
              isLive={isLive}
              viewers={viewersQuery.data?.viewers ?? 0}
            />
          </div>
          <div className="absolute right-3 top-3 z-10">
            <span
              className={
                connected
                  ? "rounded-md bg-black/55 px-2 py-1 text-[10px] font-bold text-emerald-300 backdrop-blur-sm"
                  : "rounded-md bg-black/55 px-2 py-1 text-[10px] font-bold text-amber-200 backdrop-blur-sm"
              }
            >
              {connected ? "Conectado" : "Reconectando…"}
            </span>
          </div>
          {tokenQuery.data?.token ? (
            <LiveSubscriber
              token={tokenQuery.data.token}
              serverUrl={tokenQuery.data.url}
            />
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-[#0a0812] px-4 text-center text-sm font-semibold text-white/50">
              {isLive
                ? tokenQuery.isError
                  ? "No se pudo obtener token de video. ¿LiveKit en :7880?"
                  : t("common.loading")
                : "Esperando que el admin inicie el live"}
            </div>
          )}
        </div>

        <LiveChat
          liveId={liveId}
          className="min-h-[280px] md:min-h-[420px] md:h-full"
        />
      </div>

      {!roundId ? (
        <p className="rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-center text-sm font-semibold text-white/60">
          Esperando ronda del anfitrión…
        </p>
      ) : (
        <div className="space-y-3">
          {round && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <RoundStatusBanner
                status={round.status}
                winnerColor={round.winnerColor}
                className="border-white/10 bg-[#16122a] text-white"
              />
              <span
                className={
                  purchasesOpen
                    ? "rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300"
                    : "rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-200"
                }
              >
                {purchasesOpen ? "Toca un color para comprar" : "Compras cerradas"}
              </span>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-[#16122a] p-3 md:p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-wide text-amber-300">
              Colores · toca para pedir
            </p>
            <PlayerColorPicker
              inventory={inventory}
              promos={promosQuery.data ?? []}
              purchasesOpen={purchasesOpen}
              disabled={purchaseMutation.isPending}
              loadingColor={loadingColor}
              onSelect={(color) => setPendingBuy({ color, quantity: 1 })}
            />
            {!purchasesOpen && (
              <p className="mt-3 text-center text-xs font-semibold text-white/45">
                El admin debe abrir compras para que puedas pedir.
              </p>
            )}
            {myPurchases.length > 0 ? (
              <button
                type="button"
                onClick={() => setBoardOpen(true)}
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-bold text-white/70 hover:bg-white/10"
              >
                Tienes {myPurchases.length} compra
                {myPurchases.length === 1 ? "" : "s"} · ver en Mochilas → Mis
                compras
              </button>
            ) : null}
          </div>
        </div>
      )}

      <PlayerBoardModal
        open={boardOpen}
        onOpenChange={setBoardOpen}
        roundId={roundId}
        myPurchases={myPurchases}
      />
      <PlayerRedeemModal open={redeemOpen} onOpenChange={setRedeemOpen} />
      <PlayerHistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        liveId={liveId}
      />

      {/* Modal mínimo: solo cantidad */}
      <Dialog open={!!pendingBuy} onOpenChange={(o) => !o && setPendingBuy(null)}>
        <DialogContent className="max-w-[220px] gap-3 rounded-2xl p-4">
          <DialogHeader>
            <DialogTitle className="text-center text-sm">Cantidad</DialogTitle>
          </DialogHeader>
          {pendingBuy && (
            <div className="flex items-center justify-center gap-3 py-1">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="size-10 text-lg font-black"
                disabled={pendingBuy.quantity <= 1}
                onClick={() =>
                  setPendingBuy((p) =>
                    p ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p,
                  )
                }
              >
                −
              </Button>
              <span className="min-w-10 text-center text-3xl font-black tabular-nums">
                {pendingBuy.quantity}
              </span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="size-10 text-lg font-black"
                disabled={pendingBuy.quantity >= maxQty}
                onClick={() =>
                  setPendingBuy((p) =>
                    p
                      ? { ...p, quantity: Math.min(maxQty, p.quantity + 1) }
                      : p,
                  )
                }
              >
                +
              </Button>
            </div>
          )}
          <DialogFooter className="gap-2 sm:justify-center">
            <Button variant="outline" size="sm" onClick={() => setPendingBuy(null)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={purchaseMutation.isPending || !pendingBuy}
              onClick={() => {
                if (!pendingBuy) return;
                setLoadingColor(pendingBuy.color);
                purchaseMutation.mutate(pendingBuy);
              }}
            >
              {purchaseMutation.isPending ? t("common.loading") : "Comprar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {finishPayload && (
        <RoundResultOverlay
          open={finishModalOpen}
          onClose={() => setFinishModalOpen(false)}
          winnerColor={finishPayload.winnerColor}
          iWon={finishPayload.iWon}
          wonQty={finishPayload.wonQty}
          prizeCents={finishPayload.prizeCents}
          pointsEarned={finishPayload.pointsEarned}
          boughtQty={finishPayload.boughtQty}
          promoQty={finishPayload.promoQty}
          balanceCents={
            finishPayload.balanceCents ?? walletQuery.data?.balanceCents
          }
        />
      )}
    </div>
  );
}
