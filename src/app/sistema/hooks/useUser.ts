import { useEffect, useState } from "react";
import { useCrudMaster } from "../../../hooks/useCrudMaster";
import type { IUser } from "../interface/IUser";
import {
  changeStatusUser,
  createUser,
  deleteUser,
  getAllUser,
  updatedUser,
} from "../service/user.service";
import { getAllRole } from "../service/role.service";
import type { IRole } from "../interface/IRole";

const userService = {
  getAll: getAllUser,
  create: createUser,
  update: updatedUser,
  changeStatus: changeStatusUser,
  remove: deleteUser,
};

export const UseUser = () => {
  const crud = useCrudMaster<IUser>({
    entityLabel: "Usuario",
    initialForm: { status: "ACTIVE" },
    service: userService,
  });

  const [roles, setRoles] = useState<IRole[]>([]);

  useEffect(() => {
    getAllRole({ page: 1, take: 100, paginated: true }).then((res) => {
      setRoles(res.data ?? []);
    });
  }, []);

  return { ...crud, roles };
};
