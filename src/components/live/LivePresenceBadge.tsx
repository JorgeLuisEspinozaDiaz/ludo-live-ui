import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

type LivePresenceBadgeProps = {
  isLive: boolean;
  viewers?: number;
  className?: string;
  /** Variante sobre video oscuro (jugador) o sobre UI clara (estudio) */
  tone?: "dark" | "light";
  size?: "sm" | "md";
};

function formatViewers(n: number) {
  if (n < 1000) return String(n);
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${Math.round(n / 1000)}K`;
}

export function LivePresenceBadge({
  isLive,
  viewers = 0,
  className,
  tone = "dark",
  size = "md",
}: LivePresenceBadgeProps) {
  const sm = size === "sm";

  if (!isLive) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md font-black uppercase tracking-wide",
          sm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
          tone === "dark"
            ? "bg-white/15 text-white/70"
            : "bg-muted-bg text-muted",
          className,
        )}
      >
        Fuera del aire
      </span>
    );
  }

  return (
    <div
      className={cn("inline-flex items-center gap-1.5", className)}
      title={`${viewers} espectador${viewers === 1 ? "" : "es"}`}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md bg-rose-600 font-black uppercase tracking-wide text-white shadow-sm",
          sm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        )}
      >
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/80 opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-white" />
        </span>
        En vivo
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md font-bold tabular-nums",
          sm ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs",
          tone === "dark"
            ? "bg-black/65 text-white backdrop-blur-sm"
            : "border border-border bg-white text-foreground shadow-sm",
        )}
      >
        <Eye className={cn(sm ? "size-3" : "size-3.5", "shrink-0 opacity-90")} />
        {formatViewers(Math.max(0, viewers))}
      </span>
    </div>
  );
}
