import { api } from "./client";

export type PlatformTenant = {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "INACTIVE";
  databaseName?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePlatformTenantDto = {
  tenantName: string;
  tenantSlug: string;
  username: string;
  password: string;
  email?: string;
  adminName?: string;
};

export type CreatePlatformTenantResult = {
  tenant: {
    id: string;
    name: string;
    slug: string;
    database?: string | null;
  };
  user: { id: string; username: string };
  message?: string;
};

export type PlatformTenantAdmin = {
  id: string;
  username: string;
  email?: string | null;
  status: "ACTIVE" | "INACTIVE";
  roleName?: string | null;
  createdAt?: string;
};

export const platformApi = {
  listAdmins: async (tenantId: string) => {
    const { data } = await api.get<PlatformTenantAdmin[]>(
      `/platform/tenants/${tenantId}/admins`,
    );
    return data;
  },
  resetAdminPassword: async (
    tenantId: string,
    userId: string,
    password: string,
  ) => {
    const { data } = await api.patch<{ ok: boolean }>(
      `/platform/tenants/${tenantId}/admins/${userId}/password`,
      { password },
    );
    return data;
  },
  listTenants: async (search?: string) => {
    const { data } = await api.get<PlatformTenant[]>("/platform/tenants", {
      params: search ? { search } : undefined,
    });
    return data;
  },
  getTenant: async (id: string) => {
    const { data } = await api.get<PlatformTenant>(`/platform/tenants/${id}`);
    return data;
  },
  createTenant: async (dto: CreatePlatformTenantDto) => {
    const { data } = await api.post<CreatePlatformTenantResult>(
      "/platform/tenants",
      dto,
    );
    return data;
  },
  updateTenant: async (id: string, dto: { name?: string; slug?: string }) => {
    const { data } = await api.patch<PlatformTenant>(
      `/platform/tenants/${id}`,
      dto,
    );
    return data;
  },
  changeStatus: async (id: string, status: "ACTIVE" | "INACTIVE") => {
    const { data } = await api.patch<PlatformTenant>(
      `/platform/tenants/${id}/status`,
      { status },
    );
    return data;
  },
};
