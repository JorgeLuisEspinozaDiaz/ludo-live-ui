import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";

/** Al reconectar el socket se debe volver a pedir estado completo. */
export function refetchLiveState(queryClient: QueryClient, roundId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["round", roundId] }),
    queryClient.invalidateQueries({ queryKey: ["inventory", roundId] }),
    queryClient.invalidateQueries({ queryKey: ["purchases", roundId] }),
    queryClient.invalidateQueries({ queryKey: ["wallet", "me"] }),
  ]);
}

describe("socket reconnect refetch", () => {
  it("invalidates round, inventory, purchases and wallet", async () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, "invalidateQueries");
    await refetchLiveState(qc, "round-1");
    expect(spy).toHaveBeenCalledTimes(4);
  });
});
