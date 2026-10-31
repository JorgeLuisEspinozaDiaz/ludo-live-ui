import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function ForbiddenPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-black">403</h1>
      <p className="text-slate-600">No tienes permiso para ver esta página.</p>
      <Button asChild>
        <Link to="/">Volver</Link>
      </Button>
    </div>
  );
}
