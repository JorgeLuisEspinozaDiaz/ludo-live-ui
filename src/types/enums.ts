export type EntityStatus = "ACTIVE" | "INACTIVE";

export const PERMISSIONS = {
  STAFF_MANAGE: "staff.manage",
  SYSTEM_ADMIN: "system.admin",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
