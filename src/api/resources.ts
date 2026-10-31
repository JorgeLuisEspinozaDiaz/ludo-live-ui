import { api } from "./client";
import type { LudoColor } from "@/lib/colors";
import type { WalletVisualStatus } from "@/lib/money";

export type Paginated<T> = {
  data: T[];
  meta?: {
    page: number;
    take: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage?: boolean;
    hasNextPage?: boolean;
  };
};

export type ListParams = {
  page?: number;
  take?: number;
  search?: string;
  status?: string;
  paginated?: boolean;
};

export type WalletPublic = {
  id: string;
  userId: string;
  balanceCents: number;
  visualStatus: WalletVisualStatus;
  username?: string;
};

export type PointsWallet = {
  id: string;
  userId: string;
  balance: number;
};

export type Live = {
  id: string;
  title: string;
  description?: string | null;
  status: "SCHEDULED" | "LIVE" | "ENDED";
  scheduledAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  livekitRoom?: string | null;
};

export type Round = {
  id: string;
  liveId: string;
  status: "CREATED" | "PURCHASES_OPEN" | "PURCHASES_CLOSED" | "FINISHED" | "CANCELLED";
  priceCents: number;
  prizeCents: number;
  slotsPerColor: number;
  winnerColor?: LudoColor | null;
  finishedAt?: string | null;
  createdAt?: string;
};

export type ColorStock = {
  id?: string;
  roundId: string;
  color: LudoColor;
  capacity: number;
  sold: number;
  remaining?: number;
};

export type Promo = {
  id: string;
  roundId: string;
  color: LudoColor;
  slots: number;
  sold: number;
  multiplier: number;
  active: boolean;
};

export type Purchase = {
  id: string;
  roundId: string;
  userId: string;
  color: LudoColor;
  quantity: number;
  unitPriceCents: number;
  promoId?: string | null;
  multiplier?: number;
  pointsMultiplier?: number;
  status: "ACTIVE" | "CANCELLED";
  username?: string;
};

export type UserRow = {
  id: string;
  username: string;
  email?: string | null;
  status: "ACTIVE" | "INACTIVE";
  accessPin?: string | null;
  role?: { id: string; name: string };
  wallet?: WalletPublic;
};

export type GameConfig = {
  id?: string;
  priceCents: number;
  prizeCents: number;
  slotsPerColor: number;
  pointsPerSol: number;
  centsPerRedeemUnit: number;
  minRedeemPoints: number;
  redeemPointsMultiple: number;
};

export type Role = {
  id: string;
  name: string;
  description?: string | null;
  permissions?: { id: string; code: string; description?: string }[];
};

export type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  actorId?: string | null;
  reason?: string | null;
  beforeData?: unknown;
  afterData?: unknown;
  createdAt: string;
};

export type HistoryRound = {
  id: string;
  roundId: string;
  liveId?: string;
  winnerColor?: LudoColor | null;
  finishedAt?: string;
  snapshot?: unknown;
};

function toListParams(params?: ListParams) {
  return {
    page: params?.page ?? 1,
    take: params?.take ?? 20,
    search: params?.search,
    status: params?.status,
    paginated: params?.paginated ?? true,
  };
}

export const usersApi = {
  list: async (params?: ListParams) => {
    const { data } = await api.get<Paginated<UserRow> | UserRow[]>("/users", {
      params: toListParams(params),
    });
    return normalizePage(data);
  },
  participants: async (params?: ListParams) => {
    const { data } = await api.get<Paginated<UserRow> | UserRow[]>("/users/participants", {
      params: toListParams(params),
    });
    return normalizePage(data);
  },
  get: async (id: string) => {
    const { data } = await api.get<UserRow>(`/users/${id}`);
    return data;
  },
  createParticipant: async (body: {
    username: string;
    password: string;
    email?: string;
  }) => {
    const { data } = await api.post("/users/participants", body);
    return data;
  },
  update: async (id: string, body: Partial<{ username: string; email: string; roleId: string }>) => {
    const { data } = await api.patch(`/users/${id}`, body);
    return data;
  },
  changeStatus: async (id: string, status: "ACTIVE" | "INACTIVE") => {
    const { data } = await api.patch(`/users/${id}/change-status`, { status });
    return data;
  },
  resetPassword: async (id: string, password: string) => {
    const { data } = await api.post(`/users/${id}/reset-password`, { password });
    return data;
  },
  createAccessLink: async (
    id: string,
    body?: { liveId?: string; expiresInDays?: number },
  ) => {
    const { data } = await api.post<{
      token: string;
      username: string;
      liveId: string | null;
      expiresInDays: number;
    }>(`/users/${id}/access-link`, body ?? {});
    return data;
  },
};

