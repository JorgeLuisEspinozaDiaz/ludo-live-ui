import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Cog,
  Dices,
  History,
  LayoutDashboard,
  LogOut,
  Radio,
  Settings2,
  Shield,
  Users,
  Wallet,
  Wifi,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/auth/session-store";
import { useSocket } from "@/realtime/SocketProvider";
import { walletsApi, pointsApi } from "@/api/resources";
import { WalletBadge } from "@/components/game/WalletBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { t } from "@/i18n/es";
import { visualStatusFromBackend } from "@/lib/money";

const SIDEBAR_KEY = "ludo-sidebar-collapsed";

const ROUTE_ICONS: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/lives": Radio,
  "/rounds": Dices,
  "/wallets": Wallet,
  "/wallets/payments": Banknote,
  "/history": History,
  "/game-config": Settings2,
  "/audit": ClipboardList,
  "/users": Users,
  "/roles": Shield,
  "/config": Cog,
};

function iconForRoute(route?: string): LucideIcon {
  if (!route) return Dices;
  if (ROUTE_ICONS[route]) return ROUTE_ICONS[route];
  const hit = Object.keys(ROUTE_ICONS)
    .sort((a, b) => b.length - a.length)
    .find((r) => route.startsWith(r));
  return hit ? ROUTE_ICONS[hit] : Dices;
}

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSessionStore((s) => s.user);
  const menus = useSessionStore((s) => s.menus);
  const clear = useSessionStore((s) => s.clear);
  const { connected } = useSocket();
  const isStudio = /\/lives\/[^/]+\/studio/.test(location.pathname);

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

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

  const sections = menus
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((m) =>
      m.sections
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((s) => ({ ...s, group: m.name })),
    );

  const logout = () => {
    clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen text-foreground">
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-border bg-white/90 backdrop-blur-md transition-[width] duration-200 md:flex",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-border",
            collapsed ? "justify-center px-2 py-4" : "gap-2.5 px-4 py-4",
          )}
        >
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2.5"
            title="Ludo Live"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_4px_0_#1565c0]">
              <Dices className="size-5" />
            </span>
            {!collapsed && (
              <span className="min-w-0">
                <span className="block text-lg font-black leading-tight tracking-tight">
                  Ludo Live
                </span>
                <span className="block truncate text-[11px] font-bold text-muted">
                  {user?.tenantSlug ?? "tenant"}
                </span>
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
          {menus
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((menu) => (
              <div key={menu.id}>
                {!collapsed && (
                  <p className="mb-1.5 px-2 text-[10px] font-black uppercase tracking-[0.14em] text-muted">
                    {menu.name}
                  </p>
                )}
                <ul className="space-y-1">
                  {menu.sections
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((section) => {
                      const to = section.route || "/";
                      const Icon = iconForRoute(section.route);
                      return (
                        <li key={section.id}>
                          <NavLink
                            to={to}
                            title={section.name}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center rounded-xl text-sm font-bold transition-all",
                                collapsed
                                  ? "justify-center px-0 py-2.5"
                                  : "gap-2.5 px-3 py-2.5",
                                isActive
                                  ? "bg-primary text-white shadow-[0_3px_0_#1565c0]"
                                  : "text-foreground hover:bg-muted-bg",
                              )
                            }
                          >
                            <Icon className="size-4 shrink-0" />
                            {!collapsed && (
                              <span className="truncate">{section.name}</span>
                            )}
                          </NavLink>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          {!sections.length && !collapsed && (
            <p className="px-2 text-sm font-semibold text-muted">
              Sin menús disponibles
            </p>
          )}
        </nav>

        <div className="border-t border-border p-2">
          <Button
            type="button"
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className={cn("w-full", !collapsed && "justify-start gap-2")}
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expandir menú" : "Compactar menú"}
            title={collapsed ? "Expandir menú" : "Solo iconos"}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <>
                <ChevronLeft className="size-4" />
                Compactar
              </>
            )}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-white/90 px-3 py-2.5 backdrop-blur-md md:px-4">
          <div className="flex items-center gap-2 font-black text-foreground md:hidden">
            <Dices className="size-5 text-primary" />
            {t("appName")}
          </div>

          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold",
                connected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-border bg-muted-bg text-muted",
              )}
              title={connected ? t("common.connected") : t("common.disconnected")}
            >
              {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span className="hidden sm:inline">
                {connected ? t("common.connected") : t("common.disconnected")}
              </span>
            </span>

            {/* En el estudio el admin no necesita ver su propia mochila/puntos */}
            {!isStudio && walletQ.data && (
              <WalletBadge
                balanceCents={walletQ.data.balanceCents}
                visualStatus={visualStatusFromBackend(
                  walletQ.data.visualStatus,
                  walletQ.data.balanceCents,
                )}
              />
            )}

            {!isStudio && pointsQ.data && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-900">
                {t("wallet.points")}: {pointsQ.data.balance}
              </span>
            )}

            <div className="hidden border-l border-border pl-2 text-right sm:block">
              <p className="text-sm font-black leading-tight">{user?.username}</p>
              <p className="text-[11px] font-bold text-muted">{user?.role?.name}</p>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={logout}
              aria-label={t("common.logout")}
            >
              <LogOut size={16} />
            </Button>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b border-border bg-white px-3 py-2 md:hidden">
          {sections.map((s) => (
            <NavLink
              key={s.id}
              to={s.route || "/"}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-black",
                  isActive ? "bg-primary text-white" : "bg-muted-bg text-foreground",
                )
              }
            >
              {s.name}
            </NavLink>
          ))}
        </nav>

        <main
          className={cn(
            "flex-1 overflow-auto",
            isStudio ? "p-2 md:p-3" : "p-4 md:p-6 lg:p-8",
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
