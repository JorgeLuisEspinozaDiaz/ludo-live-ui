import { useQuery } from "@tanstack/react-query";
import { rolesApi } from "@/api/resources";
import { Can } from "@/auth/Can";
import { PERMISSIONS } from "@/lib/permissions";
import { t } from "@/i18n/es";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";

export default function RolesPage() {
  const listQuery = useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesApi.list({ paginated: false }),
  });

  const rows = listQuery.data?.data ?? [];

  return (
    <Can permission={PERMISSIONS.SYSTEM_ADMIN} fallback={<p>{t("common.noPermission")}</p>}>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title="Roles" />
        {listQuery.isLoading ? (
          <p>{t("common.loading")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Permisos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description ?? "—"}</TableCell>
                  <TableCell className="flex flex-wrap gap-1">
                    {(role.permissions ?? []).map((p) => (
                      <Badge key={p.id} variant="outline">
                        {p.code}
                      </Badge>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Can>
  );
}
