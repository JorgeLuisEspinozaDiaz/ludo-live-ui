import { hasAnyPermission, hasPermission } from "../store/authStore";

export const permissions = (slug: string): boolean => hasPermission(slug);

export const permissionsAny = (codes: string[]): boolean => hasAnyPermission(codes);

export { hasPermission, hasAnyPermission };
