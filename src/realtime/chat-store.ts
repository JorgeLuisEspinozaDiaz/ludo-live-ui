import { create } from "zustand";

export type ChatMessage = {
  id: string;
  liveId: string;
  userId: string;
  username: string;
  text: string;
  at: string;
};

type ChatState = {
  byLive: Record<string, ChatMessage[]>;
  push: (msg: ChatMessage) => void;
  pushOptimistic: (msg: ChatMessage) => void;
  replaceLocal: (liveId: string, localId: string, msg: ChatMessage) => void;
  dropLocal: (liveId: string, localId: string) => void;
};

const MAX = 200;

/** Referencia estable: evita bucle infinito con `?? []` en selectores Zustand. */
export const EMPTY_CHAT: ChatMessage[] = [];

function uniquePush(list: ChatMessage[], msg: ChatMessage): ChatMessage[] {
  if (list.some((m) => m.id === msg.id)) return list;
  // Si llega echo del servidor, quitar optimista con mismo texto/usuario
  const cleaned = msg.id.startsWith("local-")
    ? list
    : list.filter(
        (m) =>
          !(
            m.id.startsWith("local-") &&
            m.userId === msg.userId &&
            m.text === msg.text
          ),
      );
  if (cleaned.some((m) => m.id === msg.id)) return cleaned;
  return [...cleaned.slice(-(MAX - 1)), msg];
}

export const useChatStore = create<ChatState>((set) => ({
  byLive: {},
  push: (msg) =>
    set((s) => ({
      byLive: {
        ...s.byLive,
        [msg.liveId]: uniquePush(s.byLive[msg.liveId] ?? [], msg),
      },
    })),
  pushOptimistic: (msg) =>
    set((s) => ({
      byLive: {
        ...s.byLive,
        [msg.liveId]: uniquePush(s.byLive[msg.liveId] ?? [], msg),
      },
    })),
  replaceLocal: (liveId, localId, msg) =>
    set((s) => {
      const prev = s.byLive[liveId] ?? [];
      const without = prev.filter((m) => m.id !== localId);
      return {
        byLive: { ...s.byLive, [liveId]: uniquePush(without, msg) },
      };
    }),
  dropLocal: (liveId, localId) =>
    set((s) => ({
      byLive: {
        ...s.byLive,
        [liveId]: (s.byLive[liveId] ?? []).filter((m) => m.id !== localId),
      },
    })),
}));
