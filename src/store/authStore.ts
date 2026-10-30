import { computed, signal } from "@preact/signals-react";
import { STORAGE_KEYS } from "../constants/constants";
import { localStorageHelper } from "../helper/localStorageHelper";
import type { IAuthSession, ILoginResponse } from "../interface/IAuth";
import { PERMISSIONS } from "../types/enums";

const readSession = (): IAuthSession | null => {
  const session = localStorageHelper.get(STORAGE_KEYS.SESSION) as IAuthSession | undefined;
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (!session?.access_token || !token) return null;
  return session;
};

export const authSession = signal<IAuthSession | null>(readSession());

export const isAuthenticated = computed(() => Boolean(authSession.value?.access_token));

export const currentUser = computed(() => authSession.value?.user ?? null);

export const currentPermissions = computed(() => authSession.value?.permissions ?? []);

export const setSession = (response: ILoginResponse) => {
  const session: IAuthSession = {
    access_token: response.access_token,
    user: response.user,
    permissions: response.permissions ?? [],
    menus: response.menus ?? [],
  };

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, session.access_token);
  localStorage.setItem(STORAGE_KEYS.TENANT_ID, session.user.tenantId);
  localStorageHelper.set(STORAGE_KEYS.SESSION, session);
  authSession.value = session;
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.TENANT_ID);
  localStorageHelper.remove(STORAGE_KEYS.SESSION);
  localStorageHelper.remove(STORAGE_KEYS.BRANCH);
  authSession.value = null;
};

export const hasPermission = (code: string): boolean => {
  const permissions = authSession.value?.permissions ?? [];
  if (permissions.includes(PERMISSIONS.SYSTEM_ADMIN)) return true;
  return permissions.includes(code);
};

export const hasAnyPermission = (codes: string[]): boolean => {
  if (!codes.length) return true;
  return codes.some((code) => hasPermission(code));
};
