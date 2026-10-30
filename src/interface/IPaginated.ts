export interface IPageMeta {
  page: number;
  take: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface IPaginatedResponse<T> {
  data: T[];
  meta: IPageMeta;
}

/** Query común PaginationQueryDto (guía WOST) */
export interface IListParams {
  page?: number;
  /** Alias backend: take | itemsPerPage */
  take?: number;
  itemsPerPage?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
  branchId?: string;
  /** Si false, el API puede devolver array plano */
  paginated?: boolean;
  [key: string]: unknown;
}

/** Compatibilidad con tablas / paginación UI existente */
export interface IPaginated extends IPageMeta {
  itemsPerPage?: number;
  currentPage?: number;
  totalItems?: number;
  totalPages?: number;
  rowsPerPage?: number;
  search?: string;
  status?: string;
  branchId?: string;
  paginate?: boolean;
  pagination?: boolean;
  paginated?: boolean;
  actualPage?: number;
}
