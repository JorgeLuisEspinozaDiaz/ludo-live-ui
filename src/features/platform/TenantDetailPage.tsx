import { useState } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Copy, ExternalLink } from "lucide-react";
import { platformApi } from "@/api/platform.api";
import { buildTenantLoginUrl, buildTenantOrigin } from "@/lib/tenant";
import { getErrorMessage } from "@/lib/errors";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TenantAdminsSection } from "./TenantAdminsSection";

const editSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
});

type EditForm = z.infer<typeof editSchema>;

async function copyText(label: string, text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  } catch {
    toast.message(label, { description: text });
  }
}

export default function TenantDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const query = useQuery({
    queryKey: ["platform", "tenants", id],
    queryFn: () => platformApi.getTenant(id),
    enabled: !!id,
  });

  const form = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    values: query.data
      ? { name: query.data.name, slug: query.data.slug }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (values: EditForm) => platformApi.updateTenant(id, values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["platform", "tenants"] });
      setEditing(false);
      toast.success("Tenant actualizado");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const statusMutation = useMutation({
    mutationFn: (status: "ACTIVE" | "INACTIVE") =>
      platformApi.changeStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["platform", "tenants"] });
      toast.success("Estado actualizado");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const t = query.data;
  if (query.isLoading) {
    return <p className="text-white/60">Cargando…</p>;
  }
  if (!t) {
    return (
      <div className="space-y-3">
        <p className="text-white/70">Tenant no encontrado</p>
        <Button asChild variant="outline" className="border-white/20 text-white">
          <Link to="/platform/tenants">Volver</Link>
        </Button>
      </div>
    );
  }

  const loginUrl = buildTenantLoginUrl(t.slug);
  const origin = buildTenantOrigin(t.slug);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        className="[&_h1]:text-white [&_p]:text-white/60 [&_a]:text-sky-300"
        title={t.name}
        subtitle={`Slug: ${t.slug}`}
        backTo="/platform/tenants"
        backLabel="Tenants"
        actions={
          <Badge variant={t.status === "ACTIVE" ? "success" : "secondary"}>
            {t.status === "ACTIVE" ? "Activo" : "Inactivo"}
          </Badge>
        }
      />

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-black uppercase tracking-wide text-sky-300/90">
          Acceso del tenant
        </h2>
        <div className="space-y-2">
          <p className="text-xs font-bold text-white/50">URL de login</p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="flex-1 break-all rounded-xl bg-black/30 px-3 py-2 text-xs text-white/80">
              {loginUrl}
            </code>
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={() => copyText("URL", loginUrl)}
            >
              <Copy className="size-3.5" />
              Copiar
            </Button>
            <a
              href={loginUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1 rounded-md border border-white/20 px-3 text-sm font-bold text-white hover:bg-white/10"
            >
              <ExternalLink className="size-3.5" />
              Abrir
            </a>
          </div>
          <p className="text-xs text-white/45">
            Origen: <span className="font-mono">{origin}</span>
          </p>
        </div>
        <p className="text-sm text-white/60">
          Comparte esa URL con el administrador del casino. Entrarán con el
          usuario admin que creaste al registrar el tenant.
        </p>
      </section>

      <TenantAdminsSection tenantId={t.id} tenantSlug={t.slug} />

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-black uppercase tracking-wide text-sky-300/90">
            Datos
          </h2>
          {!editing && (
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={() => setEditing(true)}
            >
              Editar
            </Button>
          )}
        </div>

        {editing ? (
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit((v) => updateMutation.mutate(v))}
          >
            <div className="space-y-1.5">
              <Label className="text-white/70">Nombre</Label>
              <Input className="bg-white text-[#1a120b]" {...form.register("name")} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/70">Slug</Label>
              <Input className="bg-white text-[#1a120b]" {...form.register("slug")} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={updateMutation.isPending}>
                Guardar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/20 bg-transparent text-white"
                onClick={() => setEditing(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-white/45">ID</dt>
              <dd className="break-all font-mono text-xs text-white/80">{t.id}</dd>
            </div>
            <div>
              <dt className="text-white/45">Base de datos</dt>
              <dd className="font-mono text-xs text-white/80">
                {t.databaseName ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-white/45">Creado</dt>
              <dd className="text-white/80">
                {t.createdAt
                  ? new Date(t.createdAt).toLocaleString("es-PE")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-white/45">Actualizado</dt>
              <dd className="text-white/80">
                {t.updatedAt
                  ? new Date(t.updatedAt).toLocaleString("es-PE")
                  : "—"}
              </dd>
            </div>
          </dl>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
        <h2 className="text-sm font-black uppercase tracking-wide text-amber-200">
          Acceso al sistema
        </h2>
        <p className="text-sm text-white/65">
          Si inactivas el tenant, nadie de ese casino podrá iniciar sesión hasta
          que lo reactives.
        </p>
        <Button
          variant={t.status === "ACTIVE" ? "destructive" : "default"}
          disabled={statusMutation.isPending}
          onClick={() =>
            statusMutation.mutate(
              t.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
            )
          }
        >
          {t.status === "ACTIVE" ? "Inactivar tenant" : "Reactivar tenant"}
        </Button>
      </section>
    </div>
  );
}
