const RESERVED = new Set(["www", "app", "api", "admin", "platform", "localhost"]);

/**
 * Extrae el slug del tenant desde el host.
 * Ej: lupita-ludo.localhost:5173 → "lupita-ludo"
 *     lupita-ludo.midominio.com → "lupita-ludo"
 *     localhost:5173 → null
 */
export function getTenantSlugFromHost(hostname = window.location.hostname): string | null {
  const host = hostname.toLowerCase().split(":")[0];

  if (!host || host === "localhost" || host === "127.0.0.1" || host === "::1") {
    return null;
  }

  // *.localhost (desarrollo)
  if (host.endsWith(".localhost")) {
    const slug = host.slice(0, -".localhost".length);
    return slug && !RESERVED.has(slug) ? slug : null;
  }

  const parts = host.split(".").filter(Boolean);
  // tenant.dominio.tld → 3+ partes
  if (parts.length >= 3) {
    const slug = parts[0];
    return slug && !RESERVED.has(slug) ? slug : null;
  }

  return null;
}

/**
 * Origen del tenant para compartir con el cliente.
 * Dev: http://{slug}.localhost:5173
 * Prod: https://{slug}.{apex} (VITE_TENANT_BASE_DOMAIN o host actual)
 */
export function buildTenantOrigin(slug: string): string {
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : "";
  const host = window.location.hostname.toLowerCase();
  const envApex = (import.meta.env.VITE_TENANT_BASE_DOMAIN as string | undefined)?.trim();

  if (envApex) {
    return `${protocol}//${slug}.${envApex}${port}`;
  }

  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")) {
    return `${protocol}//${slug}.localhost${port}`;
  }

  const parts = host.split(".").filter(Boolean);
  if (parts.length >= 3) {
    const apex = parts.slice(1).join(".");
    return `${protocol}//${slug}.${apex}${port}`;
  }

  return `${protocol}//${slug}.${host}${port}`;
}

export function buildTenantLoginUrl(slug: string): string {
  const basename = (import.meta.env.VITE_BASE_URL_SERVIDOR || "").replace(/\/$/, "");
  return `${buildTenantOrigin(slug)}${basename}/login`;
}
