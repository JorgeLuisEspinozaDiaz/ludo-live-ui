import { useEffect, useRef, useState, type ReactNode } from "react";
import { Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FloatingPanelProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** posición inicial */
  initial: { x: number; y: number; w?: number; h?: number };
  className?: string;
};

/**
 * Tras la primera apertura mantiene children montados (chat/socket)
 * aunque se cierre el panel.
 */
export function FloatingPanel({
  title,
  open,
  onClose,
  children,
  initial,
  className,
}: FloatingPanelProps) {
  const [pos, setPos] = useState({ x: initial.x, y: initial.y });
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(open);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setCollapsed(false);
    }
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed z-40 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl",
        !open && "pointer-events-none invisible",
        className,
      )}
      aria-hidden={!open}
      style={{
        left: pos.x,
        top: pos.y,
        width: initial.w ?? 360,
        height: !open || collapsed ? undefined : initial.h ?? 480,
      }}
    >
      <div
        className="flex cursor-grab items-center justify-between gap-2 border-b border-border bg-muted-bg px-3 py-2 active:cursor-grabbing"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          dragRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return;
          setPos({
            x: Math.max(8, e.clientX - dragRef.current.dx),
            y: Math.max(8, e.clientY - dragRef.current.dy),
          });
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
      >
        <p className="text-sm font-black text-foreground">{title}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted hover:bg-white hover:text-foreground"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Minimizar"
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted hover:bg-white hover:text-foreground"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-hidden",
          (collapsed || !open) && "hidden",
        )}
      >
        {children}
      </div>
    </div>
  );
}
