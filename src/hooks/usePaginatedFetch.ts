import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_PAGINATION } from "../constants/constants";
import { extractPaginated } from "../helper/extractPaginated";
import { handleError } from "../helper/Funtions";
import type { IListParams, IPageMeta, IPaginatedResponse } from "../interface/IPaginated";

interface IUsePaginatedFetchProps<T> {
  fetcher: (params?: IListParams) => Promise<IPaginatedResponse<T> | T[] | unknown>;
  initialParams?: IListParams;
  key?: string | number;
}

const emptyMeta: IPageMeta = {
  page: 1,
  take: 10,
  itemCount: 0,
  pageCount: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export const CRUD_LIST_PARAMS: IListParams = { page: 1, take: 10 };

const normalizeParams = (params: Record<string, unknown> = {}): IListParams => {
  const page = Number(params.page ?? params.currentPage ?? params.actualPage ?? DEFAULT_PAGINATION.page);
  const take = Number(params.take ?? params.itemsPerPage ?? params.rowsPerPage ?? DEFAULT_PAGINATION.take);
  const search = typeof params.search === "string" ? params.search.trim() : "";

  const result: IListParams = {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    take: Number.isFinite(take) && take > 0 ? take : 10,
    itemsPerPage: Number.isFinite(take) && take > 0 ? take : 10,
    paginated: params.paginated === false ? false : true,
  };

  if (search) result.search = search;
  if (typeof params.status === "string" && params.status) {
    result.status = params.status as IListParams["status"];
  }
  if (typeof params.branchId === "string" && params.branchId) {
    result.branchId = params.branchId;
  }

  return result;
};

export function usePaginatedFetch<T>({
  fetcher,
  initialParams = CRUD_LIST_PARAMS,
  key = 0,
}: IUsePaginatedFetchProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<IPageMeta>(emptyMeta);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetchData = useCallback(async (params: Record<string, unknown> = {}) => {
    const paramsFull = normalizeParams({ ...CRUD_LIST_PARAMS, ...initialParams, ...params });
    setLoading(true);
    try {
      const response = await fetcherRef.current(paramsFull);
      const parsed = extractPaginated<T>(response);
      setData(Array.isArray(parsed.data) ? parsed.data : []);
      setPagination(parsed.meta ?? emptyMeta);
      return parsed;
    } catch (error) {
      handleError(error);
      setData([]);
      return { data: [] as T[], meta: emptyMeta };
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    let mounted = true;
    const paramsFull = normalizeParams({ ...CRUD_LIST_PARAMS, ...initialParams });
    setLoading(true);

    fetcherRef
      .current(paramsFull)
      .then((response) => {
        if (!mounted) return;
        const parsed = extractPaginated<T>(response);
        setData(Array.isArray(parsed.data) ? parsed.data : []);
        setPagination(parsed.meta ?? emptyMeta);
      })
      .catch((error) => {
        if (!mounted) return;
        handleError(error);
        setData([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [key]);

  return {
    data,
    pagination,
    loading,
    refresh: fetchData,
    handleChangeRegisterTable: fetchData,
  };
}
