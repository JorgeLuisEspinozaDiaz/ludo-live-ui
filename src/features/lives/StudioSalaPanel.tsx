import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Link2, Trash2, UserPlus } from "lucide-react";
import { usersApi, type UserRow } from "@/api/resources";
import { getErrorMessage } from "@/lib/errors";
import {
  absoluteAppUrl,
  personalPinPath,
  pinJoinPath,
} from "@/lib/player-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

async function copyOneClick(label: string, text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  } catch {
    toast.message(label, { description: text });
  }
}

type StudioSalaPanelProps = {
  liveId: string;
};

export function StudioSalaPanel({ liveId }: StudioSalaPanelProps) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");

  const usersQuery = useQuery({
    queryKey: ["users", "studio-sala"],
    queryFn: () => usersApi.list({ take: 100, page: 1 }),
  });

  const participants = (usersQuery.data?.data ?? []).filter(
    (u) =>
      u.status === "ACTIVE" &&
      (u.role?.name?.toLowerCase().includes("particip") || Boolean(u.accessPin)),
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      const username = name.trim();
      const accessPin = (pin.trim() || Math.random().toString().slice(2, 8)).slice(
        0,
        12,
      );
      if (username.length < 2) throw new Error("Nombre muy corto");
      if (accessPin.length < 4) throw new Error("PIN mínimo 4 caracteres");
      const user = (await usersApi.createParticipant({
        username,
        password: accessPin,
      })) as UserRow;
      return {
        user: { ...user, accessPin },
        personalUrl: absoluteAppUrl(personalPinPath(liveId, accessPin)),
      };
    },
    onSuccess: (bundle) => {
      toast.success(`Usuario ${bundle.user.username} creado`);
      setName("");
      setPin("");
      void qc.invalidateQueries({ queryKey: ["users"] });
      void copyOneClick("Link personal", bundle.personalUrl);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => usersApi.changeStatus(id, "INACTIVE"),
    onSuccess: () => {
      toast.success("Usuario desactivado");
      void qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const genericUrl = absoluteAppUrl(pinJoinPath(liveId));

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden p-3">
      <div className="rounded-xl border border-dashed border-border bg-muted-bg p-3">
        <p className="text-[11px] font-black uppercase tracking-wide text-muted">
          Link genérico (cada uno escribe su PIN)
        </p>
        <p className="mt-1 break-all font-mono text-xs font-bold text-foreground">
          {genericUrl}
        </p>
        <Button
          type="button"
          size="sm"
          className="mt-2 w-full"
          variant="secondary"
          onClick={() => void copyOneClick("Link genérico", genericUrl)}
        >
          <Copy className="size-3.5" />
          Copiar link genérico
        </Button>
      </div>

      <form
        className="grid grid-cols-[1fr_auto_auto] gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
      >
        <Input
          placeholder="Nombre (ej: Jorge)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10"
        />
        <Input
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="h-10 w-24"
          inputMode="numeric"
        />
        <Button type="submit" size="sm" className="h-10" disabled={createMutation.isPending}>
          <UserPlus className="size-4" />
          Crear
        </Button>
      </form>
      <p className="text-[11px] font-semibold text-muted">
        PIN vacío = se genera al azar · al crear se copia el link personal
      </p>

      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {usersQuery.isLoading ? (
          <li className="text-sm text-muted">Cargando…</li>
        ) : participants.length === 0 ? (
          <li className="rounded-xl border border-border bg-muted-bg px-3 py-6 text-center text-sm font-semibold text-muted">
            Aún no hay jugadores. Crea el primero arriba.
          </li>
        ) : (
          participants.map((u) => {
            const personal = u.accessPin
              ? absoluteAppUrl(personalPinPath(liveId, u.accessPin))
              : absoluteAppUrl(pinJoinPath(liveId));
            return (
              <li
                key={u.id}
                className="rounded-xl border border-border bg-white p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-black text-foreground">{u.username}</p>
                    <p className="text-xs font-bold text-muted">
                      PIN{" "}
                      <span className="font-mono text-foreground">
                        {u.accessPin ?? "—"}
                      </span>
                    </p>
                    <p className="mt-1 break-all font-mono text-[11px] font-semibold text-muted">
                      {personal}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    activo
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => void copyOneClick("Link personal", personal)}
                  >
                    <Copy className="size-3.5" />
                    Copiar link
                  </Button>
                  {u.accessPin ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void copyOneClick("PIN", u.accessPin!)}
                    >
                      <Link2 className="size-3.5" />
                      Copiar PIN
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-danger"
                    disabled={deactivateMutation.isPending}
                    onClick={() => deactivateMutation.mutate(u.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
