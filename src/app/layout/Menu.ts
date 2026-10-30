import { Shield, UsersRound, LayoutGrid, type LucideIcon } from "lucide-react";
import { PERMISSIONS } from "../../types/enums";

export interface MenuItemType {
  id: string;
  label: string;
  icon: LucideIcon;
  slug: string;
  permissions?: string[];
}

export interface MenuGroup {
  group: string;
  items: MenuItemType[];
}

export const menuGroups: MenuGroup[] = [
  {
    group: "PRINCIPAL",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutGrid,
        slug: "dashboard",
        permissions: [PERMISSIONS.SYSTEM_ADMIN, PERMISSIONS.STAFF_MANAGE],
      },
    ],
  },
  {
    group: "SISTEMA",
    items: [
      {
        id: "usuarios",
        label: "Usuarios",
        icon: UsersRound,
        slug: "sistema/usuarios",
        permissions: [PERMISSIONS.STAFF_MANAGE, PERMISSIONS.SYSTEM_ADMIN],
      },
      {
        id: "roles",
        label: "Roles",
        icon: Shield,
        slug: "sistema/roles",
        permissions: [PERMISSIONS.SYSTEM_ADMIN],
      },
    ],
  },
];
