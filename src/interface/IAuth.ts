export interface IAuthRole {
  id: string;
  name: string;
}

export interface IAuthUser {
  id: string;
  username: string;
  email: string;
  tenantId: string;
  tenantSlug: string;
  role: IAuthRole;
}

export interface IAuthMenuPermission {
  code: string;
  description: string;
}

export interface IAuthMenuSection {
  id: string;
  name: string;
  permissions: IAuthMenuPermission[];
}

export interface IAuthMenu {
  id: string;
  name: string;
  sortOrder: number;
  sections: IAuthMenuSection[];
}

export interface IAuthSession {
  access_token: string;
  user: IAuthUser;
  permissions: string[];
  menus: IAuthMenu[];
}

export interface ILoginDto {
  username: string;
  password: string;
  tenant?: string;
}

export interface IBootstrapDto {
  tenantName: string;
  tenantSlug: string;
  username: string;
  password: string;
  email: string;
  adminName: string;
}

export type ILoginResponse = IAuthSession;
