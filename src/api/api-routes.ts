/**
 * Mapa tipado de rutas WOST API (Base: VITE_BASE_URL_API → http://localhost:3005)
 * Swagger: http://localhost:3005/api
 *
 * Solo identidad y acceso: auth, tenant, user, role, permission, menu, section.
 */
export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    bootstrap: "/auth/bootstrap",
    me: "/auth/me",
    refresh: "/auth/refresh",
  },
  users: "/users",
  roles: "/roles",
  permissions: "/permissions",
  menus: "/menus",
  sections: "/sections",
  tenant: {
    root: "/tenant",
    config: "/tenant/config",
  },
} as const;

export type ApiResourcePath =
  | typeof API_ROUTES.users
  | typeof API_ROUTES.roles
  | typeof API_ROUTES.permissions
  | typeof API_ROUTES.menus
  | typeof API_ROUTES.sections;
