/** Links del jugador (distintos del admin). */

/** Link genérico: el jugador escribe su PIN */
export function pinJoinPath(liveId: string) {
  return `/entrar/${liveId}`;
}

/** Link personal: entra directo con el PIN en la URL */
export function personalPinPath(liveId: string, pin: string) {
  return `/entrar/${liveId}/p/${encodeURIComponent(pin)}`;
}

export function directAccessPath(token: string) {
  return `/acceso/${encodeURIComponent(token)}`;
}

export function playPath(liveId: string) {
  return `/jugar/${liveId}`;
}

export function absoluteAppUrl(path: string) {
  const origin = window.location.origin;
  const basename = (import.meta.env.VITE_BASE_URL_SERVIDOR || "").replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${basename}${normalized}`;
}
