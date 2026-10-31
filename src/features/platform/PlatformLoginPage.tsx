import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { authApi } from "@/api/auth.api";
import { useSessionStore } from "@/auth/session-store";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthShell } from "@/features/auth/AuthShell";

const schema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type FormValues = z.infer<typeof schema>;

const fieldClass =
  "h-12 rounded-2xl border-[#d6c4ae] !bg-white !text-[#1a120b] caret-[#1a120b] placeholder:!text-[#8a7360] shadow-none focus-visible:ring-sky-500/35 focus-visible:border-sky-500";

export default function PlatformLoginPage() {
  const navigate = useNavigate();
  const setFromLogin = useSessionStore((s) => s.setFromLogin);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => authApi.platformLogin(values),
    onSuccess: (data) => {
      setFromLogin({
        ...data,
        user: { ...data.user, isPlatformAdmin: true },
      });
      toast.success(`Bienvenido, ${data.user.username}`);
      navigate("/platform/tenants", { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo iniciar sesión")),
  });

  return (
    <AuthShell
      title="Administrador total"
      subtitle="Consola de control de todos los tenants"
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
      >
        <div className="flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-sm font-bold text-sky-100">
          <Shield className="size-4 shrink-0" />
          Acceso exclusivo al control plane
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="username" className="font-bold text-[#3d2f24]">
            Usuario
          </Label>
          <Input
            id="username"
            className={fieldClass}
            autoComplete="username"
            {...form.register("username")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="font-bold text-[#3d2f24]">
            Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            className={fieldClass}
            autoComplete="current-password"
            {...form.register("password")}
          />
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-2xl bg-sky-600 font-black text-white shadow-[0_4px_0_#0369a1] hover:bg-sky-500"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Entrando…" : "Entrar a plataforma"}
        </Button>

        <p className="text-center text-sm font-semibold text-[#5c4636]">
          ¿Admin de un casino?{" "}
          <Link to="/login" className="text-sky-700 underline-offset-2 hover:underline">
            Ir al login del tenant
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
