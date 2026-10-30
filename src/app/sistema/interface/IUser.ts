import type { EntityStatus } from "../../../types/enums";

export interface IUser {
  id?: string;
  username: string;
  email?: string;
  password?: string;
  roleId: string;
  status?: EntityStatus;
  role?: { id?: string; name?: string };
}
