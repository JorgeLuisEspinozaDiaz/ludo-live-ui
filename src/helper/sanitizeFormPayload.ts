const SYSTEM_KEYS = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
  "tenantId",
  "deletedAt",
  "deletedBy",
]);

const RELATION_OBJECT_KEYS = new Set([
  "category",
  "brand",
  "unit",
  "role",
  "branch",
  "user",
  "client",
  "service",
  "staff",
  "area",
  "warehouse",
  "register",
  "session",
  "product",
  "permissions",
  "sections",
  "menus",
  "tenant",
  "bank",
]);

const isRelationObject = (value: unknown): boolean => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  return "id" in obj || "createdAt" in obj || "name" in obj;
};


export function sanitizeFormPayload<T extends object>(form: T): Partial<T> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(form as Record<string, unknown>)) {
    if (SYSTEM_KEYS.has(key)) continue;
    if (RELATION_OBJECT_KEYS.has(key)) continue;
    if (value === undefined) continue;
    if (isRelationObject(value)) continue;

    out[key] = value;
  }

  return out as Partial<T>;
}


export function coerceNumericFields(payload: Record<string, unknown>): Record<string, unknown> {
  const numericKeys =
    /^(salePrice|cost|stockMin|price|durationMin|commissionRate|commissionPercent|amount|openingAmount|countedAmount|qty|vipLevel|igvRate|seriesStart|seriesLength|currentNumber|balance|initialBalance)$/;

  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value)) && numericKeys.test(key)) {
      payload[key] = Number(value);
    }
  }
  return payload;
}
