import { describe, expect, it } from "vitest";
import {
  formatMoney,
  multiplyCents,
  visualStatusClass,
  visualStatusFromBackend,
} from "./money";

describe("money helpers", () => {
  it("formats positive, zero and negative cents", () => {
    expect(formatMoney(123450)).toMatch(/1[.,]234[.,]50/);
    expect(formatMoney(0)).toMatch(/0[.,]00/);
    expect(formatMoney(-1200)).toMatch(/-?\s*S\/\.?\s*-?12[.,]00|-12[.,]00/);
  });

  it("multiplies cents without float", () => {
    expect(multiplyCents(200, 3)).toBe(600);
  });

  it("maps visual status colors", () => {
    expect(visualStatusFromBackend("NEGATIVE")).toBe("NEGATIVE");
    expect(visualStatusFromBackend("ZERO")).toBe("ZERO");
    expect(visualStatusFromBackend("POSITIVE")).toBe("POSITIVE");
    expect(visualStatusClass("NEGATIVE")).toContain("red");
    expect(visualStatusClass("POSITIVE")).toContain("emerald");
    expect(visualStatusClass("ZERO")).toContain("slate");
  });
});
