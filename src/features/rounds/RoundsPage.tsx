import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";

export default function RoundsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Rondas"
        subtitle="Las rondas se gestionan dentro de cada transmisión en vivo. No hay listado global independiente en el backend."
      />
      <Card>
        <CardContent className="pt-6">
          <Button asChild>
            <Link to="/lives">Ir a transmisiones</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
