import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Can } from "@/auth/Can";
import { PERMISSIONS } from "@/lib/permissions";
import { getErrorMessage } from "@/lib/errors";
import { t } from "@/i18n/es";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";

type TenantConfig = Record<string, unknown>;

async function getTenantConfig(): Promise<TenantConfig> {
  const { data } = await api.get<TenantConfig>("/tenant/config");
  return data;
}

async function patchTenantConfig(body: TenantConfig): Promise<TenantConfig> {
  const { data } = await api.patch<TenantConfig>("/tenant/config", body);
  return data;
}

export default function ConfigPage() {
  const qc = useQueryClient();
  const [editText, setEditText] = useState<string | null>(null);

  const configQuery = useQuery({
    queryKey: ["tenant", "config"],
    queryFn: getTenantConfig,
  });

  const jsonText =
    editText ??
    (configQuery.data ? JSON.stringify(configQuery.data, null, 2) : "{}");

  const saveMutation = useMutation({
    mutationFn: () => {
      const parsed = JSON.parse(jsonText) as TenantConfig;
      return patchTenantConfig(parsed);
    },
    onSuccess: () => {
      toast.success("Configuración del tenant guardada");
      setEditText(null);
      void qc.invalidateQueries({ queryKey: ["tenant", "config"] });
    },
    onError: (e) => toast.error(getErrorMessage(e, "JSON inválido o error al guardar")),
  });

  return (
    <Can permission={PERMISSIONS.SYSTEM_ADMIN} fallback={<p>{t("common.noPermission")}</p>}>
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader
          title="Configuración del tenant"
          subtitle="GET/PATCH /tenant/config — edición JSON"
        />
        <Card>
          <CardContent className="space-y-4 pt-6">
            {configQuery.isLoading ? (
              <p>{t("common.loading")}</p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Config (JSON)</Label>
                  <textarea
                    className="min-h-[280px] w-full rounded-md border border-slate-200 bg-white p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
                    value={jsonText}
                    onChange={(e) => setEditText(e.target.value)}
                    spellCheck={false}
                  />
                </div>
                <Button
                  disabled={saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                >
                  {saveMutation.isPending ? t("common.loading") : t("common.save")}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Can>
  );
}
