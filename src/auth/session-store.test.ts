/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import { useSessionStore } from "./session-store";
import { adminMenus, participantMenus } from "@/test/msw/handlers";
import { authApi } from "@/api/auth.api";
import { server } from "@/test/msw/server";
import { beforeAll, afterAll, afterEach } from "vitest";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("login session", () => {
  beforeEach(() => {
    useSessionStore.getState().clear();
    localStorage.clear();
  });

  it("stores session, menus and permissions from login", async () => {
    const res = await authApi.login({ username: "admin", password: "x" });
    useSessionStore.getState().setFromLogin(res);
    const state = useSessionStore.getState();
    expect(state.accessToken).toBe("admin-token");
    expect(state.menus).toEqual(adminMenus);
    expect(state.hasPermission("system.admin")).toBe(true);
    expect(state.menus[0].sections[0].route).toBe("/dashboard");
  });

  it("participant does not get admin permissions", async () => {
    const res = await authApi.login({ username: "player", password: "x" });
    useSessionStore.getState().setFromLogin(res);
    const state = useSessionStore.getState();
    expect(state.menus).toEqual(participantMenus);
    expect(state.hasPermission("live.manage")).toBe(false);
    expect(state.hasPermission("system.admin")).toBe(false);
    expect(state.hasPermission("purchase.create")).toBe(true);
  });
});
