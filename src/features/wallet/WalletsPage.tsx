import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gameConfigApi, pointsApi, walletsApi } from "@/api/resources";
import { Can } from "@/auth/Can";
import { usePermission } from "@/auth/use-permission";
import { PERMISSIONS } from "@/lib/permissions";
import { formatMoney, visualStatusFromBackend } from "@/lib/money";
import { getErrorMessage } from "@/lib/errors";
import { t } from "@/i18n/es";
import { WalletBadge } from "@/components/game/WalletBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";

export default function WalletsPage() {
  const qc = useQueryClient();
  const { hasPermission } = usePermission();
  const [redeemPoints, setRedeemPoints] = useState("");
  const [page, setPage] = useState(1);

  const myWalletQuery = useQuery({
    queryKey: ["wallet", "me"],
    queryFn: () => walletsApi.me(),
  });

  const myPointsQuery = useQuery({
    queryKey: ["points", "me"],
    queryFn: () => pointsApi.me(),
  });

  const configQuery = useQuery({
    queryKey: ["game-config"],
    queryFn: () => gameConfigApi.get(),
  });

  const allWalletsQuery = useQuery({
    queryKey: ["wallets", page],
    queryFn: () => walletsApi.list({ page, take: 20 }),
    enabled: hasPermission(PERMISSIONS.WALLET_VIEW_ALL),
  });

  const redeemMutation = useMutation({
    mutationFn: (points: number) => pointsApi.redeem(points),
    onSuccess: () => {
      toast.success("Canje realizado");
      setRedeemPoints("");
      void qc.invalidateQueries({ queryKey: ["points", "me"] });
      void qc.invalidateQueries({ queryKey: ["wallet", "me"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const cfg = configQuery.data;
  const available = myPointsQuery.data?.balance ?? 0;
  const redeemNum = Math.trunc(Number(redeemPoints) || 0);
  const min = cfg?.minRedeemPoints ?? 0;
  const multiple = cfg?.redeemPointsMultiple ?? 1;
  const redeemValid =
    redeemNum >= min &&
    redeemNum <= available &&
    multiple > 0 &&
    redeemNum % multiple === 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Mochilas y puntos" />

      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">Mi mochila</TabsTrigger>
          <TabsTrigger value="points">{t("wallet.points")}</TabsTrigger>
          <Can permission={PERMISSIONS.WALLET_VIEW_ALL}>
            <TabsTrigger value="all">Todas</TabsTrigger>
          </Can>
        </TabsList>

        <TabsContent value="mine" className="space-y-4">
          {myWalletQuery.isLoading ? (
            <p>{t("common.loading")}</p>
          ) : myWalletQuery.data ? (
            <WalletBadge
              balanceCents={myWalletQuery.data.balanceCents}
              visualStatus={visualStatusFromBackend(
                myWalletQuery.data.visualStatus,
                myWalletQuery.data.balanceCents,
              )}
              className="text-lg"
            />
          ) : (
            <p>No se pudo cargar tu mochila.</p>
          )}
        </TabsContent>

        <TabsContent value="points" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("wallet.points")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-2xl font-bold tabular-nums">{available}</p>
              <Can permission={PERMISSIONS.POINTS_REDEEM}>
                <div className="max-w-sm space-y-3">
                  <div className="space-y-2">
                    <Label>Puntos a canjear</Label>
                    <Input
                      type="number"
                      min={min}
                      step={multiple}
                      value={redeemPoints}
                      onChange={(e) => setRedeemPoints(e.target.value)}
                    />
                    {cfg && (
                      <p className="text-xs text-muted">
                        Mínimo {min}, múltiplo de {multiple}. Disponible: {available}.
                      </p>
                    )}
                  </div>
                  <Button
                    disabled={!redeemValid || redeemMutation.isPending}
                    onClick={() => redeemMutation.mutate(redeemNum)}
                  >
                    {redeemMutation.isPending ? t("common.loading") : "Canjear"}
                  </Button>
                </div>
              </Can>
            </CardContent>
          </Card>
        </TabsContent>

        <Can permission={PERMISSIONS.WALLET_VIEW_ALL}>
          <TabsContent value="all">
            {allWalletsQuery.isLoading ? (
              <p>{t("common.loading")}</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(allWalletsQuery.data?.data ?? []).map((w) => (
                      <TableRow key={w.id}>
                        <TableCell>{w.username ?? w.userId}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatMoney(w.balanceCents)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(allWalletsQuery.data?.meta?.pageCount ?? 1) > 1 && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page >= (allWalletsQuery.data?.meta?.pageCount ?? 1)}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Can>
      </Tabs>
    </div>
  );
}
