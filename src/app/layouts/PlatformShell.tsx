import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { Building2, LogOut, Shield } from "lucide-react";
import { useSessionStore } from "@/auth/session-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PlatformShell() {
  const navigate = useNavigate();
  const user = useSessionStore((s) => s.user);
  const clear = useSessionStore((s) => s.clear);

  const logout = () => {
    clear();
    navigate("/platform/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top,_#1a2744_0%,_#0b1020_55%)] text-white">
      <aside className="hidden w-60 flex-col border-r border-white/10 bg-[#0f1628]/95 backdrop-blur md:flex">
        <div className="border-b border-white/10 px-4 py-5">
          <Link to="/platform/tenants" className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-[0_4px_0_#0369a1]">
              <Shield className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-black leading-tight tracking-wide">
                Control plane
              </span>
              <span className="block text-[11px] font-bold text-white/55">
                {user?.username ?? "platform"}
              </span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4">
          <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.14em] text-white/40">
            Plataforma
          </p>
          <NavLink
            to="/platform/tenants"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-all",
                isActive
                  ? "bg-sky-500 text-white shadow-[0_3px_0_#0369a1]"
                  : "text-white/80 hover:bg-white/5",
              )
            }
          >
            <Building2 className="size-4" />
            Tenants
          </NavLink>
        </nav>
        <div className="border-t border-white/10 p-3">
          <Button
            variant="outline"
            className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
            onClick={logout}
          >
            <LogOut className="size-4" />
            Salir
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#0f1628]/80 px-4 py-3 backdrop-blur md:px-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wide text-sky-300/80">
              Administrador total
            </p>
            <p className="text-sm font-bold text-white/70">
              Registro y control de tenants
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 bg-transparent text-white hover:bg-white/10 md:hidden"
            onClick={logout}
          >
            Salir
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
