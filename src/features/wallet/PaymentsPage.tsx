import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { walletsApi } from "@/api/resources";
import { Can } from "@/auth/Can";
import { PERMISSIONS } from "@/lib/permissions";
import { formatMoney, solesToCents } from "@/lib/money";
import { getErrorMessage } from "@/lib/errors";
import { t } from "@/i18n/es";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";

export default function PaymentsPage() {
  const [userId, setUserId] = useState("");
  const [soles, setSoles] = useState("");
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const paymentMutation = useMutation({
    mutationFn: () =>
      walletsApi.payment(userId.trim(), {
        amountCents: solesToCents(Number(soles)),
        method: method.trim() || undefined,
        reference: reference.trim() || undefined,
        note: note.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Pago registrado");
      setSoles("");
      setMethod("");
      setReference("");
      setNote("");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const amountCents = soles ? solesToCents(Number(soles)) : 0;
  const valid =
    userId.trim().length > 0 && soles && !Number.isNaN(Number(soles)) && Number(soles) > 0;

  return (
    <Can permission={PERMISSIONS.WALLET_PAYMENT} fallback={<p>{t("common.noPermission")}</p>}>
      <div className="mx-auto max-w-lg space-y-6">
        <PageHeader
          title="Registrar pago"
          subtitle="Abono a la mochila de un participante"
        />
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>ID de usuario</Label>
              <Input value={userId} onChange={(e) => setUserId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Monto (S/)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={soles}
                onChange={(e) => setSoles(e.target.value)}
              />
              {valid && (
                <p className="text-xs text-muted">
                  Se registrarán {formatMoney(amountCents)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Método</Label>
              <Input value={method} onChange={(e) => setMethod(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Referencia</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nota</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button
              className="w-full"
              disabled={!valid || paymentMutation.isPending}
              onClick={() => paymentMutation.mutate()}
            >
              {paymentMutation.isPending ? t("common.loading") : "Registrar pago"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Can>
  );
}
