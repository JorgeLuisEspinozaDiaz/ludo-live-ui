# Ludo Live UI

Frontend de la plataforma de **rondas de Ludo en vivo** con apuestas por colores. Se integra con el backend NestJS multi-tenant (`ludo-live-core`).

## Stack

- React 19 + TypeScript + Vite
- React Router (guards por permiso)
- TanStack Query + Zustand
- Tailwind CSS + componentes estilo shadcn
- React Hook Form + Zod
- socket.io-client (`/live`) + LiveKit
- Axios (JWT + refresh)
- Vitest + Testing Library + MSW + Playwright
- Docker (nginx)

## Arranque

```bash
cp .env.example .env.development
pnpm install
pnpm gen:api          # genera tipos desde Swagger (o openapi.json local)
pnpm dev              # http://localhost:5173
```

Backend esperado: `http://localhost:3005` (Swagger `/api`, OpenAPI `/api-json`).

### Variables

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | Base REST |
| `VITE_SOCKET_URL` | Base Socket.IO (namespace `/live`) |
| `VITE_LIVEKIT_URL` | URL del servidor LiveKit |
| `VITE_BASE_URL_SERVIDOR` | Basename opcional del router |

## Generar API

```bash
pnpm gen:api
# o con archivo local:
# curl http://localhost:3005/api-json -o openapi.json && pnpm gen:api:file
```

Tipos en `src/api/generated/schema.d.ts`. El cliente tipado de dominio está en `src/api/resources.ts` y `src/api/auth.api.ts`.

## Administración de tenants

La consola del administrador total está en `/platform/login`: registro de tenants, URLs de acceso, credenciales y activación/inactivación.

Credenciales y guía operativa: `ADMIN-CONFIDENCIAL.md` (local, no versionado). Si no lo tienes, pídelo al responsable del proyecto.

## Flujo de una ronda

1. Admin crea transmisión → `/lives` → Estudio
2. Inicia live → crea ronda (copia `game-config`) → abre compras
3. Participante entra a `/lives/:id`, compra colores
4. Admin cierra compras → declara ganador → liquidación
5. Admin registra pagos externos → participante canjea puntos en `/wallets`

## Menú dinámico

El sidebar se arma con `menus[].sections[].route` del login/`/me`. No hardcodear ítems de negocio.

## Permisos UI

- `<Can permission="...">` y `usePermission()`
- `AuthGuard` + `matchRoutePermissions` → `/403`
- El backend sigue siendo la autoridad (403/409/422)

## Dinero

API en **céntimos**. Usar `formatMoney` / `multiplyCents` de `src/lib/money.ts`. Sin aritmética float ni updates optimistas en compras/pagos/canjes.

## Tiempo real

`SocketProvider` + `RealtimeBridge` invalidan/parchean la caché de TanStack Query. Al reconectar: `joinLive` + refetch de ronda/inventario/compras/wallet.

## Tests

```bash
pnpm test           # unit + integración MSW
pnpm test:e2e       # Playwright (requiere E2E_LIVE=1 y stack arriba)
```

## Docker

```bash
docker compose build frontend
docker compose up frontend
```

## Pendientes del backend

- No hay `refresh_token` separado; refresh usa el access JWT actual.
- Bootstrap no autentica; hay que hacer login después.
- No existe `GET /dashboard` agregado.
- `POINTS_REDEEM` / `PURCHASE_*` / `PROMO_MANAGE` / `WALLET_ADJUST` no tienen sección propia en `NAV_CATALOG` (acciones vía `<Can>` / pestaña en mochila).
- `GET /auth/me` no incluye `tenantSlug` (se conserva del login).
- Historial de movimientos propios puede requerir `wallet.view.all`; verificar contrato.
- Sin endpoint de cambio de contraseña de perfil documentado.
