import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { authApi } from "@/api/auth.api";
import { useSessionStore } from "@/auth/session-store";
import { getErrorMessage } from "@/lib/errors";
import { playPath } from "@/lib/player-links";
import { PERMISSIONS } from "@/lib/permissions";

export default function AccessRedeemPage() {
  const { token = "" } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const setFromLogin = useSessionStore((s) => s.setFromLogin);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) {
        setError("Link incompleto");
        return;
      }
      try {
        const res = await authApi.redeemInvite(decodeURIComponent(token));
        if (cancelled) return;
        setFromLogin(res);

        const isAdmin =
          res.permissions?.includes(PERMISSIONS.SYSTEM_ADMIN) ||
          res.permissions?.includes(PERMISSIONS.LIVE_MANAGE);

        if (isAdmin) {
          navigate(res.liveId ? `/lives/${res.liveId}/studio` : "/lives", {
            replace: true,
          });
          return;
        }

        if (res.liveId) {
          navigate(playPath(res.liveId), { replace: true });
        } else {
          navigate("/jugar", { replace: true });
        }
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e));
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [token, navigate, setFromLogin]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#3b1d6e_0%,_#0c0814_60%)] px-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#1a1230] p-8 text-center">
        {error ? (
          <>
            <h1 className="text-xl font-black text-amber-300">Link no válido</h1>
            <p className="mt-2 text-sm font-semibold text-rose-200">{error}</p>
            <Link
              to="/entrar"
              className="mt-6 inline-block text-sm font-black text-amber-300 hover:underline"
            >
              Entrar con PIN
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-xl font-black text-amber-300">Entrando…</h1>
            <p className="mt-2 text-sm font-semibold text-white/55">
              Validando tu acceso directo
            </p>
          </>
        )}
      </div>
    </div>
  );
}
