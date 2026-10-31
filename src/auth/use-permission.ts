import { useSessionStore } from "./session-store";

export function usePermission() {
  const hasPermission = useSessionStore((s) => s.hasPermission);
  const hasAnyPermission = useSessionStore((s) => s.hasAnyPermission);
  const permissions = useSessionStore((s) => s.permissions);
  return { hasPermission, hasAnyPermission, permissions };
}
