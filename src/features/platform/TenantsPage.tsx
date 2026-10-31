import { useState } from "react";
import { Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Copy, ExternalLink, Plus, Search } from "lucide-react";
import {
  platformApi,
  type CreatePlatformTenantResult,
  type PlatformTenant,
} from "@/api/platform.api";
import { buildTenantLoginUrl } from "@/lib/tenant";
import { getErrorMessage } from "@/lib/errors";
import { PageHeader } from "@/components/PageHeader";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const createSchema = z.object({
  tenantName: z.string().min(2, "Nombre requerido"),
  tenantSlug: z
    .string()
    .min(2, "Slug requerido")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  username: z.string().min(3, "Usuario admin requerido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  adminName: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;

async function copyText(label: string, text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  } catch {
    toast.message(label, { description: text });
  }
}

export default function TenantsPage() {
  const qc = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [created, setCreated] = useState<
    (CreatePlatformTenantResult & { password: string }) | null
  >(null);

  const listQuery = useQuery({
    queryKey: ["platform", "tenants", search],
    queryFn: () => platformApi.listTenants(search || undefined),
  });

  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      tenantName: "",
      tenantSlug: "",
      username: "",
      password: "",
      email: "",
      adminName: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateForm) =>
      platformApi.createTenant({
        tenantName: values.tenantName,
        tenantSlug: values.tenantSlug,
        username: values.username,
        password: values.password,
        email: values.email?.trim() || undefined,
        adminName: values.adminName?.trim() || undefined,
      }),
    onSuccess: (data, values) => {
      setCreated({ ...data, password: values.password });
      setCreateOpen(false);
      form.reset();
      void qc.invalidateQueries({ queryKey: ["platform", "tenants"] });
      toast.success("Tenant creado");
    },
    onError: (err) => toast.error(getErrorMessage(err, "No se pudo crear")),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: PlatformTenant["status"];
    }) => platformApi.changeStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["platform", "tenants"] });
      toast.success("Estado actualizado");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const tenants = listQuery.data ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        className="[&_h1]:text-white [&_p]:text-white/60"
        title="Tenants"
        subtitle="Registra casinos, copia su URL de acceso e inactiva cuando dejen de operar."
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-sky-500 font-black text-white hover:bg-sky-400">
                <Plus className="size-4" />
                Nuevo tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar tenant</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-3"
                onSubmit={form.handleSubmit((v) => createMutation.mutate(v))}
              >
                <div className="space-y-1.5">
                  <Label>Nombre comercial</Label>
                  <Input {...form.register("tenantName")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug (subdominio)</Label>
                  <Input placeholder="mi-casino" {...form.register("tenantSlug")} />
                  <p className="text-xs text-muted-foreground">
                    URL: {buildTenantLoginUrl(form.watch("tenantSlug") || "slug")}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Usuario admin</Label>
                    <Input {...form.register("username")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Contraseña admin</Label>
                    <Input type="password" {...form.register("password")} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Email (opcional)</Label>
                    <Input {...form.register("email")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nombre admin</Label>
                    <Input {...form.register("adminName")} />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="font-bold"
                  >
                    {createMutation.isPending ? "Creando…" : "Crear tenant"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <Input
            className="border-white/15 bg-white/5 pl-9 text-white placeholder:text-white/40"
            placeholder="Buscar por nombre o slug…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSearch(searchInput.trim());
            }}
          />
        </div>
        <Button
          variant="outline"
          className="border-white/20 bg-transparent text-white hover:bg-white/10"
          onClick={() => setSearch(searchInput.trim())}
        >
          Buscar
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/60">Nombre</TableHead>
              <TableHead className="text-white/60">Slug</TableHead>
              <TableHead className="text-white/60">Estado</TableHead>
              <TableHead className="text-white/60">URL acceso</TableHead>
              <TableHead className="text-right text-white/60">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-white/50">
                  Cargando…
                </TableCell>
              </TableRow>
            )}
            {!listQuery.isLoading && tenants.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-white/50">
                  No hay tenants. Crea el primero.
                </TableCell>
              </TableRow>
            )}
            {tenants.map((t) => {
              const loginUrl = buildTenantLoginUrl(t.slug);
              return (
                <TableRow key={t.id} className="border-white/10">
                  <TableCell className="font-bold text-white">
                    <Link
                      to={`/platform/tenants/${t.id}`}
                      className="hover:text-sky-300 hover:underline"
                    >
                      {t.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-white/70">
                    {t.slug}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={t.status === "ACTIVE" ? "success" : "secondary"}
                    >
                      {t.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-[280px] items-center gap-1">
                      <span className="truncate text-xs text-white/60">
                        {loginUrl}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 shrink-0 text-white/70 hover:bg-white/10 hover:text-white"
                        onClick={() => copyText("URL", loginUrl)}
                        aria-label="Copiar URL"
                      >
                        <Copy className="size-3.5" />
                      </Button>
                      <a
                        href={loginUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex size-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
                        aria-label="Abrir"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                        <Link to={`/platform/tenants/${t.id}`}>Ver</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 bg-transparent text-white hover:bg-white/10"
                        disabled={statusMutation.isPending}
                        onClick={() =>
                          statusMutation.mutate({
                            id: t.id,
                            status:
                              t.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                          })
                        }
                      >
                        {t.status === "ACTIVE" ? "Inactivar" : "Activar"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!created} onOpenChange={(o) => !o && setCreated(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tenant listo</DialogTitle>
          </DialogHeader>
          {created && (
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-bold">{created.tenant.name}</span> (
                {created.tenant.slug})
              </p>
              <p className="text-muted-foreground">
                Cópialas ahora: la contraseña no se volverá a mostrar.
              </p>
              <div className="space-y-1 break-all rounded-xl border bg-muted/40 p-3 font-mono text-xs">
                <p>URL: {buildTenantLoginUrl(created.tenant.slug)}</p>
                <p>Usuario: {created.user.username}</p>
                <p>Contraseña: {created.password}</p>
              </div>
              <DialogFooter className="gap-2 sm:justify-start">
                <Button
                  type="button"
                  onClick={() =>
                    copyText(
                      "Credenciales",
                      `URL: ${buildTenantLoginUrl(created.tenant.slug)}\nUsuario: ${created.user.username}\nContraseña: ${created.password}`,
                    )
                  }
                >
                  <Copy className="size-4" />
                  Copiar credenciales
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  asChild
                >
                  <Link to={`/platform/tenants/${created.tenant.id}`}>
                    Ver detalle
                  </Link>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
