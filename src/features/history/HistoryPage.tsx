import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { historyApi } from "@/api/resources";
import { Can } from "@/auth/Can";
import { PERMISSIONS } from "@/lib/permissions";
import { COLOR_TOKENS } from "@/lib/colors";
import { t } from "@/i18n/es";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { PageHeader } from "@/components/PageHeader";

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState("");
  const [liveId, setLiveId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filters, setFilters] = useState({ userId: "", liveId: "", from: "", to: "" });

  const listQuery = useQuery({
    queryKey: ["history", page, filters],
    queryFn: () =>
      historyApi.list({
        page,
        take: 20,
        userId: filters.userId || undefined,
        liveId: filters.liveId || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      }),
  });

  const exportCsv = async () => {
    try {
      const blob = await historyApi.exportCsv({
        userId: filters.userId,
        liveId: filters.liveId,
        from: filters.from,
        to: filters.to,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "historial-rondas.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const rows = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Historial de rondas"
        actions={
          <Can permission={PERMISSIONS.HISTORY_EXPORT}>
            <Button variant="outline" onClick={() => void exportCsv()}>
              Exportar CSV
            </Button>
          </Can>
        }
      />

      <form
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setFilters({ userId, liveId, from, to });
        }}
      >
        <div className="space-y-2">
          <Label>Usuario ID</Label>
          <Input value={userId} onChange={(e) => setUserId(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Live ID</Label>
          <Input value={liveId} onChange={(e) => setLiveId(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Desde</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Hasta</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button type="submit" className="sm:col-span-2 lg:col-span-4 w-fit">
          Filtrar
        </Button>
      </form>

      {listQuery.isLoading ? (
        <p>{t("common.loading")}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ronda</TableHead>
              <TableHead>Ganador</TableHead>
              <TableHead>Finalizada</TableHead>
              <TableHead className="text-right">Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.roundId}</TableCell>
                <TableCell>
                  {row.winnerColor
                    ? COLOR_TOKENS[row.winnerColor]?.label ?? row.winnerColor
                    : "—"}
                </TableCell>
                <TableCell>{row.finishedAt ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="ghost">
                    <Link to={`/history/${row.id}`}>Ver</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {meta && meta.pageCount > 1 && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm">
            {meta.page} / {meta.pageCount}
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
    </div>
  );
}
