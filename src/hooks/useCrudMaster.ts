import { useEffect, useRef, useState } from "react";
import { useSignal } from "@preact/signals-react";
import { toast } from "sonner";
import { UseForm } from "./UseForm";
import { usePaginatedFetch, CRUD_LIST_PARAMS } from "./usePaginatedFetch";
import { handleError } from "../helper/Funtions";
import { coerceNumericFields, sanitizeFormPayload } from "../helper/sanitizeFormPayload";
import type { IListParams, IPaginatedResponse } from "../interface/IPaginated";
import type { EntityStatus } from "../types/enums";

export interface ICrudService<T> {
  getAll: (params?: IListParams) => Promise<IPaginatedResponse<T>>;
  create: (body: Partial<T>) => Promise<T>;
  update: (id: string, body: Partial<T>) => Promise<T>;
  changeStatus?: (id: string, status: EntityStatus) => Promise<T>;
  remove?: (id: string) => Promise<T>;
}

interface UseCrudMasterOptions<T> {
  service: ICrudService<T>;
  initialForm?: Partial<T>;
  entityLabel?: string;
}

export function useCrudMaster<T extends { id?: string }>({
  service,
  initialForm = {},
  entityLabel = "Registro",
}: UseCrudMasterOptions<T>) {
  "use no memo";

  const activeModal = useSignal(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const { form, keyUpHandler, handleReset } = UseForm<Partial<T>>({ ...initialForm });
  const serviceRef = useRef(service);
  serviceRef.current = service;

  const { data, pagination, loading, refresh, handleChangeRegisterTable } = usePaginatedFetch<T>({
    fetcher: (params) => serviceRef.current.getAll(params),
    initialParams: CRUD_LIST_PARAMS,
  });

  const isFirstSearch = useRef(true);
  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      const params: IListParams = { page: 1, take: pagination.take || 10 };
      const term = search.trim();
      if (term) params.search = term;
      void refresh(params);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const openCreate = () => {
    handleReset({ ...initialForm } as Partial<T>);
    setEditingId(null);
    activeModal.value = true;
  };

  const openEdit = (row: T) => {
    const editable = sanitizeFormPayload({ ...row });
    handleReset({ ...initialForm, ...editable } as Partial<T>);
    setEditingId(row.id ?? null);
    activeModal.value = true;
  };

  const closeModal = () => {
    activeModal.value = false;
    setEditingId(null);
    handleReset({ ...initialForm } as Partial<T>);
  };

  const handleChangeSave = async () => {
    setSaving(true);
    try {
      const payload = coerceNumericFields(
        sanitizeFormPayload({ ...form }) as Record<string, unknown>
      );

      if (editingId) {
        await serviceRef.current.update(editingId, payload as Partial<T>);
        toast.success(`${entityLabel} actualizado`);
      } else {
        await serviceRef.current.create(payload as Partial<T>);
        toast.success(`${entityLabel} creado`);
      }
      closeModal();
      await refresh({
        page: pagination.page || 1,
        take: pagination.take || 10,
        ...(search.trim() ? { search: search.trim() } : {}),
      });
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (row: T) => {
    if (!serviceRef.current.changeStatus || !row.id) return;
    const next: EntityStatus = (row as { status?: EntityStatus }).status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await serviceRef.current.changeStatus(row.id, next);
      toast.success(`Estado: ${next === "ACTIVE" ? "Activo" : "Inactivo"}`);
      await refresh({
        page: pagination.page || 1,
        take: pagination.take || 10,
        ...(search.trim() ? { search: search.trim() } : {}),
      });
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async (row: T) => {
    if (!serviceRef.current.remove || !row.id) return;
    if (!window.confirm(`¿Eliminar ${entityLabel.toLowerCase()}?`)) return;
    try {
      await serviceRef.current.remove(row.id);
      toast.success(`${entityLabel} eliminado`);
      await refresh({
        page: pagination.page || 1,
        take: pagination.take || 10,
        ...(search.trim() ? { search: search.trim() } : {}),
      });
    } catch (error) {
      handleError(error);
    }
  };

  return {
    form,
    keyUpHandler,
    handleReset,
    activeModal,
    editingId,
    isEditing: Boolean(editingId),
    saving,
    openCreate,
    openEdit,
    closeModal,
    handleChangeSave,
    handleToggleStatus,
    handleDelete,
    search,
    setSearch,
    data,
    pagination,
    loading,
    refresh,
    handleChangeRegisterTable,
  };
}
