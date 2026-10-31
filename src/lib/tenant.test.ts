import { describe, expect, it } from "vitest";
import { getTenantSlugFromHost } from "./tenant";

describe("getTenantSlugFromHost", () => {
  it("lee el slug desde *.localhost", () => {
    expect(getTenantSlugFromHost("lupita-ludo.localhost")).toBe("lupita-ludo");
  });

  it("devuelve null en localhost plano", () => {
    expect(getTenantSlugFromHost("localhost")).toBeNull();
    expect(getTenantSlugFromHost("127.0.0.1")).toBeNull();
  });

  it("lee el slug en dominios de producción", () => {
    expect(getTenantSlugFromHost("lupita-ludo.example.com")).toBe("lupita-ludo");
  });

  it("ignora subdominios reservados", () => {
    expect(getTenantSlugFromHost("www.example.com")).toBeNull();
    expect(getTenantSlugFromHost("api.localhost")).toBeNull();
  });
});
