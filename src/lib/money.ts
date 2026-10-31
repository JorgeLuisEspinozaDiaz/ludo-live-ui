/** Todos los montos de API viven en céntimos enteros. Nunca usar float. */

const penFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

export type WalletVisualStatus = "NEGATIVE" | "ZERO" | "POSITIVE";

export function centsToNumber(cents: number | string | null | undefined): number {
  if (cents === null || cents === undefined) return 0;
  return Math.trunc(Number(cents));
}

/** Formatea céntimos a S/ 1,234.50 */
export function formatMoney(cents: number | string | null | undefined): string {
  const value = centsToNumber(cents) / 100;
  return penFormatter.format(value);
}

export function solesToCents(soles: number): number {
  return Math.round(soles * 100);
}

export function multiplyCents(unitCents: number, quantity: number): number {
  return Math.trunc(unitCents) * Math.trunc(quantity);
}

export function addCents(...parts: number[]): number {
  return parts.reduce((acc, n) => acc + Math.trunc(n), 0);
}

/** Usa el valor del backend; no recalcular en UI de negocio. */
export function visualStatusFromBackend(
  status: WalletVisualStatus | string | undefined,
  balanceCents?: number,
): WalletVisualStatus {
  if (status === "NEGATIVE" || status === "ZERO" || status === "POSITIVE") {
    return status;
  }
  const bal = centsToNumber(balanceCents);
  if (bal < 0) return "NEGATIVE";
  if (bal > 0) return "POSITIVE";
  return "ZERO";
}

export function visualStatusClass(status: WalletVisualStatus): string {
  switch (status) {
    case "NEGATIVE":
      return "text-red-600 bg-red-50 border-red-200";
    case "POSITIVE":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    default:
      return "text-slate-700 bg-white border-slate-200";
  }
}
