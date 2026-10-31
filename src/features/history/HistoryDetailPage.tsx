import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { historyApi } from "@/api/resources";
import { COLOR_TOKENS } from "@/lib/colors";
import { t } from "@/i18n/es";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";

export default function HistoryDetailPage() {
  const { id = "" } = useParams();

  const detailQuery = useQuery({
    queryKey: ["history", id],
    queryFn: () => historyApi.get(id),
    enabled: !!id,
  });

  const data = detailQuery.data as Record<string, unknown> | undefined;

  if (detailQuery.isLoading) return <p className="text-foreground">{t("common.loading")}</p>;
  if (!data) return <p className="text-foreground">Registro no encontrado</p>;

  const winner = data.winnerColor as string | undefined;
  const snapshot = data.snapshot;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Detalle de ronda" backTo="/history" backLabel="Historial" />
      <Card>
        <CardContent className="space-y-3 pt-6 text-sm text-foreground">
          <p>
            <span className="text-muted">ID historial:</span> {String(data.id ?? id)}
          </p>
          <p>
            <span className="text-muted">Ronda:</span> {String(data.roundId ?? "—")}
          </p>
          <p>
            <span className="text-muted">Live:</span> {String(data.liveId ?? "—")}
          </p>
          <p>
            <span className="text-muted">Ganador:</span>{" "}
            {winner && winner in COLOR_TOKENS
              ? COLOR_TOKENS[winner as keyof typeof COLOR_TOKENS].label
              : winner ?? "—"}
          </p>
          <p>
            <span className="text-muted">Finalizada:</span>{" "}
            {String(data.finishedAt ?? "—")}
          </p>
          {snapshot != null && (
            <pre className="max-h-96 overflow-auto rounded-lg border bg-slate-50 p-3 text-xs dark:bg-slate-900">
              {JSON.stringify(snapshot, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
