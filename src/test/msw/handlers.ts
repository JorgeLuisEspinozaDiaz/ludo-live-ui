import { http, HttpResponse } from "msw";

const API = "http://localhost:3005";

export const adminMenus = [
  {
    id: "m1",
    name: "PRINCIPAL",
    sortOrder: 1,
    sections: [
      {
        id: "s1",
        name: "Dashboard",
        sortOrder: 1,
        route: "/dashboard",
        permissions: [{ code: "dashboard.view", description: "Ver dashboard" }],
      },
    ],
  },
  {
    id: "m2",
    name: "JUEGO",
    sortOrder: 2,
    sections: [
      {
        id: "s2",
        name: "Transmisiones",
        sortOrder: 1,
        route: "/lives",
        permissions: [{ code: "live.manage", description: "Gestionar" }],
      },
    ],
  },
];

export const participantMenus = [
  {
    id: "m2",
    name: "JUEGO",
    sortOrder: 2,
    sections: [
      {
        id: "s2",
        name: "Transmisiones",
        sortOrder: 1,
        route: "/lives",
        permissions: [{ code: "live.view", description: "Ver" }],
      },
      {
        id: "s3",
        name: "Mochilas",
        sortOrder: 3,
        route: "/wallets",
        permissions: [{ code: "wallet.view.own", description: "Ver" }],
      },
    ],
  },
];

let inventory = [
  { color: "ROJO", capacity: 50, sold: 48, remaining: 2 },
  { color: "VERDE", capacity: 50, sold: 0, remaining: 50 },
];

export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string };
    if (body.username === "admin") {
      return HttpResponse.json({
        access_token: "admin-token",
        user: {
          id: "u-admin",
          username: "admin",
          tenantId: "t1",
          tenantSlug: "demo",
          role: { id: "r1", name: "Administrador" },
        },
        permissions: ["system.admin", "dashboard.view", "live.manage", "live.view"],
        menus: adminMenus,
      });
    }
    if (body.username === "player") {
      return HttpResponse.json({
        access_token: "player-token",
        user: {
          id: "u-player",
          username: "player",
          tenantId: "t1",
          tenantSlug: "demo",
          role: { id: "r2", name: "Participante" },
        },
        permissions: [
          "live.view",
          "round.view",
          "purchase.create",
          "wallet.view.own",
          "points.redeem",
          "history.view",
        ],
        menus: participantMenus,
      });
    }
    return HttpResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
  }),

  http.post(`${API}/auth/refresh`, ({ request }) => {
    const auth = request.headers.get("Authorization");
    if (!auth) return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (auth.includes("expired")) {
      return HttpResponse.json({ access_token: "refreshed-token" });
    }
    return HttpResponse.json({ access_token: "refreshed-token" });
  }),

  http.get(`${API}/auth/me`, () =>
    HttpResponse.json({
      id: "u-admin",
      username: "admin",
      tenantId: "t1",
      role: { id: "r1", name: "Administrador" },
      permissions: ["system.admin"],
      menus: adminMenus,
    }),
  ),

  http.get(`${API}/wallets/me`, () =>
    HttpResponse.json({
      id: "w1",
      userId: "u-player",
      balanceCents: -200,
      visualStatus: "NEGATIVE",
    }),
  ),

  http.get(`${API}/points/me`, () =>
    HttpResponse.json({ id: "p1", userId: "u-player", balance: 450 }),
  ),

  http.get(`${API}/game-config`, () =>
    HttpResponse.json({
      priceCents: 200,
      prizeCents: 1000,
      slotsPerColor: 50,
      pointsPerSol: 10,
      centsPerRedeemUnit: 100,
      minRedeemPoints: 100,
      redeemPointsMultiple: 10,
    }),
  ),

  http.get(`${API}/rounds/:id/inventory`, () => HttpResponse.json(inventory)),

  http.post(`${API}/rounds/:id/purchases`, async ({ request }) => {
    const body = (await request.json()) as { color: string; quantity: number };
    const stock = inventory.find((i) => i.color === body.color);
    if (!stock || stock.remaining < body.quantity) {
      return HttpResponse.json({ message: "Sin cupo para este color" }, { status: 409 });
    }
    stock.sold += body.quantity;
    stock.remaining -= body.quantity;
    return HttpResponse.json({
      id: "pur-1",
      color: body.color,
      quantity: body.quantity,
      unitPriceCents: 200,
      status: "ACTIVE",
    });
  }),

  http.post(`${API}/purchases/:id/cancel`, async ({ request }) => {
    const body = (await request.json()) as { reason: string; force?: boolean };
    if (!body.force) {
      return HttpResponse.json(
        {
          message: "El saldo del usuario es >= 0. Confirme con force=true para cancelar.",
          warning: true,
          balanceCents: 500,
          userId: "u-player",
        },
        { status: 409 },
      );
    }
    return HttpResponse.json({ id: "pur-1", status: "CANCELLED" });
  }),

  http.post(`${API}/points/redeem`, async ({ request }) => {
    const body = (await request.json()) as { points: number };
    if (body.points < 100 || body.points % 10 !== 0) {
      return HttpResponse.json({ message: "Puntos inválidos" }, { status: 422 });
    }
    return HttpResponse.json({ points: body.points, wallet: { balanceCents: 1000 } });
  }),
];

export function setInventory(next: typeof inventory) {
  inventory = next;
}
