import { createResourceService } from "../../../api/createResourceService";
import type { EntityStatus } from "../../../types/enums";
import type { IUser } from "../interface/IUser";

const users = createResourceService<IUser>("users");

export const getAllUser = users.getAll;
export const getUserById = users.getById;
export const createUser = users.create;
export const updatedUser = users.update;
export const changeStatusUser = (id: string, status: EntityStatus) =>
  users.changeStatus(id, status);
export const deleteUser = users.remove;
