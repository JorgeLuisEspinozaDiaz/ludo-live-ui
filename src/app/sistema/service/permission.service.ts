import { createResourceService } from "../../../api/createResourceService";
import { API_ROUTES } from "../../../api/api-routes";

export interface IPermissionSection {
  id?: string;
  name?: string;
  sortOrder?: number;
  menuId?: string;
  menu?: {
    id?: string;
    name?: string;
    sortOrder?: number;
  };
}

export interface IPermission {
  id?: string;
  code: string;
  description: string;
  endpoint?: string;
  sectionId?: string;
  section?: IPermissionSection | null;
}

const resource = createResourceService<IPermission>(API_ROUTES.permissions.replace(/^\//, ""));

export const getAllPermission = resource.getAll;
export const getPermissionById = resource.getById;
export const createPermission = resource.create;
export const updatedPermission = resource.update;
export const deletePermission = resource.remove;
