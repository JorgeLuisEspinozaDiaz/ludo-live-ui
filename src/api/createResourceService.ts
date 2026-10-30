import type { EntityStatus } from "../types/enums";
import type { IListParams, IPaginatedResponse } from "../interface/IPaginated";
import { extractPaginated } from "../helper/extractPaginated";
import api from "./axiosInstance";

export const createResourceService = <T = unknown>(resource: string) => {
  const base = resource.replace(/^\/+|\/+$/g, "");

  return {
    getAll: async (params?: IListParams): Promise<IPaginatedResponse<T>> => {
      const res = await api.get(`/${base}`, { params });
      const parsed = extractPaginated<T>(res.data);
      return parsed;
    },
    getById: async (id: string): Promise<T> => {
      const res = await api.get<T>(`/${base}/${id}`);
      return res.data;
    },
    create: async (body: Partial<T>): Promise<T> => {
      const res = await api.post<T>(`/${base}`, body);
      return res.data;
    },
    update: async (id: string, body: Partial<T>): Promise<T> => {
      const res = await api.patch<T>(`/${base}/${id}`, body);
      return res.data;
    },
    changeStatus: async (id: string, status: EntityStatus): Promise<T> => {
      const res = await api.put<T>(`/${base}/${id}/change-status`, { status });
      return res.data;
    },
    remove: async (id: string): Promise<T> => {
      const res = await api.delete<T>(`/${base}/${id}`);
      return res.data;
    },
  };
};
