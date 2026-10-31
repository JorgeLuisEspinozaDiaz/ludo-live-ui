import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { applyRealtimeEvent } from "./event-cache-map";

describe("realtime cache map", () => {
  it("inventory:updated invalidates inventory queries", () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, "invalidateQueries");
    applyRealtimeEvent(qc, "inventory:updated", { roundId: "r1" });
    expect(spy).toHaveBeenCalled();
  });

  it("round:finished invalidates round and wallet", () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, "invalidateQueries");
    applyRealtimeEvent(qc, "round:finished", {
      roundId: "r1",
      winnerColor: "ROJO",
    });
    expect(spy).toHaveBeenCalled();
  });
});
