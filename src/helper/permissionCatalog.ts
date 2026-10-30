import {
  Eye,
  KeyRound,
  List,
  Pencil,
  Plus,
  Settings,
  Shield,
  ToggleLeft,
  Trash2,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import permissionLabelsJson from "../app/sistema/data/permissionLabels.json";
import type { IPermission } from "../app/sistema/service/permission.service";

type ActionMeta = {
  label: string;
  description: string;
  icon: string;
  order: number;
};

type ResourceMeta = {
  singular?: string;
  plural?: string;
  listLabel?: string;
  detailLabel?: string;
  createLabel?: string;
  updateLabel?: string;
  deleteLabel?: string;
  statusLabel?: string;
  icon?: string;
};

type PathPlacement = {
  match: string;
  menu: string;
  module: string;
};

type LabelsConfig = {
  menuOrder: string[];
  moduleIcons: Record<string, string>;
  groupIcons: Record<string, string>;
  pathPlacement: PathPlacement[];
  resources: Record<string, ResourceMeta>;
  actions: Record<string, ActionMeta>;
  coarseLabels: Record<string, { label: string; description: string }>;
};

export type ResolvedPermissionAction = {
  key: string;
  code: string;
  label: string;
  description: string;
  icon: string;
  Icon: LucideIcon;
  order: number;
  permissionId?: string;
  available: boolean;
};

export type ResolvedPermissionModule = {
  id: string;
  label: string;
  icon: string;
  Icon: LucideIcon;
  actions: ResolvedPermissionAction[];
};

export type ResolvedPermissionGroup = {
  id: string;
  label: string;
  icon: string;
  Icon: LucideIcon;
  modules: ResolvedPermissionModule[];
};

const ICON_MAP: Record<string, LucideIcon> = {
  Eye,
  KeyRound,
  List,
  Pencil,
  Plus,
  Settings,
  Shield,
  ToggleLeft,
  Trash2,
  UsersRound,
};

const labelsConfig = permissionLabelsJson as LabelsConfig;

export const resolvePermissionIcon = (name?: string): LucideIcon => ICON_MAP[name ?? ""] ?? Shield;

export const getPermissionLabel = (code: string, fallback?: string) =>
  labelsConfig.coarseLabels[code]?.label || fallback || code;

export const getPermissionDescription = (code: string, fallback?: string) =>
  labelsConfig.coarseLabels[code]?.description || fallback || "";

const splitEndpoint = (raw: string) => {
  const idx = raw.indexOf(":");
  if (idx <= 0) return { method: "", path: raw.startsWith("/") ? raw : `/${raw}` };
  return {
    method: raw.slice(0, idx).toUpperCase(),
    path: raw.slice(idx + 1) || "/",
  };
};

const normalizePath = (path: string) => {
  const clean = path.split("?")[0] || "/";
  return clean.endsWith("/") && clean.length > 1 ? clean.slice(0, -1) : clean;
};

/** Extrae clave de recurso más específica disponible en el diccionario. */
const resolveResourceKey = (path: string): { key: string; meta: ResourceMeta } | null => {
  const normalized = normalizePath(path).replace(/^\/+/, "");
  const segments = normalized.split("/").filter(Boolean);
  const candidates: string[] = [];

  for (let i = segments.length; i >= 1; i--) {
    const slice = segments.slice(0, i);
    if (slice.some((s) => s.startsWith(":"))) {
      const withoutDynamic = slice.filter((s) => !s.startsWith(":"));
      if (withoutDynamic.length) candidates.push(withoutDynamic.join("/"));
      continue;
    }
    candidates.push(slice.join("/"));
  }

  for (const key of candidates) {
    if (labelsConfig.resources[key]) {
      return { key, meta: labelsConfig.resources[key] };
    }
  }
  return null;
};

const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const resolvePlacement = (
  path: string,
  fallbackMenu?: string,
  fallbackModule?: string
): { menu: string; module: string } | null => {
  const normalized = normalizePath(path);
  for (const rule of labelsConfig.pathPlacement ?? []) {
    if (new RegExp(rule.match, "i").test(normalized)) {
      return { menu: rule.menu, module: rule.module };
    }
  }
  if (fallbackMenu && fallbackModule) {
    return { menu: fallbackMenu, module: fallbackModule };
  }
  return null;
};

/** Clasifica un permiso de API en acción de UI con texto amigable. */
export function classifyPermissionAction(
  perm: IPermission
): Omit<ResolvedPermissionAction, "Icon" | "permissionId" | "available"> {
  const source = perm.endpoint || perm.code || "";
  const { method, path } = splitEndpoint(source);
  const pathNorm = normalizePath(path);
  const pathUpper = pathNorm.toUpperCase();
  const coarse = labelsConfig.coarseLabels[perm.code];
  const resource = resolveResourceKey(pathNorm);

  let key = "other";
  if (pathUpper.includes("CHANGE-STATUS") || pathUpper.includes("CHANGE_STATUS")) {
    key = "status";
  } else if (method === "DELETE") {
    key = "delete";
  } else if (method === "POST") {
    key = "create";
  } else if (method === "PATCH" || method === "PUT") {
    key = "update";
  } else if (method === "GET" && /\/:ID(\/|$)/i.test(pathNorm)) {
    key = "detail";
  } else if (method === "GET") {
    key = "list";
  } else if (/\.view$/i.test(perm.code)) {
    key = "view";
  } else if (/\.(edit|manage|use|admin)$/i.test(perm.code)) {
    key = "manage";
  }

  const meta = labelsConfig.actions[key] ?? labelsConfig.actions.other;
  const singular = resource?.meta.singular;
  const plural = resource?.meta.plural || singular;

  let label = coarse?.label || meta.label;
  let description = coarse?.description || perm.description || meta.description;

  if (!coarse) {
    switch (key) {
      case "list":
        label = resource?.meta.listLabel || (plural ? `Ver ${plural}` : meta.label);
        description = plural ? `Consultar el listado de ${plural}` : meta.description;
        break;
      case "detail":
        label = resource?.meta.detailLabel || (singular ? `Ver detalle de ${singular}` : meta.label);
        description = singular ? `Abrir la ficha de un ${singular}` : meta.description;
        break;
      case "create":
        label = resource?.meta.createLabel || (singular ? `Crear ${singular}` : meta.label);
        description = singular ? `Registrar un nuevo ${singular}` : meta.description;
        break;
      case "update":
        label = resource?.meta.updateLabel || (singular ? `Editar ${singular}` : meta.label);
        description = singular ? `Modificar datos de ${singular}` : meta.description;
        break;
      case "status":
        label = resource?.meta.statusLabel || (singular ? `Cambiar estado de ${singular}` : meta.label);
        description = singular ? `Activar o desactivar ${singular}` : meta.description;
        break;
      case "delete":
        label = resource?.meta.deleteLabel || (singular ? `Eliminar ${singular}` : meta.label);
        description = singular ? `Eliminar ${singular} del sistema` : meta.description;
        break;
      default:
        label = capitalize(perm.description || meta.label);
        break;
    }
  }

  return {
    key,
    code: perm.code,
    label,
    description,
    icon: resource?.meta.icon || meta.icon,
    order: meta.order,
  };
}

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Arma grupos/menús → módulos → acciones descriptivas desde el API. */
export function buildPermissionGroups(apiPermissions: IPermission[]): {
  groups: ResolvedPermissionGroup[];
  unmatched: IPermission[];
} {
  type ModuleBucket = {
    label: string;
    sortOrder: number;
    actions: ResolvedPermissionAction[];
  };
  type GroupBucket = {
    label: string;
    sortOrder: number;
    modules: Map<string, ModuleBucket>;
  };

  const groupsMap = new Map<string, GroupBucket>();
  const unmatched: IPermission[] = [];

  for (const perm of apiPermissions) {
    const source = perm.endpoint || perm.code || "";
    const { path } = splitEndpoint(source);
    const placement = resolvePlacement(
      path,
      perm.section?.menu?.name?.trim(),
      perm.section?.name?.trim()
    );

    if (!placement) {
      unmatched.push(perm);
      continue;
    }

    const { menu: menuName, module: sectionName } = placement;

    if (!groupsMap.has(menuName)) {
      const menuIdx = labelsConfig.menuOrder.indexOf(menuName);
      groupsMap.set(menuName, {
        label: menuName,
        sortOrder: menuIdx >= 0 ? menuIdx : 999,
        modules: new Map(),
      });
    }

    const group = groupsMap.get(menuName)!;
    if (!group.modules.has(sectionName)) {
      group.modules.set(sectionName, {
        label: sectionName,
        sortOrder: perm.section?.sortOrder ?? 999,
        actions: [],
      });
    }

    const classified = classifyPermissionAction(perm);
    group.modules.get(sectionName)!.actions.push({
      ...classified,
      Icon: resolvePermissionIcon(classified.icon),
      permissionId: perm.id,
      available: Boolean(perm.id),
    });
  }

  const groups: ResolvedPermissionGroup[] = [...groupsMap.entries()]
    .sort((a, b) => a[1].sortOrder - b[1].sortOrder || a[0].localeCompare(b[0]))
    .map(([menuName, group]) => {
      const groupIcon = labelsConfig.groupIcons[menuName] ?? "Shield";
      return {
        id: slugify(menuName) || menuName,
        label: group.label,
        icon: groupIcon,
        Icon: resolvePermissionIcon(groupIcon),
        modules: [...group.modules.entries()]
          .sort((a, b) => a[1].sortOrder - b[1].sortOrder || a[0].localeCompare(b[0]))
          .map(([sectionName, mod]) => {
            const moduleIcon = labelsConfig.moduleIcons[sectionName] ?? "Shield";
            return {
              id: slugify(sectionName) || sectionName,
              label: mod.label,
              icon: moduleIcon,
              Icon: resolvePermissionIcon(moduleIcon),
              actions: [...mod.actions].sort(
                (a, b) => a.order - b.order || a.label.localeCompare(b.label)
              ),
            };
          }),
      };
    });

  if (unmatched.length) {
    groups.push({
      id: "otros",
      label: "Otros",
      icon: "Shield",
      Icon: Shield,
      modules: [
        {
          id: "sin-modulo",
          label: "Sin módulo",
          icon: "Shield",
          Icon: Shield,
          actions: unmatched.map((perm) => {
            const classified = classifyPermissionAction(perm);
            return {
              ...classified,
              Icon: resolvePermissionIcon(classified.icon),
              permissionId: perm.id,
              available: Boolean(perm.id),
            };
          }),
        },
      ],
    });
  }

  return { groups, unmatched: [] };
}

export const collectGroupPermissionIds = (group: ResolvedPermissionGroup): string[] => {
  const ids = new Set<string>();
  for (const mod of group.modules) {
    for (const action of mod.actions) {
      if (action.permissionId) ids.add(action.permissionId);
    }
  }
  return [...ids];
};

export const collectModulePermissionIds = (mod: ResolvedPermissionModule): string[] => {
  const ids = new Set<string>();
  for (const action of mod.actions) {
    if (action.permissionId) ids.add(action.permissionId);
  }
  return [...ids];
};
