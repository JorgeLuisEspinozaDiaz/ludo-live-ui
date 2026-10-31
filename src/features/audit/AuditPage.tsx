import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/api/resources";
import { Can } from "@/auth/Can";
import { PERMISSIONS } from "@/lib/permissions";
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
import { PageHeader } from "@/components/PageHeader";

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [filters, setFilters] = useState({ action: "", entityType: "" });

  const listQuery = useQuery({
    queryKey: ["audit", page, filters],
    queryFn: () =>
      auditApi.list({
        page,
        take: 30,
        action: filters.action || undefined,
        entityType: filters.entityType || undefined,
      }),
  });

  const rows = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;

  return (
    <Can permission={PERMISSIONS.AUDIT_VIEW} fallback={<p>{t("common.noPermission")}</p>}>
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader title="Auditoría" />

        <form
          className="flex flex-wrap gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setFilters({ action, entityType });
          }}
        >
          <div className="space-y-2">
            <Label>Acción</Label>
            <Input value={action} onChange={(e) => setAction(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tipo entidad</Label>
            <Input value={entityType} onChange={(e) => setEntityType(e.target.value)} />
          </div>
          <Button type="submit" className="self-end">
            Filtrar
          </Button>
        </form>

        {listQuery.isLoading ? (
          <p>{t("common.loading")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {new Date(log.createdAt).toLocaleString("es-PE")}
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    {log.entityType}
                    {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.actorId ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.reason ?? "—"}</TableCell>
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
    </Can>
  );
}
