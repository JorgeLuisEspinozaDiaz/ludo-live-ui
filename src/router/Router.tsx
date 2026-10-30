import { RouterSistema } from "../app/sistema/router";
import type { IRouterStructure } from "../interface/IRouter";
import { DashboardScreen } from "../views/dashboard/DashboardScreen";
import { NotFound } from "../views/not-found/NotFound";
import { LoginScreen } from "../views/auth/LoginScreen";

const rutaServidor = import.meta.env.VITE_BASE_URL_SERVIDOR || "";

export const RouterMain: IRouterStructure[] = [
  { path: `${rutaServidor}/login`, element: LoginScreen, isPublic: true },
  ...RouterSistema.map((dt) => ({ ...dt, path: `${rutaServidor}/${dt.path}` })),
  { path: `${rutaServidor}/dashboard`, element: DashboardScreen, isPublic: false },
  { path: `${rutaServidor}/`, element: DashboardScreen, isPublic: false },
  { path: `${rutaServidor}/404`, element: NotFound, isPublic: false },
  { path: `${rutaServidor}/*`, element: NotFound, isPublic: false },
];
