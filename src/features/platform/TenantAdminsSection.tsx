import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Copy, KeyRound, RefreshCw } from "lucide-react";
import { platformApi, type PlatformTenantAdmin } from "@/api/platform.api";
import { buildTenantLoginUrl } from "@/lib/tenant";
import { getErrorMessage } from "@/lib/errors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

async function copyText(label: string, text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  } catch {
    toast.message(label, { description: text });
  }
}

function generatePassword(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, (v) => chars[v % chars.length]).join("");
}

type Props = { tenantId: string; tenantSlug: string };

export function TenantAdminsSection({ tenantId, tenantSlug }: Props) {
  const [target, setTarget] = useState<PlatformTenantAdmin | null>(null);
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<{ username: string; password: string } | null>(
    null,
  );

  const adminsQuery = useQuery({
    queryKey: ["platform", "tenants", tenantId, "admins"],
    queryFn: () => platformApi.listAdmins(tenantId),
  });

  const resetMutation = useMutation({
    mutationFn: () => platformApi.resetAdminPassword(tenantId, target!.id, password),
    onSuccess: () => {
      setResult({ username: target!.username, password });
      setTarget(null);
      setPassword("");
      toast.success("Contraseña actualizada");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const loginUrl = buildTenantLoginUrl(tenantSlug);
  const admins = adminsQuery.data ?? [];

  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <h2 className="text-sm font-black uppercase tracking-wide text-sky-300/90">
        Credenciales de administrador
      </h2>
      <p className="text-xs text-white/50">
        Las contraseñas se guardan cifradas y no se pueden ver. Puedes asignar una
        nueva y compartirla con el cliente.
      </p>

      {adminsQuery.isLoading && <p className="text-sm text-white/50">Cargando…</p>}
      {adminsQuery.isError && (
        <p className="text-sm text-red-300">
          {getErrorMessage(adminsQuery.error, "No se pudo cargar los administradores")}
        </p>
      )}
      {!adminsQuery.isLoading && !adminsQuery.isError && admins.length === 0 && (
        <p className="text-sm text-white/50">Este tenant no tiene administradores.</p>
      )}

      <ul className="space-y-2">
        {admins.map((a) => (
          <li
            key={a.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-white">{a.username}</span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-7 text-white/60 hover:bg-white/10 hover:text-white"
                  onClick={() => copyText("Usuario", a.username)}
                  aria-label="Copiar usuario"
                >
                  <Copy className="size-3.5" />
                </Button>
                <Badge variant={a.status === "ACTIVE" ? "success" : "secondary"}>
                  {a.status === "ACTIVE" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <p className="text-xs text-white/50">
                {a.email || "Sin email"} · {a.roleName ?? "Administrador"}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={() => {
                setTarget(a);
                setPassword(generatePassword());
              }}
            >
              <KeyRound className="size-3.5" />
              Cambiar contraseña
            </Button>
          </li>
        ))}
      </ul>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva contraseña para {target?.username}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (password.length < 6) {
                toast.error("Mínimo 6 caracteres");
                return;
              }
              resetMutation.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="new-admin-password">Contraseña</Label>
              <div className="flex gap-2">
                <Input
                  id="new-admin-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-mono"
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setPassword(generatePassword())}
                  aria-label="Generar otra"
                >
                  <RefreshCw className="size-4" />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={resetMutation.isPending}>
                {resetMutation.isPending ? "Guardando…" : "Guardar contraseña"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!result} onOpenChange={(o) => !o && setResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credenciales para el cliente</DialogTitle>
          </DialogHeader>
          {result && (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Cópialas ahora: la contraseña no se volverá a mostrar.
              </p>
              <div className="space-y-1 rounded-xl border bg-muted/40 p-3 font-mono text-xs">
                <p>URL: {loginUrl}</p>
                <p>Usuario: {result.username}</p>
                <p>Contraseña: {result.password}</p>
              </div>
              <DialogFooter className="sm:justify-start">
                <Button
                  type="button"
                  onClick={() =>
                    copyText(
                      "Credenciales",
                      `URL: ${loginUrl}\nUsuario: ${result.username}\nContraseña: ${result.password}`,
                    )
                  }
                >
                  <Copy className="size-4" />
                  Copiar todo
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
