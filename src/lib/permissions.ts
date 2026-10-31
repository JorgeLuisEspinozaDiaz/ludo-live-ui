export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",
  SYSTEM_ADMIN: "system.admin",
  PLATFORM_ADMIN: "platform.admin",
  LIVE_MANAGE: "live.manage",
  LIVE_VIEW: "live.view",
  ROUND_MANAGE: "round.manage",
  ROUND_VIEW: "round.view",
  PROMO_MANAGE: "promo.manage",
  PURCHASE_CREATE: "purchase.create",
  PURCHASE_CANCEL: "purchase.cancel",
  WALLET_VIEW_OWN: "wallet.view.own",
  WALLET_VIEW_ALL: "wallet.view.all",
  WALLET_PAYMENT: "wallet.payment",
  WALLET_ADJUST: "wallet.adjust",
  POINTS_REDEEM: "points.redeem",
  POINTS_ADJUST: "points.adjust",
  HISTORY_VIEW: "history.view",
  HISTORY_EXPORT: "history.export",
  GAME_CONFIG: "game.config",
  AUDIT_VIEW: "audit.view",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Ruta → permisos requeridos (cualquiera). system.admin siempre pasa. */
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/dashboard": [PERMISSIONS.DASHBOARD_VIEW],
  "/lives": [PERMISSIONS.LIVE_VIEW, PERMISSIONS.LIVE_MANAGE],
  "/rounds": [PERMISSIONS.ROUND_VIEW, PERMISSIONS.ROUND_MANAGE],
  "/wallets": [PERMISSIONS.WALLET_VIEW_OWN, PERMISSIONS.WALLET_VIEW_ALL],
  "/wallets/payments": [PERMISSIONS.WALLET_PAYMENT],
  "/history": [PERMISSIONS.HISTORY_VIEW],
  "/game-config": [PERMISSIONS.GAME_CONFIG],
  "/audit": [PERMISSIONS.AUDIT_VIEW],
  "/users": [PERMISSIONS.SYSTEM_ADMIN],
  "/roles": [PERMISSIONS.SYSTEM_ADMIN],
  "/config": [PERMISSIONS.SYSTEM_ADMIN],
  "/platform/tenants": [PERMISSIONS.PLATFORM_ADMIN],
};

export function matchRoutePermissions(pathname: string): string[] | null {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (
    clean === "/" ||
    clean === "/403" ||
    clean === "/404" ||
    clean === "/login" ||
    clean === "/bootstrap" ||
    clean === "/platform/login" ||
    clean === "/entrar" ||
    clean.startsWith("/entrar/") ||
    clean.startsWith("/acceso/")
  ) {
    return null;
  }
  if (clean === "/jugar" || clean.startsWith("/jugar/")) {
    return [PERMISSIONS.LIVE_VIEW, PERMISSIONS.LIVE_MANAGE];
  }
  const entries = Object.entries(ROUTE_PERMISSIONS).sort((a, b) => b[0].length - a[0].length);
  for (const [route, perms] of entries) {
    if (clean === route || clean.startsWith(`${route}/`)) return perms;
  }
  if (clean.startsWith("/lives/")) {
    if (clean.endsWith("/studio")) return [PERMISSIONS.LIVE_MANAGE];
    return [PERMISSIONS.LIVE_VIEW, PERMISSIONS.LIVE_MANAGE];
  }
  return null;
}
