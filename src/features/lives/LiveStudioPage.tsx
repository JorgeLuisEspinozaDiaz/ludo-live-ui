import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Copy,
  Gift,
  History,
  MessageCircle,
  Package,
  Play,
  Radio,
  Square,
  Users,
} from "lucide-react";
import {
  gameConfigApi,
  livesApi,
  promosApi,
  roundsApi,
} from "@/api/resources";
import { LivePublisher } from "@/livekit/LivePublisher";
import { useSocket } from "@/realtime/SocketProvider";
import { useSocketEvent } from "@/realtime/useSocketEvent";
import { RoundStatusBanner } from "@/components/game/RoundStatusBanner";
import { ColorChip } from "@/components/game/ColorChip";
import {
  LUDO_COLORS,
  COLOR_TOKENS,
  isLudoColor,
  type LudoColor,
} from "@/lib/colors";
import { getErrorMessage } from "@/lib/errors";
import { t } from "@/i18n/es";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getStoredRoundId, setStoredRoundId } from "./live-round-storage";
import { absoluteAppUrl, pinJoinPath } from "@/lib/player-links";
import { StudioSalaPanel } from "./StudioSalaPanel";
import { StudioRoundBoard } from "./StudioRoundBoard";
import { StudioWinnerBanner } from "./StudioWinnerBanner";
import { StudioHistoryPanel } from "./StudioHistoryPanel";
import { FloatingPanel } from "@/components/FloatingPanel";
import { LiveChat } from "@/components/live/LiveChat";
import { LivePresenceBadge } from "@/components/live/LivePresenceBadge";
import { useChatStore, type ChatMessage } from "@/realtime/chat-store";

type StudioTab = "ronda" | "inventario" | "promos" | "sala" | "historial";

type LastWinner = {
  color: LudoColor;
  at: Date;
  roundId: string;
};

function StudioChatInbox({ liveId }: { liveId: string }) {
  const push = useChatStore((s) => s.push);
  useSocketEvent<ChatMessage>("chat:message", (msg) => {
    if (msg.liveId === liveId) push(msg);
  });
  return null;
}

function playerPinUrl(liveId: string) {
  return absoluteAppUrl(pinJoinPath(liveId));
}

async function copyOneClick(label: string, text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  } catch {
    toast.message(label, { description: text });
  }
}

