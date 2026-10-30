import type { IRouterStructure } from "../../../interface/IRouter";
import { RoleScreen } from "../views/RoleScreen";
import { UserScreen } from "../views/UserScreen";

const prefix = "sistema";

export const RouterSistema: IRouterStructure[] = [
  { path: `${prefix}/usuarios`, element: UserScreen, isPublic: false },
  { path: `${prefix}/roles`, element: RoleScreen, isPublic: false },
];
