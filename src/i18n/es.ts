export const es = {
  appName: "Ludo Live",
  login: {
    title: "Iniciar sesión",
    tenant: "Tenant",
    username: "Usuario",
    password: "Contraseña",
    submit: "Entrar",
    bootstrapLink: "Crear primer tenant",
  },

  bootstrap: {
    title: "Bootstrap",
    tenantName: "Nombre del tenant",
    tenantSlug: "Slug",
    submit: "Crear e ir a login",
  },
  common: {
    loading: "Cargando…",
    save: "Guardar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    search: "Buscar",
    actions: "Acciones",
    noPermission: "Sin permiso",
    connected: "Conectado",
    disconnected: "Desconectado",
    logout: "Cerrar sesión",
  },
  round: {
    purchasesOpen: "Compras abiertas",
    purchasesClosed: "Compras cerradas",
    created: "Ronda creada",
    finished: "Ronda finalizada",
    winner: "Ganó {color}",
  },
  purchase: {
    buy: "Comprar",
    summary: "{qty} × {unit} = {total}",
    negativeWarn: "Tu saldo quedará negativo",
    noStock: "Sin cupo",
  },
  wallet: {
    balance: "Mochila",
    points: "Puntos",
  },
  toasts: {
    purchasesOpened: "Se abrieron las compras",
    purchasesClosed: "Se cerraron las compras",
    walletUpdated: "Tu saldo cambió",
    roundFinished: "La ronda terminó",
    liveStarted: "La transmisión comenzó",
    liveEnded: "La transmisión terminó",
  },
} as const;

export type EsDict = typeof es;

export function t(
  path: string,
  vars?: Record<string, string | number>,
): string {
  const parts = path.split(".");
  let cur: unknown = es;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  let text = typeof cur === "string" ? cur : path;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}
