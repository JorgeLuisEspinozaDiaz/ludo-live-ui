import type { EntityStatus } from "../../../types/enums";

export interface IRole {
  id?: string;
  name: string;
  description?: string;
  permissionIds?: string[];
  permissions?: Array<{ id?: string; code?: string; description?: string }>;
  status?: EntityStatus;
}