export const livesApi = {
  list: async (params?: ListParams) => {
    const { data } = await api.get<Paginated<Live> | Live[]>("/lives", {
      params: toListParams(params),
    });
    return normalizePage(data);
  },
  get: async (id: string) => {
    const { data } = await api.get<Live>(`/lives/${id}`);
    return data;
  },
  create: async (body: { title: string; description?: string; scheduledAt?: string }) => {
    const { data } = await api.post<Live>("/lives", body);
    return data;
  },
  start: async (id: string) => {
    const { data } = await api.post<Live>(`/lives/${id}/start`);
    return data;
  },
  end: async (id: string) => {
    const { data } = await api.post<Live>(`/lives/${id}/end`);
    return data;
  },
  token: async (id: string) => {
    const { data } = await api.post<{ token: string; url?: string; roomName?: string }>(
      `/lives/${id}/token`,
    );
    return data;
  },
  participants: async (id: string) => {
    const { data } = await api.get(`/lives/${id}/participants`);
    return data;
  },
  viewers: async (id: string) => {
    const { data } = await api.get<{ liveId: string; viewers: number }>(
      `/lives/${id}/viewers`,
    );
    return data;
  },
};

export const roundsApi = {
  listByLive: async (liveId: string) => {
    const { data } = await api.get<Round[]>(`/lives/${liveId}/rounds`);
    return data;
  },
  create: async (
    liveId: string,
    body?: { priceCents?: number; prizeCents?: number; slotsPerColor?: number },
  ) => {
    const { data } = await api.post<Round>(`/lives/${liveId}/rounds`, body ?? {});
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get<Round>(`/rounds/${id}`);
    return data;
  },
  openPurchases: async (id: string) => {
    const { data } = await api.post<Round>(`/rounds/${id}/open-purchases`);
    return data;
  },
  closePurchases: async (id: string) => {
    const { data } = await api.post<Round>(`/rounds/${id}/close-purchases`);
    return data;
  },
  finish: async (id: string, winnerColor: LudoColor) => {
    const { data } = await api.post(`/rounds/${id}/finish`, { winnerColor });
    return data;
  },
  cancel: async (id: string, reason: string) => {
    const { data } = await api.post(`/rounds/${id}/cancel`, { reason });
    return data;
  },
  inventory: async (id: string) => {
    const { data } = await api.get<ColorStock[]>(`/rounds/${id}/inventory`);
    return data.map((s) => ({
      ...s,
      remaining: s.remaining ?? Math.max(0, s.capacity - s.sold),
    }));
  },
  wallets: async (id: string) => {
    const { data } = await api.get(`/rounds/${id}/wallets`);
    return data as Array<{
      userId: string;
      username?: string | null;
      colors: Record<string, number>;
      online?: boolean;
      pointsBalance?: number;
      wallet?: WalletPublic;
    }>;
  },
  purchases: async (id: string) => {
    const { data } = await api.get<Purchase[]>(`/rounds/${id}/purchases`);
    return data;
  },
};

export const purchasesApi = {
  create: async (roundId: string, body: { color: LudoColor; quantity: number; promoId?: string }) => {
    const { data } = await api.post<Purchase>(`/rounds/${roundId}/purchases`, body);
    return data;
  },
  cancel: async (id: string, body: { reason: string; force?: boolean }) => {
    const { data } = await api.post(`/purchases/${id}/cancel`, body);
    return data;
  },
  cancelUser: async (
    roundId: string,
    body: { userId: string; reason: string; force?: boolean },
  ) => {
    const { data } = await api.post(`/rounds/${roundId}/purchases/cancel-user`, body);
    return data;
  },
};

