import { Navigate, useLocation } from "react-router";
import { useSessionStore } from "@/auth/session-store";
import { matchRoutePermissions, PERMISSIONS } from "@/lib/permissions";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = useSessionStore((s) => s.accessToken);
  const user = useSessionStore((s) => s.user);
  const hasAnyPermission = useSessionStore((s) => s.hasAnyPermission);
  const isPlatform = Boolean(user?.isPlatformAdmin);
  const isPlatformRoute = location.pathname.startsWith("/platform");

  if (!token) {
    const toPlayer =
      location.pathname === "/jugar" || location.pathname.startsWith("/jugar/");
    const to =
      isPlatformRoute || toPlayer
        ? isPlatformRoute
          ? "/platform/login"
          : "/entrar"
        : "/login";
    return <Navigate to={to} replace state={{ from: location }} />;
  }

  // Sesión plataforma solo en /platform/*
  if (isPlatform && !isPlatformRoute) {
    return <Navigate to="/platform/tenants" replace />;
  }
  // Sesión tenant no entra a consola platform
  if (!isPlatform && isPlatformRoute) {
    return <Navigate to="/platform/login" replace />;
  }

  const required = matchRoutePermissions(location.pathname);
  if (required && !hasAnyPermission(required)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const token = useSessionStore((s) => s.accessToken);
  const menus = useSessionStore((s) => s.menus);
  const user = useSessionStore((s) => s.user);
  const has = useSessionStore((s) => s.hasPermission);

  if (token) {
    if (user?.isPlatformAdmin) {
      return <Navigate to="/platform/tenants" replace />;
    }
    const isPlayerOnly =
      has(PERMISSIONS.LIVE_VIEW) &&
      !has(PERMISSIONS.LIVE_MANAGE) &&
      !has(PERMISSIONS.SYSTEM_ADMIN);
    if (isPlayerOnly) return <Navigate to="/jugar" replace />;
    const first =
      menus
        .flatMap((m) => m.sections)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .find((s) => s.route)?.route ?? "/dashboard";
    return <Navigate to={first} replace />;
  }
  return <>{children}</>;
}
