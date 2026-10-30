import { createResourceService } from "../../../api/createResourceService";
import type { EntityStatus } from "../../../types/enums";
import type { IRole } from "../interface/IRole";

const roles = createResourceService<IRole>("roles");

export const getAllRole = roles.getAll;
export const getRoleById = roles.getById;
export const createRole = roles.create;
export const updatedRole = roles.update;
export const changeStatusRole = (id: string, status: EntityStatus) =>
  roles.changeStatus(id, status);
export const deleteRole = roles.remove;
