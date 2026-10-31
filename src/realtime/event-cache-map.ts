import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { t } from "@/i18n/es";
import type {
  ColorStock,
  Live,
  PointsWallet,
  Promo,
  Round,
  WalletPublic,
} from "@/api/resources";
import type { LudoColor } from "@/lib/colors";
import { COLOR_HEX, COLOR_TOKENS, isLudoColor } from "@/lib/colors";

export const REALTIME_EVENTS = [
  "live:started",
  "live:ended",
  "live:presence",
  "round:created",
  "round:purchases_opened",
  "round:purchases_closed",
  "round:finished",
  "round:result",
  "purchase:created",
  "purchase:cancelled",
  "inventory:updated",
  "promo:activated",
  "promo:deactivated",
  "wallet:updated",
] as const;

export type RealtimeEventName = (typeof REALTIME_EVENTS)[number];

export type RealtimePayloadMap = {
  "live:started": { liveId: string };
  "live:ended": { liveId: string };
  "live:presence": {
    liveId: string;
    userId: string;
    username?: string;
    status: "joined" | "left";
    viewers?: number;
  };
  "round:created": { roundId: string; liveId: string };
  "round:purchases_opened": { roundId: string };
  "round:purchases_closed": { roundId: string };
  "round:finished": {
    roundId: string;
    winnerColor: LudoColor;
    prizeCents?: number;
  };
  "round:result": {
    roundId: string;
    winnerColor: LudoColor;
    iWon: boolean;
    wonQty: number;
    prizeCents?: number;
    pointsEarned?: number;
    balanceCents?: number | null;
    pointsBalance?: number;
  };
  "purchase:created": {
    purchaseId: string;
    roundId: string;
    userId: string;
    username?: string;
    color: LudoColor;
    quantity: number;
  };
  "purchase:cancelled": { purchaseId: string; roundId: string; userId?: string };
  "inventory:updated": {
    roundId: string;
    color?: LudoColor;
    sold?: number;
    capacity?: number;
  };
  "promo:activated": {
    promoId: string;
    roundId: string;
    color?: LudoColor;
    multiplier?: number;
  };
  "promo:deactivated": { promoId: string; roundId: string };
  "wallet:updated": Partial<WalletPublic> & {
    roundId?: string;
    balanceCents?: number;
    pointsBalance?: number;
  };
};

function patchRoundStatus(
  queryClient: QueryClient,
  roundId: string,
  status: Round["status"],
) {
  queryClient.setQueryData<Round>(["round", roundId], (prev) =>
    prev ? { ...prev, status } : prev,
  );
}

function patchInventoryColor(
  queryClient: QueryClient,
  roundId: string,
  color: LudoColor,
  sold: number,
  capacity: number,
) {
  queryClient.setQueryData<ColorStock[]>(["inventory", roundId], (prev) => {
    if (!prev?.length) return prev;
    return prev.map((row) =>
      row.color === color
        ? {
            ...row,
            sold,
            capacity,
            remaining: Math.max(0, capacity - sold),
          }
        : row,
    );
  });
}

function showEventToast(event: RealtimeEventName, payload: unknown) {
  switch (event) {
    case "round:purchases_opened":
      toast.info(t("toasts.purchasesOpened"));
      break;
    case "round:purchases_closed":
      toast.info(t("toasts.purchasesClosed"));
      break;
    case "purchase:created": {
      const p = payload as RealtimePayloadMap["purchase:created"];
      const who = p.username?.trim() || "Alguien";
      const colorOk = p.color && isLudoColor(p.color) ? p.color : null;
      const colorLabel = colorOk
        ? COLOR_TOKENS[colorOk].label
        : String(p.color ?? "");
      const hex = colorOk ? COLOR_HEX[colorOk] : null;
      toast(`${who} compró ${colorLabel} ×${p.quantity}`, {
        duration: 4000,
        className: "font-black border-0",
        style: hex
          ? {
              background: hex.bg,
              color: hex.fg,
              border: "none",
            }
          : undefined,
      });
      break;
    }
    case "round:finished": {
      const p = payload as RealtimePayloadMap["round:finished"];
      const colorLabel =
        p.winnerColor && isLudoColor(p.winnerColor)
          ? COLOR_TOKENS[p.winnerColor].label
          : p.winnerColor;
      toast.success(
        t("round.finished") +
          (colorLabel ? ` — ${t("round.winner", { color: colorLabel })}` : ""),
      );
      break;
    }
    default:
      break;
  }
}

