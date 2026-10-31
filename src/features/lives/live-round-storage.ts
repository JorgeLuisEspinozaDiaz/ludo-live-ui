const prefix = "ludo-current-round:";
const finishPrefix = "ludo-finish-shown:";

export function getStoredRoundId(liveId: string): string | null {
  return localStorage.getItem(`${prefix}${liveId}`);
}

export function setStoredRoundId(liveId: string, roundId: string) {
  localStorage.setItem(`${prefix}${liveId}`, roundId);
}

/** Evita reabrir el modal casino al recargar la página. */
export function wasFinishShown(roundId: string): boolean {
  try {
    return sessionStorage.getItem(`${finishPrefix}${roundId}`) === "1";
  } catch {
    return false;
  }
}

export function markFinishShown(roundId: string) {
  try {
    sessionStorage.setItem(`${finishPrefix}${roundId}`, "1");
  } catch {
    /* ignore */
  }
}
