import axios from "axios";
import { toast } from "sonner";
import { STORAGE_KEYS } from "../constants/constants";
import { clearSession } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_API || "http://localhost:3005",
  headers: {
    "Content-Type": "application/json",
  },
});

if (import.meta.env.DEV) {
  console.info("[api] baseURL =", api.defaults.baseURL);
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const tenantId = localStorage.getItem(STORAGE_KEYS.TENANT_ID);

    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (tenantId) config.headers["x-tenant-id"] = tenantId;

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      error?.message ||
      "Error desconocido";

    if (status === 401) {
      clearSession();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      toast.error("Sesión expirada, vuelve a iniciar sesión.");
    } else if (status === 403) {
      toast.error("No tienes permiso para esta acción.");
    } else if (status === 400) {
      toast.error(typeof msg === "string" ? msg : "Solicitud inválida");
    }

    return Promise.reject(error);
  }
);

export default api;
