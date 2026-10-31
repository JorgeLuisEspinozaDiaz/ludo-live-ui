import { useCallback, useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  DisconnectReason,
  createLocalScreenTracks,
  createLocalTracks,
  type LocalAudioTrack,
  type LocalTrack,
  type LocalVideoTrack,
} from "livekit-client";
import {
  Mic,
  MicOff,
  MonitorOff,
  MonitorUp,
  Video,
  VideoOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { resolveLiveKitUrl } from "@/lib/livekit-url";

export type LivePublisherProps = {
  /** Si hay token, publica a LiveKit. Sin token solo hay preview local. */
  token?: string | null;
  serverUrl?: string | null;
  className?: string;
  /** Controles externos (toolbar del estudio) pueden montarse fuera */
  hideControls?: boolean;
  onStateChange?: (state: PublisherState) => void;
};

export type PublisherState = {
  connected: boolean;
  micOn: boolean;
  camOn: boolean;
  screenOn: boolean;
  error: string | null;
};

type DeviceLists = {
  audioInputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
};

export type LivePublisherHandle = {
  toggleMic: () => Promise<void>;
  toggleCam: () => Promise<void>;
  toggleScreen: () => Promise<void>;
};

export function LivePublisher({
  token,
  serverUrl,
  className,
  hideControls = false,
  onStateChange,
}: LivePublisherProps) {
  const lkUrl = resolveLiveKitUrl(serverUrl);
  const screenPreviewRef = useRef<HTMLDivElement>(null);
  const camPreviewRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<Room | null>(null);
  const camTrackRef = useRef<LocalVideoTrack | null>(null);
  const micTrackRef = useRef<LocalAudioTrack | null>(null);
  const screenTracksRef = useRef<LocalTrack[]>([]);
  const localOnlyRef = useRef(false);

  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [screenOn, setScreenOn] = useState(false);
  const [devices, setDevices] = useState<DeviceLists>({
    audioInputs: [],
    videoInputs: [],
  });
  const [audioDeviceId, setAudioDeviceId] = useState("");
  const [videoDeviceId, setVideoDeviceId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const emitState = useCallback(
    (patch: Partial<PublisherState> = {}) => {
      onStateChange?.({
        connected,
        micOn,
        camOn,
        screenOn,
        error,
        ...patch,
      });
    },
    [camOn, connected, error, micOn, onStateChange, screenOn],
  );

  const refreshDevices = useCallback(async () => {
    try {
      const lists = await Room.getLocalDevices();
      setDevices({
        audioInputs: lists.filter((d) => d.kind === "audioinput"),
        videoInputs: lists.filter((d) => d.kind === "videoinput"),
      });
    } catch {
      /* permissions may be pending */
    }
  }, []);

  const attachTo = useCallback((track: LocalVideoTrack, el: HTMLDivElement | null) => {
    if (!el) return;
    const media = track.attach();
    media.className = "h-full w-full object-contain";
    el.replaceChildren(media);
  }, []);

  const clearEl = (el: HTMLDivElement | null) => {
    el?.replaceChildren();
  };

  // Conectar a LiveKit cuando hay token
  useEffect(() => {
    if (!token) {
      setConnected(false);
      return;
    }
    const liveToken = token;
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const room = new Room();
    roomRef.current = room;
    localOnlyRef.current = false;

    async function republishLocals() {
      if (camTrackRef.current) {
        await room.localParticipant.publishTrack(camTrackRef.current);
      }
      if (micTrackRef.current) {
        await room.localParticipant.publishTrack(micTrackRef.current);
      }
      for (const track of screenTracksRef.current) {
        await room.localParticipant.publishTrack(track);
      }
    }

    async function connectAndPublish() {
      if (cancelled) return;
      try {
        await room.connect(lkUrl, liveToken);
        if (cancelled) {
          room.disconnect();
          return;
        }
        setConnected(true);
        setError(null);
        emitState({ connected: true, error: null });
        await refreshDevices();
        await republishLocals();
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "No se pudo publicar";
        if (/client initiated disconnect/i.test(msg)) return;
        setError(msg);
        emitState({ error: msg, connected: false });
      }
    }

    void connectAndPublish();

    const onDisconnected = (reason?: DisconnectReason) => {
      if (cancelled) return;
      setConnected(false);
      emitState({ connected: false });
      if (reason === DisconnectReason.CLIENT_INITIATED) return;
      reconnectTimer = setTimeout(() => {
        void connectAndPublish();
      }, 2000);
    };

    room.on(RoomEvent.Disconnected, onDisconnected);

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.disconnect();
      if (roomRef.current === room) roomRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, lkUrl]);

  useEffect(() => {
    return () => {
      camTrackRef.current?.stop();
      micTrackRef.current?.stop();
      for (const t of screenTracksRef.current) t.stop();
    };
  }, []);

  const ensureMic = async () => {
    if (micTrackRef.current) return micTrackRef.current;
    const tracks = await createLocalTracks({
      audio: audioDeviceId ? { deviceId: audioDeviceId } : true,
      video: false,
    });
    const mic = tracks.find((t) => t.kind === Track.Kind.Audio) as
      | LocalAudioTrack
      | undefined;
    if (!mic) throw new Error("No se pudo abrir el micrófono");
    micTrackRef.current = mic;
    await refreshDevices();
    if (roomRef.current) {
      await roomRef.current.localParticipant.publishTrack(mic);
    }
    return mic;
  };

  const ensureCam = async () => {
    if (camTrackRef.current) return camTrackRef.current;
    const tracks = await createLocalTracks({
      audio: false,
      video: videoDeviceId ? { deviceId: videoDeviceId } : true,
    });
    const cam = tracks.find((t) => t.kind === Track.Kind.Video) as
      | LocalVideoTrack
      | undefined;
    if (!cam) throw new Error("No se pudo abrir la cámara");
    camTrackRef.current = cam;
    attachTo(cam, camPreviewRef.current);
    await refreshDevices();
    if (roomRef.current) {
      await roomRef.current.localParticipant.publishTrack(cam);
    }
    return cam;
  };

  const toggleMic = async () => {
    try {
      setError(null);
      if (micOn) {
        if (roomRef.current) {
          await roomRef.current.localParticipant.setMicrophoneEnabled(false);
        } else {
          micTrackRef.current?.mute();
        }
        setMicOn(false);
        emitState({ micOn: false });
        return;
      }
      await ensureMic();
      if (roomRef.current) {
        await roomRef.current.localParticipant.setMicrophoneEnabled(true);
      } else {
        await micTrackRef.current?.unmute();
      }
      setMicOn(true);
      emitState({ micOn: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Micrófono no disponible";
      setError(msg);
      emitState({ error: msg });
    }
  };

  const toggleCam = async () => {
    try {
      setError(null);
      if (camOn) {
        if (roomRef.current) {
          await roomRef.current.localParticipant.setCameraEnabled(false);
        } else {
          camTrackRef.current?.stop();
          camTrackRef.current = null;
        }
        clearEl(camPreviewRef.current);
        setCamOn(false);
        emitState({ camOn: false });
        return;
      }
      await ensureCam();
      if (roomRef.current) {
        await roomRef.current.localParticipant.setCameraEnabled(true);
        const pub = roomRef.current.localParticipant.getTrackPublication(
          Track.Source.Camera,
        );
        const track = pub?.track;
        if (track && track.kind === Track.Kind.Video) {
          camTrackRef.current = track as LocalVideoTrack;
          attachTo(track as LocalVideoTrack, camPreviewRef.current);
        }
      }
      setCamOn(true);
      emitState({ camOn: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Cámara no disponible";
      setError(msg);
      emitState({ error: msg });
    }
  };

  const toggleScreen = async () => {
    try {
      setError(null);
      const room = roomRef.current;

      if (screenOn) {
        for (const track of screenTracksRef.current) {
          if (room) await room.localParticipant.unpublishTrack(track);
          track.stop();
        }
        screenTracksRef.current = [];
        clearEl(screenPreviewRef.current);
        setScreenOn(false);
        emitState({ screenOn: false });
        return;
      }

      const tracks = await createLocalScreenTracks({ audio: true });
      screenTracksRef.current = tracks;
      for (const track of tracks) {
        if (room) await room.localParticipant.publishTrack(track);
        if (track.kind === Track.Kind.Video) {
          attachTo(track as LocalVideoTrack, screenPreviewRef.current);
        }
      }
      setScreenOn(true);
      emitState({ screenOn: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Pantalla no disponible";
      setError(msg);
      emitState({ error: msg });
    }
  };

  const switchAudioDevice = async (deviceId: string) => {
    setAudioDeviceId(deviceId);
    const room = roomRef.current;
    if (!room || !deviceId) return;
    await room.switchActiveDevice("audioinput", deviceId);
  };

  const switchVideoDevice = async (deviceId: string) => {
    setVideoDeviceId(deviceId);
    const room = roomRef.current;
    if (!room || !deviceId) return;
    await room.switchActiveDevice("videoinput", deviceId);
    const pub = room.localParticipant.getTrackPublication(Track.Source.Camera);
    const track = pub?.track;
    if (track && track.kind === Track.Kind.Video) {
      camTrackRef.current = track as LocalVideoTrack;
      attachTo(track as LocalVideoTrack, camPreviewRef.current);
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-[#12141c]">
          <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-300">
            <MonitorUp className="size-3.5" />
            Pantalla
          </div>
          <div
            ref={screenPreviewRef}
            className="aspect-video w-full min-h-[200px]"
          />
          {!screenOn && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center">
              <p className="text-sm font-black text-white">Pantalla apagada</p>
              <p className="text-xs font-semibold text-white/65">
                Pulsa <span className="text-emerald-300">Compartir pantalla</span> para
                transmitir tu juego
              </p>
            </div>
          )}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-[#12141c]">
          <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1 text-[11px] font-black uppercase tracking-wide text-sky-300">
            <Video className="size-3.5" />
            Cámara
          </div>
          <div
            ref={camPreviewRef}
            className="aspect-video w-full min-h-[200px] [&_video]:scale-x-[-1]"
          />
          {!camOn && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center">
              <p className="text-sm font-black text-white">Cámara apagada</p>
              <p className="text-xs font-semibold text-white/65">
                Actívala para que te vean en PiP
              </p>
            </div>
          )}
        </div>
      </div>

      {!hideControls && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={screenOn ? "secondary" : "outline"}
              onClick={() => void toggleScreen()}
            >
              {screenOn ? <MonitorUp /> : <MonitorOff />}
              Pantalla {screenOn ? "ON" : "OFF"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={camOn ? "default" : "outline"}
              onClick={() => void toggleCam()}
            >
              {camOn ? <Video /> : <VideoOff />}
              Cámara {camOn ? "ON" : "OFF"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={micOn ? "default" : "destructive"}
              onClick={() => void toggleMic()}
            >
              {micOn ? <Mic /> : <MicOff />}
              Mic {micOn ? "ON" : "OFF"}
            </Button>
            {token ? (
              !connected && (
                <span className="text-xs font-bold text-amber-700">Reconectando…</span>
              )
            ) : (
              <span className="text-xs font-bold text-muted">
                Preview local — inicia el live para transmitir
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-muted">Micrófono</span>
              <select
                className="h-10 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground"
                value={audioDeviceId}
                onChange={(e) => void switchAudioDevice(e.target.value)}
              >
                <option value="">Predeterminado</option>
                {devices.audioInputs.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || d.deviceId}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-muted">Cámara</span>
              <select
                className="h-10 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground"
                value={videoDeviceId}
                onChange={(e) => void switchVideoDevice(e.target.value)}
              >
                <option value="">Predeterminado</option>
                {devices.videoInputs.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || d.deviceId}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </>
      )}

      {error && <p className="text-sm font-bold text-danger">{error}</p>}
    </div>
  );
}

/** Controles sueltos para toolbar del estudio (misma lógica vía callbacks externos). */
export function MediaControlButtons({
  micOn,
  camOn,
  screenOn,
  onToggleMic,
  onToggleCam,
  onToggleScreen,
  disabled,
}: {
  micOn: boolean;
  camOn: boolean;
  screenOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleScreen: () => void;
  disabled?: boolean;
}) {
  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={screenOn ? "secondary" : "outline"}
        disabled={disabled}
        onClick={onToggleScreen}
      >
        {screenOn ? <MonitorUp /> : <MonitorOff />}
        Pantalla {screenOn ? "ON" : "OFF"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={camOn ? "default" : "outline"}
        disabled={disabled}
        onClick={onToggleCam}
      >
        {camOn ? <Video /> : <VideoOff />}
        Cámara {camOn ? "ON" : "OFF"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={micOn ? "default" : "destructive"}
        disabled={disabled}
        onClick={onToggleMic}
      >
        {micOn ? <Mic /> : <MicOff />}
        Mic {micOn ? "ON" : "OFF"}
      </Button>
    </>
  );
}
