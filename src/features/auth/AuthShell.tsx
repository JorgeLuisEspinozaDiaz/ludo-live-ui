import type { ReactNode } from "react";
import heroImg from "@/assets/brand/ludo-hero.jpg";
import { cn } from "@/lib/utils";

const PAWNS = [
  { color: "bg-[#e53935]", label: "Rojo", delay: "0s" },
  { color: "bg-[#1e88e5]", label: "Azul", delay: "0.15s" },
  { color: "bg-[#43a047]", label: "Verde", delay: "0.3s" },
  { color: "bg-[#fdd835]", label: "Amarillo", delay: "0.45s" },
] as const;

type AuthShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
};

export function AuthShell({ children, title, subtitle, className }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1a120b] text-white">
      {/* Full-bleed atmosphere */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt=""
          className="h-full w-full object-cover scale-105 auth-hero-pan"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a120b]/88 via-[#2a1810]/75 to-[#0d3a6e]/70" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #e53935 0 2px, transparent 3px), radial-gradient(circle at 70% 60%, #1e88e5 0 2px, transparent 3px), radial-gradient(circle at 40% 80%, #43a047 0 2px, transparent 3px), radial-gradient(circle at 85% 25%, #fdd835 0 2px, transparent 3px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 px-4 py-10 md:flex-row md:items-center md:gap-12 md:px-8">
        {/* Brand hero */}
        <section className="md:flex-1 md:max-w-lg auth-fade-up">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.22em] text-[#fdd835]">
            Remcode
          </p>
          <h1 className="font-black leading-[0.95] tracking-tight">
            <span className="block text-[clamp(2.6rem,8vw,4.4rem)] text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.35)]">
              LUDO
            </span>
            <span className="mt-1 inline-block rounded-2xl bg-[#1e88e5] px-4 py-1.5 text-[clamp(1.4rem,4vw,2.2rem)] text-[#fdd835] shadow-[0_6px_0_#0d47a1] [text-shadow:0_2px_0_#0d47a1]">
              LIVE
            </span>
          </h1>
          <p className="mt-4 max-w-md text-base font-semibold text-white/85 md:text-lg">
            Rondas en vivo, apuestas por colores y la emoción del tablero clásico.
          </p>

          <ul className="mt-6 flex flex-wrap gap-3" aria-label="Colores del juego">
            {PAWNS.map((p) => (
              <li
                key={p.label}
                className="auth-pawn flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 backdrop-blur-sm"
                style={{ animationDelay: p.delay }}
              >
                <span
                  className={cn("h-3.5 w-3.5 rounded-full shadow-md ring-2 ring-white/50", p.color)}
                  aria-hidden
                />
                <span className="text-xs font-bold text-white">{p.label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Form panel */}
        <section
          className={cn(
            "w-full max-w-md auth-fade-up auth-fade-up-delay",
            className,
          )}
        >
          <div className="rounded-[28px] border border-white/20 bg-[#fffaf3]/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-md md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight text-[#1a120b]">{title}</h2>
              {subtitle ? (
                <p className="mt-1 text-sm font-semibold text-[#5c4a3a]">{subtitle}</p>
              ) : null}
            </div>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
