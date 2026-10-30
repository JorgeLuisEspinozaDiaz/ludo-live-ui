import type { IListParams } from "../interface/IPaginated";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  TENANT_ID: "tenantId",
  SESSION: "auth_session",
  /** @deprecated sucursales eliminadas; se limpia en logout */
  BRANCH: "auth_branch",
} as const;

/** @deprecated usar STORAGE_KEYS */
export const TENANT_KEYS = {
  TENANT: "TENANT",
  TENANTID: STORAGE_KEYS.TENANT_ID,
  TENANTNAME: "TENANTNAME",
} as const;

/** @deprecated usar STORAGE_KEYS */
export const LOCALSTORAGEKEY = {
  AUTH: STORAGE_KEYS.SESSION,
  SELECT_OFFICE: "SELECT_OFFICE",
  OFFICE: "OFFICE",
} as const;

export const DEFAULT_PAGINATION: IListParams = {
  page: 1,
  take: 10,
};

export const INITVALIDATEFORMULATION = { active: false, data: [] };
export const INITPROGRESSVALUE = { validate: 0, total: 0, data: [], dataKey: [] };
