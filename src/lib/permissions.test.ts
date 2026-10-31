import { describe, expect, it } from "vitest";
import { matchRoutePermissions, PERMISSIONS } from "./permissions";

describe("route permissions", () => {
  it("blocks admin routes for participants via required perms", () => {
    expect(matchRoutePermissions("/users")).toContain(PERMISSIONS.SYSTEM_ADMIN);
    expect(matchRoutePermissions("/lives/abc/studio")).toContain(PERMISSIONS.LIVE_MANAGE);
    expect(matchRoutePermissions("/audit")).toContain(PERMISSIONS.AUDIT_VIEW);
  });

  it("allows live view routes", () => {
    const perms = matchRoutePermissions("/lives/xyz");
    expect(perms).toContain(PERMISSIONS.LIVE_VIEW);
  });
});
