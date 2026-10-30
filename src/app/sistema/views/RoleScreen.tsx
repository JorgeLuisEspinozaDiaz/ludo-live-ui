import { Modal } from "../../../components/Modal";
import PageHeader from "../../components/PageHeader";
import { Input } from "../../../components/input/Input";
import PageBody from "../../components/PageBody";
import { DataTable } from "../../../components/DataTable";
import { UseRole } from "../hooks/useRole";
import type { IRole } from "../interface/IRole";
import {
  collectGroupPermissionIds,
  collectModulePermissionIds,
} from "../../../helper/permissionCatalog";

export const RoleScreen = () => {
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
    handleDelete,
    handleChangeRegisterTable,
    isEditing,
    permissions,
    permissionGroups,
    selectedPermissionIds,
    togglePermission,
    toggleAllPermissions,
    toggleGroup,
    toggleModule,
  } = UseRole();

  const allSelected =
    permissions.length > 0 && selectedPermissionIds.length === permissions.filter((p) => p.id).length;

  return (
    <div>
      <Modal
        title={isEditing ? "Editar Rol" : "Nuevo Rol"}
        subTitle="Roles del sistema"
        activeModal={activeModal}
        onClose={closeModal}
        onSave={handleChangeSave}
        size="3xl"
      >
        <div className="grid gap-3">
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Input
              name="name"
              label="Nombre"
              form={form}
              value={form.name}
              onKeyUp={keyUpHandler}
              placeholder="Nombre del rol"
              update={activeModal}
            />
            <Input
              name="description"
              label="Descripción"
              form={form}
              value={form.description}
              onKeyUp={keyUpHandler}
              placeholder="Descripción opcional"
              update={activeModal}
            />
          </div>

          <div className="mt-1">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-text-color">Permisos por módulo</p>
                <p className="text-[12px] text-slate-400">
                  {selectedPermissionIds.length} de {permissions.length} seleccionados
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#ff1f68]"
                  checked={allSelected}
                  onChange={(e) => toggleAllPermissions(e.target.checked)}
                />
                Seleccionar todos
              </label>
            </div>

            <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
              {permissionGroups.map((group) => {
                const GroupIcon = group.Icon;
                const groupIds = collectGroupPermissionIds(group);
                const groupSelected = groupIds.filter((id) => selectedPermissionIds.includes(id)).length;
                const groupAll = groupIds.length > 0 && groupSelected === groupIds.length;

                return (
                  <section
                    key={group.id}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/80"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white/80 px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-50 text-[#ff1f68]">
                          <GroupIcon size={16} strokeWidth={2.2} />
                        </span>
                        <div>
                          <p className="text-[13px] font-extrabold uppercase tracking-wide text-[#2c2338]">
                            {group.label}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {groupSelected}/{groupIds.length || 0} permisos
                          </p>
                        </div>
                      </div>
                      <label className="flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-slate-500">
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 accent-[#ff1f68]"
                          checked={groupAll}
                          disabled={!groupIds.length}
                          onChange={(e) => toggleGroup(group.id, e.target.checked)}
                        />
                        Todo el grupo
                      </label>
                    </div>

                    <div className="grid gap-2 p-3 sm:grid-cols-2">
                      {group.modules.map((mod) => {
                        const ModIcon = mod.Icon;
                        const moduleIds = collectModulePermissionIds(mod);
                        const moduleSelected = moduleIds.filter((id) => selectedPermissionIds.includes(id)).length;
                        const moduleAll = moduleIds.length > 0 && moduleSelected === moduleIds.length;

                        return (
                          <div
                            key={mod.id}
                            className="rounded-2xl border border-white bg-white p-3 shadow-[0_1px_8px_rgba(44,35,56,0.04)]"
                          >
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                                  <ModIcon size={14} strokeWidth={2.2} />
                                </span>
                                <p className="text-[13px] font-bold text-[#2c2338]">{mod.label}</p>
                              </div>
                              <label className="flex cursor-pointer items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                <input
                                  type="checkbox"
                                  className="h-3.5 w-3.5 accent-[#ff1f68]"
                                  checked={moduleAll}
                                  disabled={!moduleIds.length}
                                  onChange={(e) => toggleModule(group.id, mod.id, e.target.checked)}
                                />
                                Todo
                              </label>
                            </div>

                            <div className="space-y-1.5">
                              {mod.actions.map((action) => {
                                const ActionIcon = action.Icon;
                                const checked = action.permissionId
                                  ? selectedPermissionIds.includes(action.permissionId)
                                  : false;

                                return (
                                  <label
                                    key={action.permissionId || `${mod.id}-${action.code}-${action.key}`}
                                    className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-2.5 py-2 transition-colors ${
                                      checked
                                        ? "border-pink-200 bg-pink-50/40"
                                        : "border-transparent hover:bg-slate-50"
                                    } ${!action.available ? "opacity-45" : ""}`}
                                  >
                                    <input
                                      type="checkbox"
                                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#ff1f68]"
                                      checked={checked}
                                      disabled={!action.available || !action.permissionId}
                                      onChange={() => action.permissionId && togglePermission(action.permissionId)}
                                    />
                                    <span className="mt-0.5 text-slate-400">
                                      <ActionIcon size={14} strokeWidth={2.2} />
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block text-[12px] font-bold text-[#2c2338]">{action.label}</span>
                                      <span className="block text-[11px] leading-snug text-slate-500">
                                        {action.description}
                                      </span>
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              {permissions.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">No hay permisos disponibles.</p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <PageHeader
        title="Roles"
        subtitle="Permisos y roles de acceso."
        buttonText="Nuevo Rol"
        onButtonClick={openCreate}
      />

      <div className="px-6 pb-6">
        <PageBody
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar rol..."
          isEmpty={!loading && data.length === 0}
          isLoading={loading}
          emptyText="No se encontraron roles."
          ClassNameHeight="h-[73.1vh]"
        >
          <DataTable<IRole>
            data={data}
            pagination={pagination}
            onPageChange={(page) => handleChangeRegisterTable({ page, take: pagination.take, search })}
            onEdit={openEdit}
            onDelete={handleDelete}
            columns={[
              { key: "name", label: "Nombre" },
              { key: "description", label: "Descripción", render: (row) => row.description || "—" },
              {
                key: "permissionIds",
                label: "Permisos",
                render: (row) => {
                  const fromIds = Array.isArray(row.permissionIds) ? row.permissionIds.length : 0;
                  const fromRel = Array.isArray(row.permissions) ? row.permissions.length : 0;
                  const count = fromIds || fromRel;
                  return count ? String(count) : "—";
                },
              },
            ]}
          />
        </PageBody>
      </div>
    </div>
  );
};
