import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { livesApi } from "@/api/resources";
import { playPath } from "@/lib/player-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** Lista corta de lives para jugadores con link directo sin liveId fijo */
export default function PlayerHomePage() {
  const listQuery = useQuery({
    queryKey: ["lives", "player-home"],
    queryFn: () => livesApi.list({ take: 20, page: 1 }),
  });

  const lives = [...(listQuery.data?.data ?? [])].sort((a, b) => {
    const order = { LIVE: 0, SCHEDULED: 1, ENDED: 2 };
    return (order[a.status] ?? 9) - (order[b.status] ?? 9);
  });

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-2xl font-black text-amber-300">Elige una sala</h1>
        <p className="text-sm font-semibold text-white/55">
          Entras con tu cuenta de jugador
        </p>
      </div>

      {listQuery.isLoading ? (
        <p className="text-white/60">Cargando…</p>
      ) : lives.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
          No hay transmisiones. Pide al admin el link de la sala.
        </p>
      ) : (
        <ul className="space-y-2">
          {lives.map((live) => (
            <li
              key={live.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div>
                <p className="font-black text-white">{live.title}</p>
                <Badge
                  variant={live.status === "LIVE" ? "destructive" : "secondary"}
                  className="mt-1"
                >
                  {live.status}
                </Badge>
              </div>
              <Button asChild size="sm" className="bg-amber-400 font-black text-[#1a120b]">
                <Link to={playPath(live.id)}>Entrar</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
