import { Modal } from "../../../components/Modal";
import PageHeader from "../../components/PageHeader";
import { Input } from "../../../components/input/Input";
import PageBody from "../../components/PageBody";
import { DataTable } from "../../../components/DataTable";
import { StatusBadge } from "../../../components/StatusBadge";
import { Select } from "../../../components/select/Select";
import { UseUser } from "../hooks/useUser";
import type { IUser } from "../interface/IUser";

export const UserScreen = () => {
  const {
    form,
    keyUpHandler,
    activeModal,
    handleChangeSave,
    search,
    setSearch,
    data,
    pagination,
    loading,
    openCreate,
    openEdit,
    closeModal,
    handleToggleStatus,
    handleDelete,
    handleChangeRegisterTable,
    isEditing,
    roles,
  } = UseUser();

  return (
    <div>
      <Modal
        title={isEditing ? "Editar Usuario" : "Nuevo Usuario"}
        subTitle="Accesos al sistema"
        activeModal={activeModal}
        onClose={closeModal}
        onSave={handleChangeSave}
        size="lg"
      >
        <div className="grid grid-cols-2 gap-x-4">
          <Input
            name="username"
            label="Usuario"
            form={form}
            value={form.username}
            onKeyUp={keyUpHandler}
            placeholder="username"
            update={activeModal}
          />
          <Input
            name="email"
            label="Email"
            form={form}
            value={form.email}
            onKeyUp={keyUpHandler}
            placeholder="correo@ejemplo.com"
            update={activeModal}
            type="email"
          />
          <Input
            name="password"
            label={isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}
            form={form}
            value={form.password}
            onKeyUp={keyUpHandler}
            placeholder="••••••••"
            update={activeModal}
            type="password"
          />
          <Select
            keyValue="id"
            data={roles}
            name="roleId"
            readView="name"
            form={form}
            value={form.roleId}
            onChange={keyUpHandler}
            label="Rol"
            update={activeModal}
          />
        </div>
      </Modal>

      <PageHeader
        title="Usuarios"
        subtitle="Cuentas de acceso · staff.manage"
        buttonText="Nuevo Usuario"
        onButtonClick={openCreate}
      />

      <div className="px-6 pb-6">
        <PageBody
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar usuario..."
          isEmpty={!loading && data.length === 0}
          isLoading={loading}
          emptyText="No se encontraron usuarios."
          ClassNameHeight="h-[73.1vh]"
        >
          <DataTable<IUser>
            data={data}
            pagination={pagination}
            onPageChange={(page) => handleChangeRegisterTable({ page, take: pagination.take, search })}
            onEdit={openEdit}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            columns={[
              { key: "username", label: "Usuario" },
              { key: "email", label: "Email", render: (row) => row.email || "—" },
              {
                key: "roleId",
                label: "Rol",
                render: (row) => row.role?.name ?? roles.find((r) => r.id === row.roleId)?.name ?? "—",
              },
              { key: "status", label: "Estado", render: (row) => <StatusBadge status={row.status} /> },
            ]}
          />
        </PageBody>
      </div>
    </div>
  );
};