export function applyRealtimeEvent<E extends RealtimeEventName>(
  queryClient: QueryClient,
  event: E,
  payload: RealtimePayloadMap[E],
) {
  switch (event) {
    case "live:started":
    case "live:ended": {
      const { liveId } = payload as RealtimePayloadMap["live:started"];
      queryClient.invalidateQueries({ queryKey: ["lives"] });
      queryClient.invalidateQueries({ queryKey: ["live", liveId] });
      queryClient.setQueryData<Live>(["live", liveId], (prev) =>
        prev
          ? {
              ...prev,
              status: event === "live:started" ? "LIVE" : "ENDED",
            }
          : prev,
      );
      break;
    }
    case "live:presence": {
      const p = payload as RealtimePayloadMap["live:presence"];
      if (typeof p.viewers === "number") {
        queryClient.setQueryData<{ liveId: string; viewers: number }>(
          ["live", p.liveId, "viewers"],
          { liveId: p.liveId, viewers: p.viewers },
        );
      } else {
        queryClient.invalidateQueries({
          queryKey: ["live", p.liveId, "viewers"],
        });
      }
      queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === "round" &&
          q.queryKey[2] === "wallets",
      });
      break;
    }
    case "round:created": {
      const { roundId, liveId } = payload as RealtimePayloadMap["round:created"];
      queryClient.invalidateQueries({ queryKey: ["live", liveId, "rounds"] });
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
      break;
    }
    case "round:purchases_opened": {
      const { roundId } = payload as RealtimePayloadMap["round:purchases_opened"];
      patchRoundStatus(queryClient, roundId, "PURCHASES_OPEN");
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
      break;
    }
    case "round:purchases_closed": {
      const { roundId } = payload as RealtimePayloadMap["round:purchases_closed"];
      patchRoundStatus(queryClient, roundId, "PURCHASES_CLOSED");
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
      break;
    }
    case "round:finished": {
      const { roundId, winnerColor } = payload as RealtimePayloadMap["round:finished"];
      queryClient.setQueryData<Round>(["round", roundId], (prev) =>
        prev ? { ...prev, status: "FINISHED", winnerColor } : prev,
      );
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
      queryClient.invalidateQueries({ queryKey: ["purchases", roundId] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "me"] });
      queryClient.invalidateQueries({ queryKey: ["points", "me"] });
      queryClient.invalidateQueries({ queryKey: ["round", roundId, "wallets"] });
      break;
    }
    case "round:result": {
      const p = payload as RealtimePayloadMap["round:result"];
      if (typeof p.balanceCents === "number") {
        queryClient.setQueryData<WalletPublic>(["wallet", "me"], (prev) =>
          prev
            ? { ...prev, balanceCents: p.balanceCents! }
            : prev,
        );
      }
      if (typeof p.pointsBalance === "number") {
        queryClient.setQueryData<PointsWallet>(["points", "me"], (prev) =>
          prev
            ? { ...prev, balance: p.pointsBalance! }
            : { id: "me", userId: "me", balance: p.pointsBalance! },
        );
      }
      queryClient.invalidateQueries({ queryKey: ["wallet", "me"] });
      queryClient.invalidateQueries({ queryKey: ["points", "me"] });
      queryClient.invalidateQueries({ queryKey: ["purchases", p.roundId] });
      queryClient.invalidateQueries({ queryKey: ["round", p.roundId] });
      queryClient.invalidateQueries({ queryKey: ["round", p.roundId, "wallets"] });
      break;
    }
    case "purchase:created":
    case "purchase:cancelled": {
      const { roundId } = payload as
        | RealtimePayloadMap["purchase:created"]
        | RealtimePayloadMap["purchase:cancelled"];
      queryClient.invalidateQueries({ queryKey: ["purchases", roundId] });
      queryClient.invalidateQueries({ queryKey: ["inventory", roundId] });
      queryClient.invalidateQueries({ queryKey: ["round", roundId, "wallets"] });
      break;
    }
    case "inventory:updated": {
      const p = payload as RealtimePayloadMap["inventory:updated"];
      if (
        p.color &&
        typeof p.sold === "number" &&
        typeof p.capacity === "number"
      ) {
        patchInventoryColor(queryClient, p.roundId, p.color, p.sold, p.capacity);
      }
      queryClient.invalidateQueries({ queryKey: ["inventory", p.roundId] });
      break;
    }
    case "promo:activated":
    case "promo:deactivated": {
      const p = payload as
        | RealtimePayloadMap["promo:activated"]
        | RealtimePayloadMap["promo:deactivated"];
      queryClient.invalidateQueries({ queryKey: ["promos", p.roundId] });
      queryClient.setQueryData<Promo[]>(["promos", p.roundId], (prev) => {
        if (!prev) return prev;
        const active = event === "promo:activated";
        return prev.map((promo) =>
          promo.id === p.promoId ? { ...promo, active } : promo,
        );
      });
      break;
    }
    case "wallet:updated": {
      const p = payload as RealtimePayloadMap["wallet:updated"];
      if (p.balanceCents !== undefined) {
        queryClient.setQueryData<WalletPublic>(["wallet", "me"], (prev) =>
          prev ? { ...prev, balanceCents: p.balanceCents! } : prev,
        );
      }
      if (typeof p.pointsBalance === "number") {
        queryClient.setQueryData<PointsWallet>(["points", "me"], (prev) =>
          prev
            ? { ...prev, balance: p.pointsBalance! }
            : { id: "me", userId: "me", balance: p.pointsBalance! },
        );
      }
      queryClient.invalidateQueries({ queryKey: ["wallet", "me"] });
      queryClient.invalidateQueries({ queryKey: ["points", "me"] });
      if (p.roundId) {
        queryClient.invalidateQueries({ queryKey: ["round", p.roundId, "wallets"] });
      }
      break;
    }
    default:
      break;
  }

  showEventToast(event, payload);
}
