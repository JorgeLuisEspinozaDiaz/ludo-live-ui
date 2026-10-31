import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthMenu, AuthUser, LoginResponse, MeResponse } from "./types";
import { PERMISSIONS } from "@/lib/permissions";

type SessionState = {
  accessToken: string | null;
  user: AuthUser | null;
  permissions: string[];
  menus: AuthMenu[];
  setFromLogin: (res: LoginResponse) => void;
  patchFromMe: (res: MeResponse) => void;
  setAccessToken: (token: string) => void;
  clear: () => void;
  hasPermission: (code: string) => boolean;
  hasAnyPermission: (codes: string[]) => boolean;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      permissions: [],
      menus: [],
      setFromLogin: (res) =>
        set({
          accessToken: res.access_token,
          user: res.user,
          permissions: res.permissions ?? [],
          menus: res.menus ?? [],
        }),
      patchFromMe: (res) => {
        const prev = get().user;
        set({
          user: {
            id: res.id,
            username: res.username,
            email: res.email,
            tenantId: res.tenantId,
            tenantSlug: prev?.tenantSlug,
            role: res.role,
          },
          permissions: res.permissions ?? [],
          menus: res.menus ?? [],
        });
      },
      setAccessToken: (token) => set({ accessToken: token }),
      clear: () =>
        set({
          accessToken: null,
          user: null,
          permissions: [],
          menus: [],
        }),
      hasPermission: (code) => {
        const perms = get().permissions;
        if (perms.includes(PERMISSIONS.PLATFORM_ADMIN)) {
          return code === PERMISSIONS.PLATFORM_ADMIN;
        }
        if (perms.includes(PERMISSIONS.SYSTEM_ADMIN)) return true;
        return perms.includes(code);
      },
      hasAnyPermission: (codes) => {
        if (!codes.length) return true;
        return codes.some((c) => get().hasPermission(c));
      },
    }),
    {
      name: "ludo-session",
      partialize: (s) => ({
        accessToken: s.accessToken,
        user: s.user,
        permissions: s.permissions,
        menus: s.menus,
      }),
    },
  ),
);

export const getAccessToken = () => useSessionStore.getState().accessToken;
