import { useEffect, useMemo, useState } from "react";
import { useCrudMaster } from "../../../hooks/useCrudMaster";
import {
  buildPermissionGroups,
  collectGroupPermissionIds,
  collectModulePermissionIds,
} from "../../../helper/permissionCatalog";
import type { IRole } from "../interface/IRole";
import { createRole, deleteRole, getAllRole, updatedRole } from "../service/role.service";
import { getAllPermission, type IPermission } from "../service/permission.service";

type RoleRow = IRole & { permissions?: Array<{ id?: string; code?: string }> };

export const UseRole = () => {
  const crud = useCrudMaster<IRole>({
    entityLabel: "Rol",
    initialForm: { name: "", description: "", permissionIds: [] },
    service: {
      getAll: getAllRole,
      create: createRole,
      update: updatedRole,
      remove: deleteRole,
    },
  });

  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [, tick] = useState(0);

  useEffect(() => {
    getAllPermission({ page: 1, take: 500, paginated: true })
      .then((res) => setPermissions(res.data ?? []))
      .catch(() => setPermissions([]));
  }, []);

  const { groups: permissionGroups } = useMemo(
    () => buildPermissionGroups(permissions),
    [permissions]
  );

  const selectedIds = (): string[] =>
    Array.isArray(crud.form.permissionIds) ? [...crud.form.permissionIds] : [];

  const setSelectedIds = (next: string[]) => {
    crud.form.permissionIds = [...new Set(next)];
    tick((n) => n + 1);
  };

  const togglePermission = (id: string) => {
    if (!id) return;
    const current = selectedIds();
    setSelectedIds(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  };

  const toggleIds = (ids: string[], checked: boolean) => {
    if (!ids.length) return;
    const current = new Set(selectedIds());
    if (checked) ids.forEach((id) => current.add(id));
    else ids.forEach((id) => current.delete(id));
    setSelectedIds([...current]);
  };

  const toggleAllPermissions = (checked: boolean) => {
    setSelectedIds(
      checked ? permissions.map((p) => p.id).filter((id): id is string => Boolean(id)) : []
    );
  };

  const toggleGroup = (groupId: string, checked: boolean) => {
    const group = permissionGroups.find((g) => g.id === groupId);
    if (!group) return;
    toggleIds(collectGroupPermissionIds(group), checked);
  };

  const toggleModule = (groupId: string, moduleId: string, checked: boolean) => {
    const group = permissionGroups.find((g) => g.id === groupId);
    const mod = group?.modules.find((m) => m.id === moduleId);
    if (!mod) return;
    toggleIds(collectModulePermissionIds(mod), checked);
  };

  const openEdit = (row: RoleRow) => {
    const fromRelation = Array.isArray(row.permissions)
      ? row.permissions.map((p) => p.id).filter((id): id is string => Boolean(id))
      : [];
    const permissionIds =
      Array.isArray(row.permissionIds) && row.permissionIds.length > 0 ? row.permissionIds : fromRelation;

    crud.openEdit({
      ...row,
      permissionIds,
    });
  };

  const openCreate = () => {
    crud.openCreate();
    crud.form.permissionIds = [];
    tick((n) => n + 1);
  };

  return {
    ...crud,
    openCreate,
    openEdit,
    permissions,
    permissionGroups,
    selectedPermissionIds: selectedIds(),
    togglePermission,
    toggleAllPermissions,
    toggleGroup,
    toggleModule,
  };
};
