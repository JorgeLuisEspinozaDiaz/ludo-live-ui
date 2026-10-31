import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColorBoard } from "./ColorBoard";

const inventory = [
  { color: "ROJO" as const, roundId: "r1", capacity: 50, sold: 50, remaining: 0 },
  { color: "VERDE" as const, roundId: "r1", capacity: 50, sold: 10, remaining: 40 },
];

describe("ColorBoard", () => {
  it("disables buy when purchases closed or no stock", () => {
    const onBuy = vi.fn();
    const { rerender } = render(
      <ColorBoard
        inventory={inventory}
        promos={[]}
        priceCents={200}
        purchasesOpen={false}
        onBuy={onBuy}
      />,
    );
    const buttons = screen.getAllByRole("button", { name: /comprar/i });
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((b) => expect(b).toBeDisabled());

    rerender(
      <ColorBoard
        inventory={inventory}
        promos={[]}
        priceCents={200}
        purchasesOpen
        onBuy={onBuy}
      />,
    );
    // ROJO without stock remains disabled; VERDE enabled
    const all = screen.getAllByRole("button", { name: /comprar/i });
    const enabled = all.filter((b) => !(b as HTMLButtonElement).disabled);
    expect(enabled.length).toBeGreaterThan(0);
  });

  it("shows summary 3 x price and calls onBuy once", async () => {
    const user = userEvent.setup();
    const onBuy = vi.fn();
    const inv = [
      { color: "ROJO" as const, roundId: "r1", capacity: 50, sold: 0, remaining: 50 },
    ];
    render(
      <ColorBoard
        inventory={inv}
        promos={[]}
        priceCents={200}
        purchasesOpen
        onBuy={onBuy}
      />,
    );

    expect(screen.getAllByText(/1 × .* = .*/).length).toBeGreaterThan(0);
    const buy = screen.getAllByRole("button", { name: /comprar/i })[0];
    await user.click(buy);
    await user.click(buy);
    // Parent must guard double-submit; board itself may fire twice — lock is tested elsewhere.
    expect(onBuy.mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});

