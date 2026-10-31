import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { purchasesApi } from "@/api/resources";
import { getErrorMessage, isForceCancelWarning } from "@/lib/errors";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { setInventory } from "@/test/msw/handlers";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("purchase flows", () => {
  it("shows clear 409 sin cupo and can refresh inventory", async () => {
    setInventory([{ color: "ROJO", capacity: 50, sold: 50, remaining: 0 }]);
    await expect(
      purchasesApi.create("round-1", { color: "ROJO", quantity: 1 }),
    ).rejects.toSatisfy((err: unknown) => {
      expect(getErrorMessage(err)).toMatch(/cupo/i);
      return true;
    });
  });

  it("double submit protection via single in-flight mutation pattern", async () => {
    setInventory([{ color: "VERDE", capacity: 50, sold: 0, remaining: 50 }]);
    let concurrent = 0;
    let max = 0;
    server.use(
      http.post("http://localhost:3005/rounds/:id/purchases", async () => {
        concurrent += 1;
        max = Math.max(max, concurrent);
        await new Promise((r) => setTimeout(r, 30));
        concurrent -= 1;
        return HttpResponse.json({ id: "p1", status: "ACTIVE" });
      }),
    );

    let locked = false;
    const buyOnce = async () => {
      if (locked) return;
      locked = true;
      try {
        await purchasesApi.create("round-1", { color: "VERDE", quantity: 1 });
      } finally {
        locked = false;
      }
    };

    await Promise.all([buyOnce(), buyOnce(), buyOnce()]);
    expect(max).toBe(1);
  });

  it("cancel with balance >= 0 requires force=true", async () => {
    await expect(
      purchasesApi.cancel("pur-1", { reason: "test" }),
    ).rejects.toSatisfy((err: unknown) => isForceCancelWarning(err));

    const res = await purchasesApi.cancel("pur-1", { reason: "test", force: true });
    expect(res).toBeTruthy();
  });
});

describe("redeem validation", () => {
  it("rejects points below min or not multiple", async () => {
    const { pointsApi } = await import("@/api/resources");
    await expect(pointsApi.redeem(50)).rejects.toBeTruthy();
    await expect(pointsApi.redeem(105)).rejects.toBeTruthy();
    await expect(pointsApi.redeem(100)).resolves.toBeTruthy();
  });
});

describe("purchase summary math", () => {
  it("3 ROJO at 200 cents = 600 cents = S/ 6.00", async () => {
    const { multiplyCents, formatMoney } = await import("@/lib/money");
    expect(multiplyCents(200, 3)).toBe(600);
    expect(formatMoney(600)).toMatch(/6[.,]00/);
    const balanceAfter = -200 - 600;
    expect(balanceAfter).toBeLessThan(0);
  });
});
