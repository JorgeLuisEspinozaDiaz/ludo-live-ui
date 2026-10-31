import { useState } from "react";
import { Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { livesApi, usersApi } from "@/api/resources";
import { Can } from "@/auth/Can";
import { PERMISSIONS } from "@/lib/permissions";
import { getErrorMessage } from "@/lib/errors";
import {
  absoluteAppUrl,
  directAccessPath,
  pinJoinPath,
} from "@/lib/player-links";
import { t } from "@/i18n/es";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Copy } from "lucide-react";

const createSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(4, "PIN mínimo 4 caracteres"),
  email: z.string().email().optional().or(z.literal("")),
  liveId: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;

type InviteBundle = {
  userId: string;
  username: string;
  pin: string;
  liveId?: string;
  pinUrl: string;
  directUrl?: string;
};

async function copyText(label: string, text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  } catch {
    toast.message(label, { description: text });
  }
}

export default function UsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [invite, setInvite] = useState<InviteBundle | null>(null);
  const [linkUserId, setLinkUserId] = useState<string | null>(null);
  const [linkLiveId, setLinkLiveId] = useState<string>("");

  const listQuery = useQuery({
    queryKey: ["users", "participants", page, search],
    queryFn: () => usersApi.list({ page, take: 20, search: search || undefined }),
  });

  const livesQuery = useQuery({
    queryKey: ["lives", "for-invite"],
    queryFn: () => livesApi.list({ take: 50, page: 1 }),
  });

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { username: "", password: "", email: "", liveId: "" },
  });

  const createMutation = useMutation({
    mutationFn: async (values: CreateForm) => {
      const user = (await usersApi.createParticipant({
        username: values.username,
        password: values.password,
        email: values.email?.trim() || undefined,
      })) as { id: string; username: string };

      let directUrl: string | undefined;
      try {
        const access = await usersApi.createAccessLink(user.id, {
          liveId: values.liveId || undefined,
        });
        directUrl = absoluteAppUrl(directAccessPath(access.token));
      } catch {
        /* link directo opcional si falla */
      }

      const pinUrl = absoluteAppUrl(
        values.liveId ? pinJoinPath(values.liveId) : "/entrar",
      );

      return {
        userId: user.id,
        username: values.username,
        pin: values.password,
        liveId: values.liveId || undefined,
        pinUrl,
        directUrl,
      } satisfies InviteBundle;
    },
    onSuccess: (bundle) => {
      toast.success("Participante creado");
      setCreateOpen(false);
      createForm.reset();
      setInvite(bundle);
      void qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const accessLinkMutation = useMutation({
    mutationFn: ({ id, liveId }: { id: string; liveId?: string }) =>
      usersApi.createAccessLink(id, { liveId: liveId || undefined }),
    onSuccess: (data, vars) => {
      const directUrl = absoluteAppUrl(directAccessPath(data.token));
      const pinUrl = absoluteAppUrl(
        vars.liveId ? pinJoinPath(vars.liveId) : "/entrar",
      );
      setInvite({
        userId: vars.id,
        username: data.username,
        pin: "(el PIN es la contraseña del usuario)",
        liveId: vars.liveId,
        pinUrl,
        directUrl,
      });
      setLinkUserId(null);
      toast.success("Links generados");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "INACTIVE" }) =>
      usersApi.changeStatus(id, status),
    onSuccess: () => {
      toast.success("Estado actualizado");
      void qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const resetMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      usersApi.resetPassword(id, password),
    onSuccess: () => {
      toast.success("PIN / contraseña restablecida");
      setResetUserId(null);
      setNewPassword("");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const meta = listQuery.data?.meta;
  const rows = listQuery.data?.data ?? [];
  const lives = livesQuery.data?.data ?? [];

  return (
    <Can permission={PERMISSIONS.SYSTEM_ADMIN} fallback={<p>{t("common.noPermission")}</p>}>
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          title="Usuarios y participantes"
          subtitle="Crea jugadores y genera link con PIN o acceso directo"
          actions={
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>Crear participante</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nuevo participante</DialogTitle>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={createForm.handleSubmit((v) => createMutation.mutate(v))}
                >
                  <div className="space-y-2">
                    <Label>Usuario</Label>
                    <Input {...createForm.register("username")} />
                  </div>
                  <div className="space-y-2">
                    <Label>PIN de acceso (solo esto escribe el jugador)</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      {...createForm.register("password")}
                    />
                    <p className="text-xs font-semibold text-muted">
                      Debe ser único. El jugador entra en /entrar solo con este PIN.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Email (opcional)</Label>
                    <Input type="email" {...createForm.register("email")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sala / live (opcional)</Label>
                    <Select
                      value={createForm.watch("liveId") || "__none"}
                      onValueChange={(v) =>
                        createForm.setValue("liveId", v === "__none" ? "" : v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sin sala fija" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Sin sala fija</SelectItem>
                        {lives.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.title} ({l.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? t("common.loading") : "Crear y generar links"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
        >
          <Input
            placeholder={t("common.search")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary">
            {t("common.search")}
          </Button>
        </form>

        {listQuery.isLoading ? (
          <p>{t("common.loading")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Link
                      className="font-medium text-primary hover:underline"
                      to={`/users/${u.id}`}
                    >
                      {u.username}
                    </Link>
                  </TableCell>
                  <TableCell>{u.email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === "ACTIVE" ? "success" : "secondary"}>
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setLinkUserId(u.id);
                        setLinkLiveId("");
                      }}
                    >
                      Links
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={statusMutation.isPending}
                      onClick={() =>
                        statusMutation.mutate({
                          id: u.id,
                          status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                        })
                      }
                    >
                      {u.status === "ACTIVE" ? "Desactivar" : "Activar"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setResetUserId(u.id)}>
                      Reset PIN
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {meta && meta.pageCount > 1 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {meta.page} / {meta.pageCount}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= meta.pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}

        <Dialog open={!!resetUserId} onOpenChange={(o) => !o && setResetUserId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Restablecer PIN</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Nuevo PIN</Label>
              <Input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                disabled={resetMutation.isPending || newPassword.length < 4}
                onClick={() =>
                  resetUserId &&
                  resetMutation.mutate({ id: resetUserId, password: newPassword })
                }
              >
                {resetMutation.isPending ? t("common.loading") : t("common.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!linkUserId} onOpenChange={(o) => !o && setLinkUserId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generar links de acceso</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Sala (opcional)</Label>
              <Select
                value={linkLiveId || "__none"}
                onValueChange={(v) => setLinkLiveId(v === "__none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin sala fija" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Sin sala fija</SelectItem>
                  {lives.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                disabled={accessLinkMutation.isPending || !linkUserId}
                onClick={() =>
                  linkUserId &&
                  accessLinkMutation.mutate({
                    id: linkUserId,
                    liveId: linkLiveId || undefined,
                  })
                }
              >
                Generar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!invite} onOpenChange={(o) => !o && setInvite(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Links para {invite?.username}</DialogTitle>
            </DialogHeader>
            {invite && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-muted-bg p-3">
                  <p className="text-xs font-black uppercase text-muted">
                    Link con PIN (el usuario escribe su PIN)
                  </p>
                  <p className="mt-1 break-all font-mono text-sm font-bold">{invite.pinUrl}</p>
                  <p className="mt-2 text-xs font-semibold text-muted">
                    Nombre interno: <strong>{invite.username}</strong> · PIN:{" "}
                    <strong>{invite.pin}</strong>
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => void copyText("Link con PIN", invite.pinUrl)}
                  >
                    <Copy className="size-3.5" /> Copiar link PIN
                  </Button>
                </div>

                {invite.directUrl && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-black uppercase text-emerald-800">
                      Link directo (sin PIN)
                    </p>
                    <p className="mt-1 break-all font-mono text-sm font-bold text-foreground">
                      {invite.directUrl}
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2"
                      onClick={() => void copyText("Link directo", invite.directUrl!)}
                    >
                      <Copy className="size-3.5" /> Copiar link directo
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Can>
  );
}
