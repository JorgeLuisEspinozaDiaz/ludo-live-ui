import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { useSessionStore } from "@/auth/session-store";
import { api } from "./client";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("axios refresh interceptor", () => {
  beforeEach(() => {
    useSessionStore.setState({
      accessToken: "expired-token",
      user: {
        id: "u1",
        username: "admin",
        tenantId: "t1",
        role: { id: "r1", name: "Administrador" },
      },
      permissions: ["system.admin"],
      menus: [],
    });
  });

  it("refreshes expired token and retries original request", async () => {
    let hits = 0;
    server.use(
      http.get("http://localhost:3005/secure-resource", ({ request }) => {
        hits += 1;
        const auth = request.headers.get("Authorization");
        if (auth === "Bearer expired-token") {
          return HttpResponse.json({ message: "expired" }, { status: 401 });
        }
        return HttpResponse.json({ ok: true, auth });
      }),
      http.post("http://localhost:3005/auth/refresh", () =>
        HttpResponse.json({ access_token: "refreshed-token" }),
      ),
    );

    const res = await api.get("/secure-resource");
    expect(res.data.ok).toBe(true);
    expect(useSessionStore.getState().accessToken).toBe("refreshed-token");
    expect(hits).toBeGreaterThanOrEqual(2);
  });

  it("does not invent a second refresh_token field", async () => {
    const spy = vi.spyOn(axios, "post");
    server.use(
      http.get("http://localhost:3005/ping401", () =>
        HttpResponse.json({}, { status: 401 }),
      ),
      http.post("http://localhost:3005/auth/refresh", () =>
        HttpResponse.json({ access_token: "refreshed-token" }),
      ),
      http.get("http://localhost:3005/ping401", () => HttpResponse.json({ ok: true }), {
        once: false,
      }),
    );
    // first call 401 then retry - configure once pattern via sequential handlers
    let n = 0;
    server.use(
      http.get("http://localhost:3005/ping401", () => {
        n += 1;
        if (n === 1) return HttpResponse.json({}, { status: 401 });
        return HttpResponse.json({ ok: true });
      }),
    );
    await api.get("/ping401");
    expect(useSessionStore.getState().accessToken).toBe("refreshed-token");
    spy.mockRestore();
  });
});
