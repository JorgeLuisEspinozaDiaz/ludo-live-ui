import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MonitorPlay } from "lucide-react";
import { authApi } from "@/api/auth.api";
import { useSessionStore } from "@/auth/session-store";
import { getTenantSlugFromHost } from "@/lib/tenant";
import { getErrorMessage } from "@/lib/errors";
import { playPath } from "@/lib/player-links";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PERMISSIONS } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const schema = z.object({
  pin: z.string().min(4, "PIN mínimo 4 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export default function JoinPinPage() {
  const { liveId = "", pin: pinParam } = useParams<{
    liveId: string;
    pin?: string;
  }>();
  const navigate = useNavigate();
  const setFromLogin = useSessionStore((s) => s.setFromLogin);
  const [error, setError] = useState<string | null>(null);
  const [autoTrying, setAutoTrying] = useState(Boolean(pinParam));

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { pin: pinParam ? decodeURIComponent(pinParam) : "" },
  });

  const enterWithPin = async (rawPin: string) => {
    setError(null);
    const tenant = getTenantSlugFromHost() ?? undefined;
    const res = await authApi.loginPin({
      pin: rawPin.trim(),
      tenant,
    });
    setFromLogin(res);

    const isAdmin =
      res.permissions?.includes(PERMISSIONS.SYSTEM_ADMIN) ||
      res.permissions?.includes(PERMISSIONS.LIVE_MANAGE);

    if (isAdmin) {
      navigate(liveId ? `/lives/${liveId}/studio` : "/lives", { replace: true });
      return;
    }

    if (liveId) {
      navigate(playPath(liveId), { replace: true });
    } else {
      navigate("/jugar", { replace: true });
    }
  };

  useEffect(() => {
    if (!pinParam) return;
    let cancelled = false;
    (async () => {
      try {
        await enterWithPin(decodeURIComponent(pinParam));
      } catch (e) {
        if (!cancelled) {
          setAutoTrying(false);
          setError(getErrorMessage(e));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinParam]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await enterWithPin(values.pin);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  });

  if (autoTrying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#3b1d6e_0%,_#0c0814_60%)] px-4">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#1a1230] p-8 text-center">
          <h1 className="text-xl font-black text-amber-300">Entrando…</h1>
          <p className="mt-2 text-sm font-semibold text-white/55">
            Validando tu link personal
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#3b1d6e_0%,_#0c0814_60%)] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1a1230]/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-700 text-white shadow-lg">
            <MonitorPlay className="size-6" />
          </span>
          <h1 className="text-3xl font-black tracking-tight text-amber-300">
            Entrar al vivo
          </h1>
          <p className="mt-2 text-sm font-semibold text-white/60">
            {liveId
              ? "Sala · solo escribe tu PIN"
              : "Escribe el PIN de tu invitación"}
          </p>
          {liveId ? (
            <p className="mt-1 font-mono text-xs font-bold text-white/40">
              #{liveId.slice(0, 8)}
            </p>
          ) : null}
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label className="text-white/80">Tu PIN de acceso</Label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              className={cn(
                "auth-dark-input flex h-12 w-full rounded-xl border px-3.5 text-base font-black tracking-[0.2em]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50",
              )}
              placeholder="PIN de tu invitación"
              {...form.register("pin")}
            />
            {form.formState.errors.pin && (
              <p className="text-xs font-bold text-rose-300">
                {form.formState.errors.pin.message}
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-xl bg-rose-500/15 px-3 py-2 text-sm font-bold text-rose-200">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-base font-black text-[#1a120b] hover:from-amber-300 hover:to-orange-300"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Entrando…" : "Entrar al vivo"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs font-semibold text-white/45">
          ¿Eres administrador?{" "}
          <Link to="/login" className="font-black text-amber-300 hover:underline">
            Soy admin
          </Link>
        </p>
      </div>
    </div>
  );
}