export const promosApi = {
  list: async (roundId: string) => {
    const { data } = await api.get<Promo[]>(`/rounds/${roundId}/promos`);
    return data;
  },
  create: async (
    roundId: string,
    body: { color: LudoColor; slots: number; multiplier: number },
  ) => {
    const { data } = await api.post<Promo>(`/rounds/${roundId}/promos`, body);
    return data;
  },
  update: async (promoId: string, body: { active?: boolean }) => {
    const { data } = await api.patch<Promo>(`/promos/${promoId}`, body);
    return data;
  },
};

export const walletsApi = {
  me: async () => {
    const { data } = await api.get<WalletPublic>("/wallets/me");
    return data;
  },
  list: async (params?: ListParams) => {
    const { data } = await api.get<Paginated<WalletPublic> | WalletPublic[]>("/wallets", {
      params: toListParams(params),
    });
    return normalizePage(data);
  },
  byUser: async (userId: string) => {
    const { data } = await api.get<WalletPublic>(`/wallets/${userId}`);
    return data;
  },
  movements: async (userId: string, params?: ListParams) => {
    const { data } = await api.get(`/wallets/${userId}/movements`, {
      params: toListParams(params),
    });
    return normalizePage(data as Paginated<unknown> | unknown[]);
  },
  payment: async (
    userId: string,
    body: { amountCents: number; method?: string; reference?: string; note?: string },
  ) => {
    const { data } = await api.post(`/wallets/${userId}/payments`, body);
    return data;
  },
  adjust: async (userId: string, body: { amountCents: number; reason: string }) => {
    const { data } = await api.post(`/wallets/${userId}/adjustments`, body);
    return data;
  },
};

export const pointsApi = {
  me: async () => {
    const { data } = await api.get<PointsWallet>("/points/me");
    return data;
  },
  redeem: async (points: number) => {
    const { data } = await api.post("/points/redeem", { points });
    return data;
  },
  adjust: async (userId: string, body: { amount: number; reason: string }) => {
    const { data } = await api.post(`/points/${userId}/adjust`, body);
    return data;
  },
};

export const gameConfigApi = {
  get: async () => {
    const { data } = await api.get<GameConfig>("/game-config");
    return data;
  },
  update: async (body: Partial<GameConfig>) => {
    const { data } = await api.patch<GameConfig>("/game-config", body);
    return data;
  },
};

export const historyApi = {
  list: async (params?: ListParams & { userId?: string; liveId?: string; from?: string; to?: string }) => {
    const { data } = await api.get<Paginated<HistoryRound> | HistoryRound[]>("/history/rounds", {
      params,
    });
    return normalizePage(data);
  },
  get: async (id: string) => {
    const { data } = await api.get(`/history/rounds/${id}`);
    return data;
  },
  exportCsv: async (params?: Record<string, string>) => {
    const { data } = await api.get("/history/rounds/export.csv", {
      params,
      responseType: "blob",
    });
    return data as Blob;
  },
};

export const auditApi = {
  list: async (params?: ListParams & { action?: string; entityType?: string }) => {
    const { data } = await api.get<Paginated<AuditLog> | AuditLog[]>("/audit", { params });
    return normalizePage(data);
  },
};

export const rolesApi = {
  list: async (params?: ListParams) => {
    const { data } = await api.get<Paginated<Role> | Role[]>("/roles", {
      params: toListParams(params),
    });
    return normalizePage(data);
  },
  get: async (id: string) => {
    const { data } = await api.get<Role>(`/roles/${id}`);
    return data;
  },
  create: async (body: { name: string; description?: string; permissionIds?: string[] }) => {
    const { data } = await api.post("/roles", body);
    return data;
  },
  update: async (
    id: string,
    body: Partial<{ name: string; description: string; permissionIds: string[] }>,
  ) => {
    const { data } = await api.patch(`/roles/${id}`, body);
    return data;
  },
};

export const permissionsApi = {
  list: async () => {
    const { data } = await api.get("/permissions", { params: { paginated: false } });
    return Array.isArray(data) ? data : (data as Paginated<{ id: string; code: string }>).data;
  },
};

export function normalizePage<T>(data: Paginated<T> | T[]): Paginated<T> {
  if (Array.isArray(data)) {
    return {
      data,
      meta: {
        page: 1,
        take: data.length,
        itemCount: data.length,
        pageCount: 1,
      },
    };
  }
  return data;
}
