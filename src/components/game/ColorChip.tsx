import { COLOR_TOKENS, type LudoColor } from "@/lib/colors";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: { swatch: "size-3", text: "text-xs gap-1.5" },
  md: { swatch: "size-4", text: "text-sm gap-2" },
  lg: { swatch: "size-5", text: "text-base gap-2.5" },
} as const;

export type ColorChipProps = {
  color: LudoColor;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
};

export function ColorChip({ color, size = "md", className }: ColorChipProps) {
  const tokens = COLOR_TOKENS[color];
  const sizeCfg = SIZE_CLASSES[size];

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium",
        tokens.text,
        sizeCfg.text,
        className,
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-full border border-black/10 ring-1 ring-inset ring-black/5",
          tokens.swatch,
          sizeCfg.swatch,
        )}
        aria-hidden
      />
      <span>{tokens.label}</span>
      <span className="sr-only">Color {tokens.label}</span>
    </span>
  );
}
