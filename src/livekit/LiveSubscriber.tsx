import { useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  DisconnectReason,
  type RemoteTrack,
  type RemoteTrackPublication,
  type RemoteParticipant,
} from "livekit-client";
import { Maximize2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveLiveKitUrl } from "@/lib/livekit-url";

export type LiveSubscriberProps = {
  token: string;
  serverUrl?: string | null;
  className?: string;
  onNeedAudioGesture?: () => void;
};

export function LiveSubscriber({
  token,
  serverUrl,
  className,
  onNeedAudioGesture,
}: LiveSubscriberProps) {
  const mainRef = useRef<HTMLDivElement>(null);
  const pipRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<Room | null>(null);
  const audioElsRef = useRef<HTMLMediaElement[]>([]);
  const onNeedAudioRef = useRef(onNeedAudioGesture);
  onNeedAudioRef.current = onNeedAudioGesture;

  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">(
    "idle",
  );
  const [needsAudio, setNeedsAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPip, setHasPip] = useState(false);
  const [volume, setVolume] = useState(1);
  const volumeRef = useRef(1);
  volumeRef.current = volume;

  const url = resolveLiveKitUrl(serverUrl);

  const applyVolume = (v: number) => {
    for (const el of audioElsRef.current) {
      el.volume = v;
      el.muted = v <= 0.001;
    }
  };

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });
    roomRef.current = room;
    audioElsRef.current = [];

    const refreshPipVisibility = () => {
      const pip = pipRef.current;
      if (!pip) {
        setHasPip(false);
        return;
      }
      setHasPip(pip.querySelector("video") != null);
    };

    const attachTrack = (
      track: RemoteTrack,
      source: Track.Source = Track.Source.Unknown,
    ) => {
      if (track.kind === Track.Kind.Audio) {
        const el = track.attach() as HTMLMediaElement;
        el.dataset.trackSid = track.sid;
        el.className = "hidden";
        el.volume = volumeRef.current;
        el.muted = volumeRef.current <= 0.001;
        document.body.appendChild(el);
        audioElsRef.current.push(el);
        return;
      }

      if (track.kind !== Track.Kind.Video) return;

      const isCamera = source === Track.Source.Camera;
      const host = isCamera ? pipRef.current : mainRef.current;
      if (!host) return;

      const existing = host.querySelector(`[data-track-sid="${track.sid}"]`);
      if (existing) return;

      // Una sola cámara en PiP / un solo main video por contenedor
      host.replaceChildren();
      const el = track.attach();
      el.dataset.trackSid = track.sid;
      el.className = isCamera
        ? "h-full w-full object-cover"
        : "h-full w-full object-contain bg-black";
      host.appendChild(el);
      if (isCamera) refreshPipVisibility();
    };

    const detachTrack = (track: RemoteTrack) => {
      track.detach().forEach((el) => {
        if (el instanceof HTMLMediaElement) {
          audioElsRef.current = audioElsRef.current.filter((a) => a !== el);
        }
        el.remove();
      });
      refreshPipVisibility();
    };

    const attachExisting = () => {
      for (const participant of room.remoteParticipants.values()) {
        for (const pub of participant.trackPublications.values()) {
          if (pub.track) {
            attachTrack(pub.track as RemoteTrack, pub.source);
          }
        }
      }
      refreshPipVisibility();
    };

    const clearReconnect = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const scheduleReconnect = () => {
      if (cancelled) return;
      clearReconnect();
      const delay = Math.min(8000, 1500 + attempt * 1000);
      attempt += 1;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        void connect();
      }, delay);
    };

    const onTrackSubscribed = (
      track: RemoteTrack,
      pub: RemoteTrackPublication,
      _participant: RemoteParticipant,
    ) => {
      attachTrack(track, pub.source);
      if (track.kind === Track.Kind.Audio) {
        room.startAudio().catch(() => {
          setNeedsAudio(true);
          onNeedAudioRef.current?.();
        });
      }
    };

    const onTrackUnsubscribed = (track: RemoteTrack) => {
      detachTrack(track);
    };

    const onDisconnected = (reason?: DisconnectReason) => {
      if (cancelled) return;
      setStatus("idle");
      setHasPip(false);
      if (reason === DisconnectReason.CLIENT_INITIATED) return;
      setError(null);
      scheduleReconnect();
    };

    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
    room.on(RoomEvent.Disconnected, onDisconnected);

    async function connect() {
      if (cancelled) return;
      setStatus("connecting");
      setError(null);
      try {
        await room.connect(url, token);
        if (cancelled) {
          room.disconnect();
          return;
        }
        attempt = 0;
        setStatus("connected");
        setError(null);
        attachExisting();
        await room.startAudio().catch(() => {
          setNeedsAudio(true);
          onNeedAudioRef.current?.();
        });
        applyVolume(volumeRef.current);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        const msg = err instanceof Error ? err.message : "Error de conexión";
        if (/client initiated disconnect/i.test(msg)) {
          setError(null);
          scheduleReconnect();
          return;
        }
        setError(
          `${msg}. Revisa que LiveKit esté en ${url} (VITE_LIVEKIT_URL / LIVEKIT_URL).`,
        );
        scheduleReconnect();
      }
    }

    void connect();

    return () => {
      cancelled = true;
      clearReconnect();
      room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.disconnect();
      if (roomRef.current === room) roomRef.current = null;
      for (const el of audioElsRef.current) el.remove();
      audioElsRef.current = [];
      mainRef.current?.replaceChildren();
      pipRef.current?.replaceChildren();
    };
  }, [token, url]);

  useEffect(() => {
    applyVolume(volume);
  }, [volume]);

  const enableAudio = async () => {
    const room = roomRef.current;
    if (!room) return;
    try {
      await room.startAudio();
      setNeedsAudio(false);
      applyVolume(volumeRef.current);
    } catch {
      onNeedAudioRef.current?.();
    }
  };

  const stageRef = useRef<HTMLDivElement>(null);

  return (
    <div className={cn("relative flex flex-col gap-2", className)}>
      <div
        ref={stageRef}
        className="relative aspect-video w-full overflow-hidden rounded-lg bg-black"
      >
        <div ref={mainRef} className="absolute inset-0" />
        <div
          ref={pipRef}
          className={cn(
            "absolute bottom-3 right-3 z-10 overflow-hidden rounded-xl border-2 border-white/80 bg-black shadow-lg",
            "h-[22%] min-h-[72px] w-[28%] min-w-[96px] max-w-[180px]",
            !hasPip && "hidden",
          )}
          aria-hidden={!hasPip}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {needsAudio && (
          <Button type="button" size="sm" variant="secondary" onClick={() => void enableAudio()}>
            <Volume2 />
            Activar audio
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => stageRef.current?.requestFullscreen?.()}
        >
          <Maximize2 />
          Pantalla completa
        </Button>

        <div className="flex min-w-[160px] flex-1 items-center gap-2 sm:max-w-[220px]">
          <button
            type="button"
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10"
            aria-label={volume <= 0 ? "Activar volumen" : "Silenciar"}
            onClick={() => setVolume((v) => (v <= 0 ? 0.7 : 0))}
          >
            {volume <= 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="h-1.5 w-full cursor-pointer accent-amber-400"
            aria-label="Volumen"
          />
        </div>

        {status === "connecting" && (
          <span className="text-xs font-semibold text-muted">Conectando a {url}…</span>
        )}
        {error && <span className="text-xs font-semibold text-danger">{error}</span>}
      </div>
    </div>
  );
}
