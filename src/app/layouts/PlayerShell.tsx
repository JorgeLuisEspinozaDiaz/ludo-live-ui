import { Link, Outlet, useNavigate } from "react-router";
import { LogOut, Dices } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/auth/session-store";
import { walletsApi, pointsApi } from "@/api/resources";
import { WalletBadge } from "@/components/game/WalletBadge";
import { Button } from "@/components/ui/button";
import { visualStatusFromBackend } from "@/lib/money";
import { t } from "@/i18n/es";

export function PlayerShell() {
  const navigate = useNavigate();
  const user = useSessionStore((s) => s.user);
  const clear = useSessionStore((s) => s.clear);

  const walletQ = useQuery({
    queryKey: ["wallet", "me"],
    queryFn: walletsApi.me,
    enabled: Boolean(user),
  });
  const pointsQ = useQuery({
    queryKey: ["points", "me"],
    queryFn: pointsApi.me,
    enabled: Boolean(user),
  });

  const logout = () => {
    clear();
    navigate("/entrar", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#2a1848_0%,_#0c0814_55%)] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#120c1f]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-400 text-[#1a120b]">
              <Dices className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-black leading-tight tracking-wide text-amber-300">
                LUDO LIVE ARENA
              </span>
              <span className="block text-[11px] font-bold text-white/55">
                {user?.username}
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {walletQ.data && (
              <WalletBadge
                balanceCents={walletQ.data.balanceCents}
                visualStatus={visualStatusFromBackend(
                  walletQ.data.visualStatus,
                  walletQ.data.balanceCents,
                )}
              />
            )}
            {pointsQ.data && (
              <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-xs font-black text-amber-200">
                {t("wallet.points")}: {pointsQ.data.balance}
              </span>
            )}
            <Button
              variant="outline"
              size="icon"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={logout}
              aria-label={t("common.logout")}
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-3 md:p-5">
        <Outlet />
      </main>
    </div>
  );
}
