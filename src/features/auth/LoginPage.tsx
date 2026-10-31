import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Lock, User } from "lucide-react";
import { authApi } from "@/api/auth.api";
import { useSessionStore } from "@/auth/session-store";
import { getErrorMessage } from "@/lib/errors";
import { getTenantSlugFromHost } from "@/lib/tenant";
import { t } from "@/i18n/es";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthShell } from "./AuthShell";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type LoginForm = z.infer<typeof loginSchema>;

const fieldClass =
  "h-12 rounded-2xl border-[#d6c4ae] !bg-white !text-[#1a120b] caret-[#1a120b] placeholder:!text-[#8a7360] shadow-none focus-visible:ring-[#1e88e5]/35 focus-visible:border-[#1e88e5] dark:!bg-white dark:!text-[#1a120b] dark:placeholder:!text-[#8a7360] auth-input";

export default function LoginPage() {
  const navigate = useNavigate();
  const setFromLogin = useSessionStore((s) => s.setFromLogin);
  const tenantSlug = getTenantSlugFromHost();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginForm) =>
      authApi.login({
        username: values.username,
        password: values.password,
        ...(tenantSlug ? { tenant: tenantSlug } : {}),
      }),
    onSuccess: (data) => {
      setFromLogin(data);
      toast.success(`Bienvenido, ${data.user.username}`);
      const first =
        data.menus
          ?.flatMap((m) => m.sections)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .find((s) => s.route)?.route ?? "/dashboard";
      navigate(first, { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo iniciar sesión")),
  });

  const onSubmit = form.handleSubmit((values) => {
    if (!tenantSlug) {
      toast.error(
        "Abre el login con el subdominio del tenant, ej. http://lupita-ludo.localhost:5173/login",
      );
      return;
    }
    loginMutation.mutate(values);
  });

  return (
    <AuthShell
      title="Panel administración"
      subtitle="Usuario y contraseña de admin · el PIN es solo para jugadores"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {tenantSlug ? (
          <div className="rounded-2xl border border-[#d6c4ae] bg-[#fff6e8] px-4 py-3">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#8a7360]">
              Tenant (desde la URL)
            </p>
            <p className="text-sm font-black text-[#1a120b]">{tenantSlug}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            Usa un subdominio de tenant, por ejemplo{" "}
            <span className="font-black">lupita-ludo.localhost:5173</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-[#3d2f24] font-bold">
            Usuario admin
          </Label>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9a8572]"
              aria-hidden
            />
            <Input
              id="username"
              autoComplete="username"
              placeholder="tu usuario"
              className={cn(fieldClass, "pl-10")}
              {...form.register("username")}
            />
          </div>
          {form.formState.errors.username && (
            <p className="text-sm font-semibold text-[#c62828]">
              {form.formState.errors.username.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[#3d2f24] font-bold">
            Contraseña
          </Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9a8572]"
              aria-hidden
            />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className={cn(fieldClass, "pl-10")}
              {...form.register("password")}
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-sm font-semibold text-[#c62828]">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loginMutation.isPending || !tenantSlug}
          className="mt-2 h-12 w-full rounded-2xl bg-[#43a047] text-base font-black text-white shadow-[0_6px_0_#2e7d32] transition hover:brightness-105 active:translate-y-0.5 active:shadow-[0_3px_0_#2e7d32] disabled:opacity-70"
        >
          {loginMutation.isPending ? t("common.loading") : t("login.submit")}
        </Button>

        <p className="text-center text-sm font-semibold text-[#6b5a4a]">
          ¿Vas a jugar en el live?{" "}
          <Link
            to="/entrar"
            className="font-black text-[#1e88e5] underline-offset-4 hover:underline"
          >
            Entra solo con tu PIN
          </Link>
        </p>

        <Link
          to="/bootstrap"
          className="block text-center text-sm font-bold text-[#1e88e5] underline-offset-4 hover:underline"
        >
          {t("login.bootstrapLink")}
        </Link>
        <Link
          to="/platform/login"
          className="block text-center text-xs font-bold text-[#6b5a4a] underline-offset-4 hover:text-[#1e88e5] hover:underline"
        >
          Acceso administrador total
        </Link>
      </form>
    </AuthShell>
  );
}
