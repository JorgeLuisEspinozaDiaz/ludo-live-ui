import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gameConfigApi } from "@/api/resources";
import { Can } from "@/auth/Can";
import { PERMISSIONS } from "@/lib/permissions";
import { formatMoney } from "@/lib/money";
import { getErrorMessage } from "@/lib/errors";
import { t } from "@/i18n/es";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";

const schema = z.object({
  priceCents: z.number().int().min(0),
  prizeCents: z.number().int().min(0),
  slotsPerColor: z.number().int().min(1),
  pointsPerSol: z.number().int().min(0),
  centsPerRedeemUnit: z.number().int().min(1),
  minRedeemPoints: z.number().int().min(0),
  redeemPointsMultiple: z.number().int().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function GameConfigPage() {
  const qc = useQueryClient();

  const configQuery = useQuery({
    queryKey: ["game-config"],
    queryFn: () => gameConfigApi.get(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      priceCents: 0,
      prizeCents: 0,
      slotsPerColor: 1,
      pointsPerSol: 0,
      centsPerRedeemUnit: 100,
      minRedeemPoints: 0,
      redeemPointsMultiple: 1,
    },
  });
  const num = { valueAsNumber: true } as const;

  useEffect(() => {
    if (configQuery.data) {
      form.reset({
        priceCents: configQuery.data.priceCents,
        prizeCents: configQuery.data.prizeCents,
        slotsPerColor: configQuery.data.slotsPerColor,
        pointsPerSol: configQuery.data.pointsPerSol,
        centsPerRedeemUnit: configQuery.data.centsPerRedeemUnit,
        minRedeemPoints: configQuery.data.minRedeemPoints,
        redeemPointsMultiple: configQuery.data.redeemPointsMultiple,
      });
    }
  }, [configQuery.data, form]);

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => gameConfigApi.update(values),
    onSuccess: () => {
      toast.success("Configuración guardada");
      void qc.invalidateQueries({ queryKey: ["game-config"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const priceCents = form.watch("priceCents");
  const prizeCents = form.watch("prizeCents");

  return (
    <Can permission={PERMISSIONS.GAME_CONFIG} fallback={<p>{t("common.noPermission")}</p>}>
      <div className="mx-auto max-w-xl space-y-6">
        <PageHeader
          title="Configuración del juego"
          subtitle="Montos en céntimos (enteros)"
        />
        <Card>
          <CardContent className="pt-6">
            {configQuery.isLoading ? (
              <p>{t("common.loading")}</p>
            ) : (
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit((v) => updateMutation.mutate(v))}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Precio (céntimos)</Label>
                    <Input type="number" {...form.register("priceCents", num)} />
                    <p className="text-xs text-muted">{formatMoney(priceCents)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Premio (céntimos)</Label>
                    <Input type="number" {...form.register("prizeCents", num)} />
                    <p className="text-xs text-muted">{formatMoney(prizeCents)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Casillas / cupos por color</Label>
                    <Input type="number" {...form.register("slotsPerColor", num)} />
                    <p className="text-xs font-semibold text-muted">
                      Tope de cada color al crear una ronda nueva (ej. 50 = quedan
                      50/50 al iniciar).
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Puntos por sol</Label>
                    <Input type="number" {...form.register("pointsPerSol", num)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Céntimos por unidad de canje</Label>
                    <Input type="number" {...form.register("centsPerRedeemUnit", num)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Mínimo puntos canje</Label>
                    <Input type="number" {...form.register("minRedeemPoints", num)} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Múltiplo de canje</Label>
                    <Input type="number" {...form.register("redeemPointsMultiple", num)} />
                  </div>
                </div>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? t("common.loading") : t("common.save")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Can>
  );
}
