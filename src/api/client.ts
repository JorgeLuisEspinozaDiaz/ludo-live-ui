import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getAccessToken, useSessionStore } from "@/auth/session-store";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3005";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

let refreshing: Promise<string | null> | null = null;

function isPlatformSession() {
  return Boolean(useSessionStore.getState().user?.isPlatformAdmin);
}

async function refreshAccessToken(): Promise<string | null> {
  const token = getAccessToken();
  if (!token) return null;
  if (isPlatformSession()) return null;
  try {
    const { data } = await axios.post<{ access_token: string }>(
      `${baseURL}/auth/refresh`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    useSessionStore.getState().setAccessToken(data.access_token);
    return data.access_token;
  } catch {
    useSessionStore.getState().clear();
    return null;
  }
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  const user = useSessionStore.getState().user;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (user?.tenantId && !user.isPlatformAdmin) {
    config.headers["x-tenant-id"] = user.tenantId;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      if (isPlatformSession()) {
        useSessionStore.getState().clear();
        if (!window.location.pathname.includes("/platform/login")) {
          window.location.href = "/platform/login";
        }
        return Promise.reject(error);
      }
      refreshing ??= refreshAccessToken().finally(() => {
        refreshing = null;
      });
      const newToken = await refreshing;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
