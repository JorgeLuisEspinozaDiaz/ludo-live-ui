import { useState } from "react";
import { useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pointsApi, usersApi, walletsApi } from "@/api/resources";
import { Can } from "@/auth/Can";
import { PERMISSIONS } from "@/lib/permissions";
import {
  addCents,
  centsToNumber,
  formatMoney,
  solesToCents,
  visualStatusFromBackend,
} from "@/lib/money";
import { getErrorMessage } from "@/lib/errors";
import { t } from "@/i18n/es";
import { WalletBadge } from "@/components/game/WalletBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { PageHeader } from "@/components/PageHeader";

export default function UserDetailPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const [walletDialog, setWalletDialog] = useState(false);
  const [pointsDialog, setPointsDialog] = useState(false);
  const [walletSoles, setWalletSoles] = useState("");
  const [walletReason, setWalletReason] = useState("");
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsReason, setPointsReason] = useState("");

  const userQuery = useQuery({
    queryKey: ["user", id],
    queryFn: () => usersApi.get(id),
    enabled: !!id,
  });

  const walletQuery = useQuery({
    queryKey: ["wallet", "user", id],
    queryFn: () => walletsApi.byUser(id),
    enabled: !!id,
  });

  const movementsQuery = useQuery({
    queryKey: ["wallet", id, "movements"],
    queryFn: () => walletsApi.movements(id, { page: 1, take: 50 }),
    enabled: !!id,
  });

  const walletAdjustMutation = useMutation({
    mutationFn: () =>
      walletsApi.adjust(id, {
        amountCents: solesToCents(Number(walletSoles)),
        reason: walletReason,
      }),
    onSuccess: () => {
      toast.success("Ajuste aplicado");
      setWalletDialog(false);
      setWalletSoles("");
      setWalletReason("");
      void qc.invalidateQueries({ queryKey: ["wallet", "user", id] });
      void qc.invalidateQueries({ queryKey: ["wallet", id, "movements"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const pointsAdjustMutation = useMutation({
    mutationFn: () =>
      pointsApi.adjust(id, {
        amount: Math.trunc(Number(pointsAmount)),
        reason: pointsReason,
      }),
    onSuccess: () => {
      toast.success("Puntos ajustados");
      setPointsDialog(false);
      setPointsAmount("");
      setPointsReason("");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const user = userQuery.data;
  const wallet = walletQuery.data;
  const beforeCents = centsToNumber(wallet?.balanceCents);
  const deltaCents = walletSoles ? solesToCents(Number(walletSoles)) : 0;
  const afterCents = addCents(beforeCents, deltaCents);
  const movements = movementsQuery.data?.data ?? [];

  if (userQuery.isLoading) return <p className="text-foreground">{t("common.loading")}</p>;
  if (!user) return <p className="text-foreground">Usuario no encontrado</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title={user.username} backTo="/users" backLabel="Usuarios" />

      <Card>
        <CardContent className="space-y-2 pt-6 text-sm text-foreground">
          <p>
            <span className="text-muted">Email:</span> {user.email ?? "—"}
          </p>
          <p>
            <span className="text-muted">Estado:</span>{" "}
            <Badge variant={user.status === "ACTIVE" ? "success" : "secondary"}>
              {user.status}
            </Badge>
          </p>
          {user.role && (
            <p>
              <span className="text-muted">Rol:</span> {user.role.name}
            </p>
          )}
          {wallet && (
            <WalletBadge
              balanceCents={wallet.balanceCents}
              visualStatus={visualStatusFromBackend(wallet.visualStatus, wallet.balanceCents)}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Can permission={PERMISSIONS.WALLET_ADJUST}>
          <Button variant="outline" onClick={() => setWalletDialog(true)}>
            Ajustar mochila
          </Button>
        </Can>
        <Can permission={PERMISSIONS.POINTS_ADJUST}>
          <Button variant="outline" onClick={() => setPointsDialog(true)}>
            Ajustar puntos
          </Button>
        </Can>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos de mochila</CardTitle>
        </CardHeader>
        <CardContent>
          {movementsQuery.isLoading ? (
            <p>{t("common.loading")}</p>
          ) : movements.length === 0 ? (
            <p className="text-sm text-muted">Sin movimientos.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m, i) => {
                  const row = m as Record<string, unknown>;
                  return (
                    <TableRow key={String(row.id ?? i)}>
                      <TableCell>{String(row.type ?? row.kind ?? "—")}</TableCell>
                      <TableCell className="tabular-nums">
                        {row.amountCents != null
                          ? formatMoney(row.amountCents as number)
                          : "—"}
                      </TableCell>
                      <TableCell>{String(row.createdAt ?? "—")}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={walletDialog} onOpenChange={setWalletDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajuste de mochila</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Monto (S/, positivo o negativo)</Label>
              <Input
                type="number"
                step="0.01"
                value={walletSoles}
                onChange={(e) => setWalletSoles(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Input value={walletReason} onChange={(e) => setWalletReason(e.target.value)} />
            </div>
            <div className="rounded-lg border bg-slate-50 p-3 text-sm dark:bg-slate-900">
              <p>Antes: {formatMoney(beforeCents)}</p>
              <p>Después: {formatMoney(afterCents)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWalletDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              disabled={
                walletAdjustMutation.isPending ||
                !walletReason.trim() ||
                !walletSoles ||
                Number.isNaN(Number(walletSoles))
              }
              onClick={() => walletAdjustMutation.mutate()}
            >
              {walletAdjustMutation.isPending ? t("common.loading") : t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pointsDialog} onOpenChange={setPointsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajuste de puntos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cantidad (+/-)</Label>
              <Input
                type="number"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Input value={pointsReason} onChange={(e) => setPointsReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPointsDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              disabled={
                pointsAdjustMutation.isPending ||
                !pointsReason.trim() ||
                !pointsAmount ||
                Number.isNaN(Number(pointsAmount))
              }
              onClick={() => pointsAdjustMutation.mutate()}
            >
              {pointsAdjustMutation.isPending ? t("common.loading") : t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
