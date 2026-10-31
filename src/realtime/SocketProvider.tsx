import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import axios from "axios";
import { getAccessToken, useSessionStore } from "@/auth/session-store";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3005";
const SOCKET_BASE =
  import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || API_BASE;

async function renewAccessToken(): Promise<string | null> {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const { data } = await axios.post<{ access_token: string }>(
      `${API_BASE}/auth/refresh`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    useSessionStore.getState().setAccessToken(data.access_token);
    return data.access_token;
  } catch {
    return getAccessToken();
  }
}

export type SocketContextValue = {
  socket: Socket | null;
  connected: boolean;
  joinLive: (liveId: string) => void;
  leaveLive: (liveId: string) => void;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export type SocketProviderProps = {
  children: ReactNode;
  /** Invoked after a successful socket reconnect (rooms re-joined). */
  onReconnect?: () => void;
};

export function SocketProvider({ children, onReconnect }: SocketProviderProps) {
  const accessToken = useSessionStore((s) => s.accessToken);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const joinedLivesRef = useRef<Set<string>>(new Set());
  /** Contador: varios componentes (page + chat) pueden unirse a la misma sala. */
  const joinCountRef = useRef<Map<string, number>>(new Map());
  const onReconnectRef = useRef(onReconnect);
  onReconnectRef.current = onReconnect;

  const rejoinLives = useCallback((socket: Socket) => {
    for (const liveId of joinedLivesRef.current) {
      socket.emit("joinLive", { liveId });
    }
  }, []);

  useEffect(() => {
    if (!accessToken) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
      return;
    }

    const nextSocket = io(`${SOCKET_BASE}/live`, {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
    });
    socketRef.current = nextSocket;
    setSocket(nextSocket);

    const onConnect = () => {
      setConnected(true);
      // Cada connect (inicial o tras recrear socket) debe reentrar a las salas
      rejoinLives(nextSocket);
      onReconnectRef.current?.();
    };
    const onDisconnect = () => setConnected(false);

    const handleReconnect = () => {
      rejoinLives(nextSocket);
      onReconnectRef.current?.();
      nextSocket.emit("client:reconnected", { ts: Date.now() });
    };

    const onReconnectAttempt = async () => {
      const fresh = await renewAccessToken();
      if (fresh) {
        nextSocket.auth = { token: fresh };
      }
    };

    nextSocket.on("connect", onConnect);
    nextSocket.on("disconnect", onDisconnect);
    nextSocket.io.on("reconnect", handleReconnect);
    nextSocket.io.on("reconnect_attempt", onReconnectAttempt);

    nextSocket.connect();

    return () => {
      nextSocket.off("connect", onConnect);
      nextSocket.off("disconnect", onDisconnect);
      nextSocket.io.off("reconnect", handleReconnect);
      nextSocket.io.off("reconnect_attempt", onReconnectAttempt);
      nextSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [accessToken, rejoinLives]);

  const joinLive = useCallback((liveId: string) => {
    if (!liveId) return;
    const next = (joinCountRef.current.get(liveId) ?? 0) + 1;
    joinCountRef.current.set(liveId, next);
    joinedLivesRef.current.add(liveId);
    const s = socketRef.current;
    if (s?.connected) {
      s.emit("joinLive", { liveId });
    }
    // si aún no conectó, onConnect → rejoinLives lo hará
  }, []);

  const leaveLive = useCallback((liveId: string) => {
    if (!liveId) return;
    const next = (joinCountRef.current.get(liveId) ?? 1) - 1;
    if (next > 0) {
      joinCountRef.current.set(liveId, next);
      return;
    }
    joinCountRef.current.delete(liveId);
    joinedLivesRef.current.delete(liveId);
    socketRef.current?.emit("leaveLive", { liveId });
  }, []);

  const value = useMemo<SocketContextValue>(
    () => ({
      socket,
      connected,
      joinLive,
      leaveLive,
    }),
    [socket, connected, joinLive, leaveLive],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return ctx;
}
