/** Hostnames internos de Docker que el navegador no puede resolver. */
const DOCKER_HOSTS = new Set(["livekit", "livekit-server", "api", "backend"]);

/**
 * URL que usa el navegador.
 * Prioriza VITE_LIVEKIT_URL para evitar hostnames Docker del backend.
 */
export function resolveLiveKitUrl(serverUrl?: string | null): string {
  const envUrl = (import.meta.env.VITE_LIVEKIT_URL || "").trim();
  const fallback = envUrl || "ws://localhost:7880";

  // En browser siempre preferimos la URL pública del .env del front
  if (envUrl) {
    return normalize(envUrl);
  }

  let url = (serverUrl || fallback).trim() || fallback;
  url = normalize(url);

  try {
    const parsed = new URL(url.replace(/^ws/i, "http"));
    if (DOCKER_HOSTS.has(parsed.hostname)) {
      return normalize(fallback);
    }
  } catch {
    return normalize(fallback);
  }

  return url;
}

function normalize(raw: string): string {
  let url = raw.trim();
  if (url.startsWith("http://")) url = `ws://${url.slice("http://".length)}`;
  if (url.startsWith("https://")) url = `wss://${url.slice("https://".length)}`;
  return url.replace(/\/$/, "");
}
