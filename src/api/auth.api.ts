import { api } from "./client";
import type { LoginResponse, MeResponse } from "@/auth/types";

export type LoginDto = {
  username: string;
  password: string;
  tenant?: string;
};

export type BootstrapDto = {
  tenantName: string;
  tenantSlug: string;
  username: string;
  password: string;
  email?: string;
  adminName?: string;
};

export type RedeemInviteResponse = LoginResponse & {
  liveId?: string | null;
};

export const authApi = {
  login: async (dto: LoginDto) => {
    const { data } = await api.post<LoginResponse>("/auth/login", dto);
    return data;
  },
  platformLogin: async (dto: { username: string; password: string }) => {
    const { data } = await api.post<LoginResponse>("/auth/platform/login", dto);
    return data;
  },
  loginPin: async (dto: { pin: string; tenant?: string }) => {
    const { data } = await api.post<LoginResponse>("/auth/login-pin", dto);
    return data;
  },
  bootstrap: async (dto: BootstrapDto) => {
    const { data } = await api.post("/auth/bootstrap", dto);
    return data;
  },
  redeemInvite: async (token: string) => {
    const { data } = await api.post<RedeemInviteResponse>("/auth/redeem-invite", {
      token,
    });
    return data;
  },
  me: async () => {
    const { data } = await api.get<MeResponse>("/auth/me");
    return data;
  },
  refresh: async () => {
    const { data } = await api.post<{ access_token: string }>("/auth/refresh");
    return data;
  },
};