export default function LiveStudioPage() {
  const { liveId = "" } = useParams<{ liveId: string }>();
  const qc = useQueryClient();
  const { joinLive, leaveLive, connected } = useSocket();

  const [roundId, setRoundId] = useState<string | null>(() =>
    liveId ? getStoredRoundId(liveId) : null,
  );
  const [winnerStep, setWinnerStep] = useState<0 | 1>(0);
  const [winnerColor, setWinnerColor] = useState<LudoColor | null>(null);
  const [promoColor, setPromoColor] = useState<LudoColor>("ROJO");
  const [promoSlots, setPromoSlots] = useState("5");
  const [promoMultiplier, setPromoMultiplier] = useState("2");
  const [usersOpen, setUsersOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [tab, setTab] = useState<StudioTab>("ronda");
  const [lastWinner, setLastWinner] = useState<LastWinner | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

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

  useSocketEvent<{
    roundId: string;
    winnerColor: LudoColor;
    prizeCents?: number;
  }>("round:finished", (p) => {
    if (!isLudoColor(p.winnerColor)) return;
    setLastWinner({ color: p.winnerColor, at: new Date(), roundId: p.roundId });
    setShowWinnerModal(true);
    setWinnerStep(0);
    setWinnerColor(null);
    void qc.invalidateQueries({ queryKey: ["round", p.roundId] });
    void qc.invalidateQueries({ queryKey: ["history", "studio", liveId] });
    void qc.invalidateQueries({ queryKey: ["purchases", p.roundId] });
    void qc.invalidateQueries({ queryKey: ["round", p.roundId, "wallets"] });
  });

  const liveQuery = useQuery({
    queryKey: ["live", liveId],
    queryFn: () => livesApi.get(liveId),
    enabled: !!liveId,
  });

  const viewersQuery = useQuery({
    queryKey: ["live", liveId, "viewers"],
    queryFn: () => livesApi.viewers(liveId),
    enabled: !!liveId && liveQuery.data?.status === "LIVE",
    refetchInterval: 12_000,
  });

  const tokenQuery = useQuery({
    queryKey: ["live", liveId, "token"],
    queryFn: () => livesApi.token(liveId),
    enabled: !!liveId && liveQuery.data?.status === "LIVE",
    staleTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const configQuery = useQuery({
    queryKey: ["game-config"],
    queryFn: () => gameConfigApi.get(),
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

  const invalidateRound = useCallback(() => {
    if (!roundId) return;
    void qc.invalidateQueries({ queryKey: ["round", roundId] });
    void qc.invalidateQueries({ queryKey: ["inventory", roundId] });
    void qc.invalidateQueries({ queryKey: ["promos", roundId] });
    void qc.invalidateQueries({ queryKey: ["purchases", roundId] });
    void qc.invalidateQueries({ queryKey: ["round", roundId, "wallets"] });
  }, [qc, roundId]);

  const startLiveMutation = useMutation({
    mutationFn: () => {
      if (!liveId) throw new Error("Falta el ID de la transmisión en la URL");
      return livesApi.start(liveId);
    },
    onSuccess: () => {
      toast.success(t("toasts.liveStarted"));
      void qc.invalidateQueries({ queryKey: ["live", liveId] });
      void qc.invalidateQueries({ queryKey: ["live", liveId, "token"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const endLiveMutation = useMutation({
    mutationFn: () => {
      if (!liveId) throw new Error("Falta el ID de la transmisión en la URL");
      return livesApi.end(liveId);
    },
    onSuccess: () => {
      toast.success(t("toasts.liveEnded"));
      void qc.invalidateQueries({ queryKey: ["live", liveId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const createRoundMutation = useMutation({
    mutationFn: () => {
      if (!liveId) throw new Error("Falta el ID de la transmisión en la URL");
      const cfg = configQuery.data;
      return roundsApi.create(liveId, {
        priceCents: cfg?.priceCents,
        prizeCents: cfg?.prizeCents,
        slotsPerColor: cfg?.slotsPerColor,
      });
    },
    onSuccess: (round) => {
      setRoundId(round.id);
      setStoredRoundId(liveId, round.id);
      setTab("ronda");
      toast.success("Ronda creada");
      invalidateRound();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const openMutation = useMutation({
    mutationFn: () => roundsApi.openPurchases(roundId!),
    onSuccess: () => {
      toast.success(t("toasts.purchasesOpened"));
      invalidateRound();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const closeMutation = useMutation({
    mutationFn: () => roundsApi.closePurchases(roundId!),
    onSuccess: () => {
      toast.success(t("toasts.purchasesClosed"));
      invalidateRound();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const finishMutation = useMutation({
    mutationFn: (color: LudoColor) => roundsApi.finish(roundId!, color),
    onSuccess: (_data, color) => {
      toast.success(`Ronda terminada · ganó ${COLOR_TOKENS[color].label}`);
      setLastWinner({ color, at: new Date(), roundId: roundId! });
      setShowWinnerModal(true);
      setWinnerStep(0);
      setWinnerColor(null);
      invalidateRound();
      void qc.invalidateQueries({ queryKey: ["history", "studio", liveId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const createPromoMutation = useMutation({
    mutationFn: () =>
      promosApi.create(roundId!, {
        color: promoColor,
        slots: Math.trunc(Number(promoSlots)),
        multiplier: Math.trunc(Number(promoMultiplier)),
      }),
    onSuccess: () => {
      toast.success("Promo creada");
      void qc.invalidateQueries({ queryKey: ["promos", roundId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deactivatePromoMutation = useMutation({
    mutationFn: (promoId: string) => promosApi.update(promoId, { active: false }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["promos", roundId] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const live = liveQuery.data;
  const round = roundQuery.data;
  const isLive = live?.status === "LIVE";
  const purchasesOpen = round?.status === "PURCHASES_OPEN";
  const canTogglePurchases =
    !!roundId &&
    (round?.status === "CREATED" ||
      round?.status === "PURCHASES_OPEN" ||
      round?.status === "PURCHASES_CLOSED");
  const anyMutating =
    startLiveMutation.isPending ||
    endLiveMutation.isPending ||
    createRoundMutation.isPending ||
    openMutation.isPending ||
    closeMutation.isPending ||
    finishMutation.isPending ||
    createPromoMutation.isPending ||
    deactivatePromoMutation.isPending;

  const togglePurchases = () => {
    if (!roundId || !round) return;
    if (round.status === "PURCHASES_OPEN") closeMutation.mutate();
    else if (round.status === "CREATED" || round.status === "PURCHASES_CLOSED") {
      openMutation.mutate();
    }
  };

  if (!liveId) {
    return (
      <div className="mx-auto max-w-lg space-y-3 rounded-2xl border border-border bg-white p-6">
        <p className="font-black">Falta el ID de la transmisión</p>
        <Button asChild variant="outline">
          <Link to="/lives">Ir a transmisiones</Link>
        </Button>
      </div>
    );
  }

  const tabs: { id: StudioTab; label: string; icon: typeof Radio }[] = [
    { id: "ronda", label: "Ronda", icon: Radio },
    { id: "inventario", label: "Cupos", icon: Package },
    { id: "promos", label: "Promos", icon: Gift },
    { id: "historial", label: "Historial", icon: History },
    { id: "sala", label: "Sala", icon: Users },
  ];

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-[560px] flex-col gap-2">
      <StudioChatInbox liveId={liveId} />

      {/* Barra superior compacta */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2 shadow-sm">
        <Link
          to="/lives"
          className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Transmisiones</span>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-black leading-tight">
            {live?.title ?? "Estudio"}
          </p>
        </div>
        <LivePresenceBadge
          isLive={isLive}
          viewers={viewersQuery.data?.viewers ?? 0}
          tone="light"
          size="sm"
        />
        <Badge variant={connected ? "success" : "secondary"} className="hidden sm:inline-flex">
          Socket {connected ? "OK" : "…"}
        </Badge>
        {!isLive ? (
          <Button
            size="sm"
            className="font-black"
            disabled={startLiveMutation.isPending || anyMutating}
            onClick={() => startLiveMutation.mutate()}
          >
            <Play className="size-4" />
            {live?.status === "ENDED" ? "Reabrir live" : "Iniciar live"}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="destructive"
            disabled={endLiveMutation.isPending || anyMutating}
            onClick={() => endLiveMutation.mutate()}
          >
            <Square className="size-3.5" />
            Finalizar live
          </Button>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void copyOneClick("Link genérico", playerPinUrl(liveId))}
        >
          <Copy className="size-3.5" />
          Link
        </Button>
        <Button
          type="button"
          size="sm"
          variant={usersOpen ? "secondary" : "outline"}
          onClick={() => setUsersOpen(true)}
        >
          <Users className="size-3.5" />
          PIN
        </Button>
        <Button
          type="button"
          size="sm"
          variant={chatOpen ? "secondary" : "outline"}
          onClick={() => setChatOpen(true)}
        >
          <MessageCircle className="size-3.5" />
          Chat
        </Button>
        <span className="mx-1 hidden h-5 w-px bg-border sm:inline-block" />
        {!roundId ? (
          <Button
            size="sm"
            variant="secondary"
            disabled={createRoundMutation.isPending || !configQuery.data}
            onClick={() => createRoundMutation.mutate()}
          >
            Nueva ronda
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              variant={purchasesOpen ? "outline" : "secondary"}
              disabled={
                !canTogglePurchases ||
                openMutation.isPending ||
                closeMutation.isPending
              }
              onClick={togglePurchases}
            >
              {purchasesOpen ? "Cerrar compras" : "Abrir compras"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={createRoundMutation.isPending || !configQuery.data}
              onClick={() => createRoundMutation.mutate()}
            >
              Nueva ronda
            </Button>
          </>
        )}
      </div>

      {/* Escenario + panel lateral */}
      <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-sm font-black">Escenario</p>
            <p className="text-xs font-semibold text-muted">
              Pantalla · cámara · mic
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-2">
            <LivePublisher
              token={tokenQuery.data?.token}
              serverUrl={tokenQuery.data?.url}
            />
          </div>
        </section>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex gap-1 overflow-x-auto border-b border-border p-1.5">
            {tabs.map((item) => {
              const Icon = item.icon;
              const disabled = item.id !== "ronda" && !roundId;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-black transition",
                    tab === item.id
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-muted-bg",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  <Icon className="size-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {tab === "ronda" && (
              <div className="space-y-3">
                {!roundId || !round ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted-bg/60 px-3 py-6 text-center">
                    <p className="text-sm font-bold text-muted">
                      Crea una ronda para abrir compras y declarar ganador.
                    </p>
                    <Button
                      className="mt-3"
                      size="sm"
                      disabled={createRoundMutation.isPending || !configQuery.data}
                      onClick={() => createRoundMutation.mutate()}
                    >
                      Nueva ronda
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted-bg px-3 py-2">
                      <RoundStatusBanner
                        status={round.status}
                        winnerColor={round.winnerColor}
                        className="border-0 bg-transparent p-0 shadow-none"
                      />
                      <Badge variant={purchasesOpen ? "success" : "warning"}>
                        {purchasesOpen ? "Compras abiertas" : "Compras cerradas"}
                      </Badge>
                    </div>

                    {round.status === "FINISHED" && round.winnerColor && (
                      <div className="rounded-2xl border border-amber-300 bg-amber-50 px-3 py-3">
                        <p className="text-[11px] font-black uppercase tracking-wide text-amber-800/70">
                          Último resultado
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <ColorChip color={round.winnerColor} size="md" />
                          <div>
                            <p className="text-base font-black">
                              Ganó {COLOR_TOKENS[round.winnerColor].label}
                            </p>
                            <p className="text-xs font-semibold text-muted">
                              {(lastWinner?.roundId === round.id
                                ? lastWinner.at
                                : round.finishedAt
                                  ? new Date(round.finishedAt)
                                  : null
                              )?.toLocaleString("es-PE", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              }) ?? "Ronda finalizada"}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-auto"
                            onClick={() => setTab("historial")}
                          >
                            Ver historial
                          </Button>
                        </div>
                      </div>
                    )}

                    {(round.status === "PURCHASES_CLOSED" ||
                      round.status === "PURCHASES_OPEN") && (
                      <div className="space-y-2 rounded-xl border border-border p-3">
                        <p className="text-sm font-black">Declarar ganador</p>
                        {round.status === "PURCHASES_OPEN" ? (
                          <p className="text-xs font-semibold text-muted">
                            Cierra compras antes de confirmar el color.
                          </p>
                        ) : winnerStep === 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {LUDO_COLORS.map((c) => (
                              <Button
                                key={c}
                                size="sm"
                                variant={winnerColor === c ? "default" : "outline"}
                                onClick={() => {
                                  setWinnerColor(c);
                                  setWinnerStep(1);
                                }}
                              >
                                <ColorChip color={c} size="sm" />
                              </Button>
                            ))}
                          </div>
                        ) : (
                          winnerColor && (
                            <div className="flex flex-wrap items-center gap-2">
                              <ColorChip color={winnerColor} size="lg" />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setWinnerStep(0)}
                              >
                                Atrás
                              </Button>
                              <Button
                                size="sm"
                                disabled={finishMutation.isPending}
                                onClick={() => finishMutation.mutate(winnerColor)}
                              >
                                Confirmar
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    <StudioRoundBoard roundId={roundId} compact />
                  </>
                )}
              </div>
            )}

            {tab === "inventario" && roundId && (
              <div className="grid gap-2 sm:grid-cols-2">
                {(inventoryQuery.data ?? []).map((row) => {
                  const pct =
                    row.capacity > 0
                      ? Math.min(100, (row.sold / row.capacity) * 100)
                      : 0;
                  return (
                    <div
                      key={row.color}
                      className="space-y-1.5 rounded-xl border border-border px-3 py-2"
                    >
                      <div className="flex justify-between text-sm font-bold">
                        <ColorChip color={row.color} size="sm" />
                        <span>
                          {row.sold}/{row.capacity}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted-bg">
                        <div
                          className={`h-full ${COLOR_TOKENS[row.color].swatch}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "promos" && roundId && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted">
                  1 casilla = 1 punto. La promo multiplica solo los puntos de las
                  primeras casillas de ese color.
                </p>
                <div className="grid gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="promo-color">Color</Label>
                    <select
                      id="promo-color"
                      className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm font-bold"
                      value={promoColor}
                      onChange={(e) => setPromoColor(e.target.value as LudoColor)}
                    >
                      {LUDO_COLORS.map((c) => (
                        <option key={c} value={c}>
                          {COLOR_TOKENS[c].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="promo-slots">Casillas</Label>
                      <Input
                        id="promo-slots"
                        type="number"
                        min={1}
                        value={promoSlots}
                        onChange={(e) => setPromoSlots(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="promo-multiplier">× puntos</Label>
                      <Input
                        id="promo-multiplier"
                        type="number"
                        min={2}
                        value={promoMultiplier}
                        onChange={(e) => setPromoMultiplier(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[2, 3, 5, 7, 10].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPromoMultiplier(String(m))}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs font-black",
                        Number(promoMultiplier) === m
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-white hover:bg-muted-bg",
                      )}
                    >
                      ×{m}
                    </button>
                  ))}
                </div>
                {Number(promoSlots) > 0 && Number(promoMultiplier) > 1 && (
                  <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-[#5c4636]">
                    Primeras <strong>{Math.trunc(Number(promoSlots))}</strong> de{" "}
                    <strong>{COLOR_TOKENS[promoColor].label}</strong> →{" "}
                    <strong>×{Math.trunc(Number(promoMultiplier))}</strong> puntos
                  </p>
                )}
                <Button
                  className="w-full"
                  disabled={
                    createPromoMutation.isPending ||
                    !(Number(promoSlots) > 0) ||
                    !(Number(promoMultiplier) > 1)
                  }
                  onClick={() => createPromoMutation.mutate()}
                >
                  Activar promo
                </Button>
                <ul className="space-y-2">
                  {(promosQuery.data ?? []).length === 0 && (
                    <li className="text-xs text-muted">Sin promos aún.</li>
                  )}
                  {(promosQuery.data ?? []).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border px-2.5 py-2 text-sm"
                    >
                      <span className="flex flex-wrap items-center gap-1.5 font-semibold">
                        <ColorChip color={p.color} size="sm" />
                        ×{p.multiplier}
                        <span className="text-muted">
                          {p.sold}/{p.slots}
                        </span>
                        <Badge variant={p.active ? "success" : "secondary"}>
                          {p.active ? "Activa" : "Off"}
                        </Badge>
                      </span>
                      {p.active && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={deactivatePromoMutation.isPending}
                          onClick={() => deactivatePromoMutation.mutate(p.id)}
                        >
                          Off
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === "historial" && (
              <StudioHistoryPanel liveId={liveId} />
            )}

            {tab === "sala" && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted">
                  PIN y jugadores. También puedes abrir el panel flotante PIN.
                </p>
                <StudioSalaPanel liveId={liveId} />
              </div>
            )}
          </div>
        </aside>
      </div>

      {showWinnerModal && lastWinner && (
        <StudioWinnerBanner
          winnerColor={lastWinner.color}
          finishedAt={lastWinner.at}
          onClose={() => setShowWinnerModal(false)}
        />
      )}

      <FloatingPanel
        title="Usuarios y PIN"
        open={usersOpen}
        onClose={() => setUsersOpen(false)}
        initial={{
          x: typeof window !== "undefined" ? window.innerWidth - 400 : 40,
          y: 100,
          w: 380,
          h: 520,
        }}
      >
        <StudioSalaPanel liveId={liveId} />
      </FloatingPanel>

      <FloatingPanel
        title="Chat en vivo"
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        initial={{ x: 24, y: 110, w: 360, h: 460 }}
      >
        <LiveChat
          liveId={liveId}
          variant="light"
          manageRoom={false}
          className="h-full rounded-none border-0"
        />
      </FloatingPanel>
    </div>
  );
}
