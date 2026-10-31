import axios from "axios";

export type ApiErrorBody = {
  message?: string | string[];
  detail?: string;
  warning?: boolean;
  balanceCents?: number;
  userId?: string;
  statusCode?: number;
};

export function getErrorMessage(error: unknown, fallback = "Error inesperado"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    const msg = data?.message ?? data?.detail;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string" && msg.trim()) return msg;
    if (error.response?.status === 403) return "No tienes permiso para esta acción";
    if (error.response?.status === 401) return "Sesión expirada";
    if (error.response?.status === 409) return msg || "Conflicto con el estado actual";
    if (error.response?.status === 422) return msg || "Datos inválidos";
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function getApiErrorBody(error: unknown): ApiErrorBody | null {
  if (axios.isAxiosError(error) && error.response?.data) {
    return error.response.data as ApiErrorBody;
  }
  return null;
}

export function isForceCancelWarning(error: unknown): boolean {
  const body = getApiErrorBody(error);
  return Boolean(body?.warning) && axios.isAxiosError(error) && error.response?.status === 409;
}
