import type { IPageMeta, IPaginatedResponse } from "../interface/IPaginated";

const emptyMeta: IPageMeta = {
  page: 1,
  take: 10,
  itemCount: 0,
  pageCount: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

/** Normaliza cualquier forma común de respuesta paginada del API */
export function extractPaginated<T>(payload: unknown): IPaginatedResponse<T> {
  if (Array.isArray(payload)) {
    return {
      data: payload as T[],
      meta: { ...emptyMeta, take: payload.length, itemCount: payload.length, pageCount: 1 },
    };
  }

  if (payload && typeof payload === "object") {
    const root = payload as Record<string, unknown>;

    if (Array.isArray(root.data)) {
      return {
        data: root.data as T[],
        meta: (root.meta as IPageMeta) ?? {
          ...emptyMeta,
          itemCount: (root.data as T[]).length,
          pageCount: 1,
          take: (root.data as T[]).length || 10,
        },
      };
    }

    if (root.data && typeof root.data === "object") {
      const nested = root.data as Record<string, unknown>;
      if (Array.isArray(nested.data)) {
        return {
          data: nested.data as T[],
          meta: (nested.meta as IPageMeta) ?? emptyMeta,
        };
      }
      if (Array.isArray(nested.items)) {
        return { data: nested.items as T[], meta: (nested.meta as IPageMeta) ?? emptyMeta };
      }
    }

    if (Array.isArray(root.items)) {
      return { data: root.items as T[], meta: (root.meta as IPageMeta) ?? emptyMeta };
    }
  }

  return { data: [], meta: emptyMeta };
}
