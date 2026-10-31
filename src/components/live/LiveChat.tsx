import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useSocket } from "@/realtime/SocketProvider";
import { useSocketEvent } from "@/realtime/useSocketEvent";
import {
  EMPTY_CHAT,
  useChatStore,
  type ChatMessage,
} from "@/realtime/chat-store";
import { useSessionStore } from "@/auth/session-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REACTIONS = ["👏", "🔥", "🎲", "💖"] as const;

type LiveChatProps = {
  liveId: string;
  className?: string;
  compact?: boolean;
  variant?: "dark" | "light";
  /** Si false, no hace join/leave (la página ya gestiona la sala). */
  manageRoom?: boolean;
};

export function LiveChat({
  liveId,
  className,
  compact,
  variant = "dark",
  manageRoom = true,
}: LiveChatProps) {
  const light = variant === "light";
  const { socket, connected, joinLive, leaveLive } = useSocket();
  const me = useSessionStore((s) => s.user);
  const messages = useChatStore((s) => s.byLive[liveId] ?? EMPTY_CHAT);
  const push = useChatStore((s) => s.push);
  const pushOptimistic = useChatStore((s) => s.pushOptimistic);
  const replaceLocal = useChatStore((s) => s.replaceLocal);
  const dropLocal = useChatStore((s) => s.dropLocal);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!manageRoom || !liveId) return;
    joinLive(liveId);
    return () => leaveLive(liveId);
  }, [liveId, joinLive, leaveLive, manageRoom]);

  useSocketEvent<ChatMessage>("chat:message", (msg) => {
    if (msg.liveId !== liveId) return;
    push(msg);
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !socket || !liveId || !me) return;
    if (!connected) {
      toast.error("Sin conexión al chat. Reintenta en un momento.");
      return;
    }

    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      liveId,
      userId: me.id,
      username: me.username,
      text: trimmed,
      at: new Date().toISOString(),
    };
    pushOptimistic(optimistic);
    setText("");

    socket.emit(
      "chat:send",
      { liveId, text: trimmed },
      (res?: { ok?: boolean; error?: string; message?: ChatMessage }) => {
        if (res?.ok === false || res?.error) {
          dropLocal(liveId, optimistic.id);
          toast.error(
            res.error === "Forbidden"
              ? "No tienes permiso para chatear en esta sala"
              : "No se pudo enviar el mensaje",
          );
          return;
        }
        if (res?.message) {
          replaceLocal(liveId, optimistic.id, res.message);
        }
      },
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border",
        light
          ? "border-border bg-card text-foreground"
          : "border-white/10 bg-[#16122a]",
        compact ? "h-72" : "h-full min-h-[280px]",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2.5",
          light ? "border-b border-border" : "border-b border-white/10",
        )}
      >
        <p className={cn("text-sm font-black", light ? "text-foreground" : "text-white")}>
          Chat en vivo
        </p>
        <span
          className={cn(
            "text-[11px] font-bold",
            connected
              ? light
                ? "text-emerald-700"
                : "text-emerald-400"
              : light
                ? "text-rose-700"
                : "text-rose-300",
          )}
        >
          ● {connected ? "conectado" : "sin conexión"}
        </span>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <p
            className={cn(
              "text-center text-xs font-semibold",
              light ? "text-muted" : "text-white/45",
            )}
          >
            Sé el primero en escribir…
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.userId === me?.id;
            return (
              <div key={m.id} className={cn("flex gap-2", mine && "justify-end")}>
                {!mine && (
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[11px] font-black text-white">
                    {(m.username?.[0] ?? "?").toUpperCase()}
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2",
                    mine
                      ? "bg-primary text-primary-foreground"
                      : light
                        ? "bg-muted-bg text-foreground"
                        : "bg-white/8 text-white",
                  )}
                >
                  {!mine && (
                    <p
                      className={cn(
                        "text-[11px] font-black",
                        light ? "text-primary" : "text-amber-300",
                      )}
                    >
                      {m.username}
                    </p>
                  )}
                  <p className="text-sm font-semibold leading-snug">{m.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div
        className={cn(
          "space-y-2 p-2.5",
          light ? "border-t border-border" : "border-t border-white/10",
        )}
      >
        <div className="flex gap-1.5">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={cn(
                "rounded-lg px-2 py-1 text-sm",
                light ? "bg-muted-bg hover:bg-border" : "bg-white/5 hover:bg-white/10",
              )}
              onClick={() => send(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un mensaje…"
            maxLength={280}
            className={cn(
              "h-10 flex-1 rounded-xl border px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/35",
              light
                ? "border-border bg-white text-foreground placeholder:text-muted"
                : "auth-dark-input border-white/15 bg-[#0d0a18]",
            )}
          />
          <Button
            type="submit"
            size="icon"
            className="size-10 shrink-0 rounded-xl"
            disabled={!text.trim() || !connected}
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
