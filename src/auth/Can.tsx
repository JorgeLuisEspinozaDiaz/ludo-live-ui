import type { ReactNode } from "react";
import { usePermission } from "./use-permission";

type CanProps = {
  permission?: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({ permission, children, fallback = null }: CanProps) {
  const { hasPermission, hasAnyPermission } = usePermission();
  if (!permission) return <>{children}</>;
  const allowed = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
