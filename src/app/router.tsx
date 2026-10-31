import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthGuard, GuestGuard } from "./guards/AuthGuard";
import { AppShell } from "./layouts/AppShell";
import { PlayerShell } from "./layouts/PlayerShell";
import { PlatformShell } from "./layouts/PlatformShell";
import { ForbiddenPage } from "./pages/ForbiddenPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import LoginPage from "@/features/auth/LoginPage";
import BootstrapPage from "@/features/auth/BootstrapPage";
import PlatformLoginPage from "@/features/platform/PlatformLoginPage";
import TenantsPage from "@/features/platform/TenantsPage";
import TenantDetailPage from "@/features/platform/TenantDetailPage";
import JoinPinPage from "@/features/auth/JoinPinPage";
import AccessRedeemPage from "@/features/auth/AccessRedeemPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import UsersPage from "@/features/users/UsersPage";
import UserDetailPage from "@/features/users/UserDetailPage";
import LivesPage from "@/features/lives/LivesPage";
import LiveStudioPage from "@/features/lives/LiveStudioPage";
import LiveWatchPage from "@/features/lives/LiveWatchPage";
import LivePlayerPage from "@/features/lives/LivePlayerPage";
import PlayerHomePage from "@/features/lives/PlayerHomePage";
import RoundsPage from "@/features/rounds/RoundsPage";
import WalletsPage from "@/features/wallet/WalletsPage";
import PaymentsPage from "@/features/wallet/PaymentsPage";
import HistoryPage from "@/features/history/HistoryPage";
import HistoryDetailPage from "@/features/history/HistoryDetailPage";
import GameConfigPage from "@/features/game-config/GameConfigPage";
import AuditPage from "@/features/audit/AuditPage";
import RolesPage from "@/features/roles/RolesPage";
import ConfigPage from "@/features/config/ConfigPage";
import { useSessionStore } from "@/auth/session-store";
import { PERMISSIONS } from "@/lib/permissions";

function HomeRedirect() {
  const menus = useSessionStore((s) => s.menus);
  const has = useSessionStore((s) => s.hasPermission);

  // Jugador (sin menú admin / sin manage): arena
  const isPlayerOnly =
    has(PERMISSIONS.LIVE_VIEW) &&
    !has(PERMISSIONS.LIVE_MANAGE) &&
    !has(PERMISSIONS.SYSTEM_ADMIN);

  if (isPlayerOnly) return <Navigate to="/jugar" replace />;

  const first = menus
    .flatMap((m) => m.sections)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .find((s) => s.route)?.route;
  if (first) return <Navigate to={first} replace />;
  if (has(PERMISSIONS.LIVE_VIEW)) return <Navigate to="/lives" replace />;
  return <Navigate to="/dashboard" replace />;
}

export function AppRouter() {
  const basename = import.meta.env.VITE_BASE_URL_SERVIDOR || undefined;
  return (
    <BrowserRouter basename={basename || undefined}>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          }
        />
        <Route
          path="/bootstrap"
          element={
            <GuestGuard>
              <BootstrapPage />
            </GuestGuard>
          }
        />
        <Route
          path="/platform/login"
          element={
            <GuestGuard>
              <PlatformLoginPage />
            </GuestGuard>
          }
        />

        {/* Acceso jugador: PIN o link directo (públicos) */}
        <Route path="/entrar" element={<JoinPinPage />} />
        <Route path="/entrar/:liveId" element={<JoinPinPage />} />
        <Route path="/entrar/:liveId/p/:pin" element={<JoinPinPage />} />
        <Route path="/acceso/:token" element={<AccessRedeemPage />} />

        {/* Arena jugador (sin sidebar admin) */}
        <Route
          element={
            <AuthGuard>
              <PlayerShell />
            </AuthGuard>
          }
        >
          <Route path="jugar" element={<PlayerHomePage />} />
          <Route path="jugar/:liveId" element={<LivePlayerPage />} />
        </Route>

        {/* Administrador total (control plane) */}
        <Route
          element={
            <AuthGuard>
              <PlatformShell />
            </AuthGuard>
          }
        >
          <Route path="platform" element={<Navigate to="/platform/tenants" replace />} />
          <Route path="platform/tenants" element={<TenantsPage />} />
          <Route path="platform/tenants/:id" element={<TenantDetailPage />} />
        </Route>

        <Route
          element={
            <AuthGuard>
              <AppShell />
            </AuthGuard>
          }
        >
          <Route index element={<HomeRedirect />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="lives" element={<LivesPage />} />
          <Route path="lives/:liveId" element={<LiveWatchPage />} />
          <Route path="lives/:liveId/studio" element={<LiveStudioPage />} />
          <Route path="rounds" element={<RoundsPage />} />
          <Route path="rounds/:roundId" element={<RoundsPage />} />
          <Route path="wallets" element={<WalletsPage />} />
          <Route path="wallets/payments" element={<PaymentsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="history/:id" element={<HistoryDetailPage />} />
          <Route path="game-config" element={<GameConfigPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="config" element={<ConfigPage />} />
          <Route path="403" element={<ForbiddenPage />} />
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
