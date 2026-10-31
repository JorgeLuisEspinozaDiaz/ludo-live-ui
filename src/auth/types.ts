export type AuthRole = { id: string; name: string };

export type AuthUser = {
  id: string;
  username: string;
  email?: string | null;
  tenantId: string | null;
  tenantSlug?: string | null;
  role: AuthRole;
  isPlatformAdmin?: boolean;
};

export type AuthMenuPermission = {
  id?: string;
  code: string;
  description: string;
};

export type AuthMenuSection = {
  id: string;
  name: string;
  sortOrder: number;
  route?: string;
  permissions: AuthMenuPermission[];
};

export type AuthMenu = {
  id: string;
  name: string;
  sortOrder: number;
  sections: AuthMenuSection[];
};

export type LoginResponse = {
  access_token: string;
  user: AuthUser;
  permissions: string[];
  menus: AuthMenu[];
};

export type MeResponse = {
  id: string;
  username: string;
  email?: string | null;
  tenantId: string;
  role: AuthRole;
  permissions: string[];
  menus: AuthMenu[];
};
