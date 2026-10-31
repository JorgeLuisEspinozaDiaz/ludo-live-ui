import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { livesApi, walletsApi } from "@/api/resources";
import { Can } from "@/auth/Can";
import { PERMISSIONS } from "@/lib/permissions";
import { formatMoney } from "@/lib/money";
import { t } from "@/i18n/es";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePermission } from "@/auth/use-permission";
import { PageHeader } from "@/components/PageHeader";

const LIVE_ORDER: Record<string, number> = { LIVE: 0, SCHEDULED: 1, ENDED: 2 };

export default function DashboardPage() {
  const { hasPermission } = usePermission();
  const canManageLive = hasPermission(PERMISSIONS.LIVE_MANAGE);

  const livesQuery = useQuery({
    queryKey: ["lives", "dashboard"],
    queryFn: () => livesApi.list({ take: 10, page: 1 }),
  });

  const walletsQuery = useQuery({
    queryKey: ["wallets", "dashboard"],
    queryFn: () => walletsApi.list({ take: 10, page: 1 }),
    enabled: hasPermission(PERMISSIONS.WALLET_VIEW_ALL),
  });

  const lives = [...(livesQuery.data?.data ?? [])].sort(
    (a, b) => (LIVE_ORDER[a.status] ?? 9) - (LIVE_ORDER[b.status] ?? 9),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Panel"
        subtitle="Resumen de transmisiones y mochilas"
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transmisiones</CardTitle>
            <CardDescription>En vivo primero</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/lives">Ver todas</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {livesQuery.isLoading ? (
            <p className="text-sm text-muted">{t("common.loading")}</p>
          ) : lives.length === 0 ? (
            <p className="text-sm text-muted">No hay transmisiones.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lives.map((live) => (
                  <TableRow key={live.id}>
                    <TableCell className="font-medium">{live.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          live.status === "LIVE"
                            ? "success"
                            : live.status === "ENDED"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {live.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link
                          to={
                            canManageLive && live.status === "LIVE"
                              ? `/lives/${live.id}/studio`
                              : `/lives/${live.id}`
                          }
                        >
                          Abrir
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Can permission={PERMISSIONS.WALLET_VIEW_ALL}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mochilas</CardTitle>
              <CardDescription>Últimos registros</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/wallets">Ver mochilas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {walletsQuery.isLoading ? (
              <p className="text-sm text-muted">{t("common.loading")}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(walletsQuery.data?.data ?? []).map((w) => (
                    <TableRow key={w.id}>
                      <TableCell>{w.username ?? w.userId}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(w.balanceCents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Can>
    </div>
  );
}
