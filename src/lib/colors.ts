export const LUDO_COLORS = [
  "ROJO",
  "VERDE",
  "AMARILLO",
  "NARANJA",
  "MORADO",
  "AZUL",
] as const;

export type LudoColor = (typeof LUDO_COLORS)[number];

export const COLOR_TOKENS: Record<
  LudoColor,
  { label: string; bg: string; border: string; text: string; swatch: string }
> = {
  ROJO: {
    label: "Rojo",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-300 dark:border-red-700",
    text: "text-red-800 dark:text-red-200",
    swatch: "bg-red-500",
  },
  VERDE: {
    label: "Verde",
    bg: "bg-green-50 dark:bg-green-950/40",
    border: "border-green-300 dark:border-green-700",
    text: "text-green-800 dark:text-green-200",
    swatch: "bg-green-500",
  },
  AMARILLO: {
    label: "Amarillo",
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
    border: "border-yellow-300 dark:border-yellow-700",
    text: "text-yellow-900 dark:text-yellow-100",
    swatch: "bg-yellow-400",
  },
  NARANJA: {
    label: "Naranja",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-300 dark:border-orange-700",
    text: "text-orange-800 dark:text-orange-200",
    swatch: "bg-orange-500",
  },
  MORADO: {
    label: "Morado",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-300 dark:border-purple-700",
    text: "text-purple-800 dark:text-purple-200",
    swatch: "bg-purple-500",
  },
  AZUL: {
    label: "Azul",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-300 dark:border-blue-700",
    text: "text-blue-800 dark:text-blue-200",
    swatch: "bg-blue-500",
  },
};

export function isLudoColor(value: string): value is LudoColor {
  return (LUDO_COLORS as readonly string[]).includes(value);
}

/** Colores sólidos para toasts / chips de compra. */
export const COLOR_HEX: Record<LudoColor, { bg: string; fg: string }> = {
  ROJO: { bg: "#e53935", fg: "#ffffff" },
  VERDE: { bg: "#43a047", fg: "#ffffff" },
  AMARILLO: { bg: "#fdd835", fg: "#1a120b" },
  NARANJA: { bg: "#fb8c00", fg: "#ffffff" },
  MORADO: { bg: "#8e24aa", fg: "#ffffff" },
  AZUL: { bg: "#1e88e5", fg: "#ffffff" },
};
