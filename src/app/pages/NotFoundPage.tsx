import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-black">404</h1>
      <p className="text-slate-600">Página no encontrada.</p>
      <Button asChild>
        <Link to="/">Ir al inicio</Link>
      </Button>
    </div>
  );
}
