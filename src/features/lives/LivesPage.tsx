import { useState } from "react";
import { Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { livesApi } from "@/api/resources";
import { usePermission } from "@/auth/use-permission";
import { PERMISSIONS } from "@/lib/permissions";
import { getErrorMessage } from "@/lib/errors";
import { t } from "@/i18n/es";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export default function LivesPage() {
  const qc = useQueryClient();
  const { hasPermission } = usePermission();
  const canManage = hasPermission(PERMISSIONS.LIVE_MANAGE);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const listQuery = useQuery({
    queryKey: ["lives"],
    queryFn: () => livesApi.list({ take: 50, page: 1 }),
  });

  const createMutation = useMutation({
    mutationFn: () => livesApi.create({ title, description: description || undefined }),
    onSuccess: (live) => {
      toast.success("Transmisión creada");
      setCreateOpen(false);
      setTitle("");
      setDescription("");
      void qc.invalidateQueries({ queryKey: ["lives"] });
      if (canManage) {
        window.location.href = `/lives/${live.id}/studio`;
      }
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const lives = [...(listQuery.data?.data ?? [])].sort((a, b) => {
    const order = { LIVE: 0, SCHEDULED: 1, ENDED: 2 };
    return (order[a.status] ?? 9) - (order[b.status] ?? 9);
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Transmisiones"
        actions={
          canManage ? (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>Nueva transmisión</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear transmisión</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={createMutation.isPending || !title.trim()}
                  onClick={() => createMutation.mutate()}
                >
                  {createMutation.isPending ? t("common.loading") : "Crear"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          ) : undefined
        }
      />

      {listQuery.isLoading ? (
        <p>{t("common.loading")}</p>
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
                  <Button asChild size="sm" variant="outline">
                    <Link
                      to={
                        canManage
                          ? `/lives/${live.id}/studio`
                          : `/lives/${live.id}`
                      }
                    >
                      {canManage ? "Estudio" : "Ver"}
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
