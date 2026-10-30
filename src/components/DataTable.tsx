import { ChevronLeft, ChevronRight, Eye, Pencil, Power, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import type { IPageMeta } from "../interface/IPaginated";

export interface DataColumn<T> {
  key: string;
  label: string;
  className?: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T extends { id?: string }> {
  columns: DataColumn<T>[];
  data: T[];
  pagination?: IPageMeta;
  onPageChange?: (page: number) => void;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onToggleStatus?: (row: T) => void;
  onDelete?: (row: T) => void;
  actions?: boolean;
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  pagination,
  onPageChange,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  actions = true,
}: DataTableProps<T>) {
  const showActions = actions && (onView || onEdit || onToggleStatus || onDelete);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="overflow-x-auto rounded-3xl border border-pink-50">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-pink-50/60 text-[11px] uppercase tracking-wider text-[#a59eb2]">
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 font-extrabold ${col.className ?? ""}`}>
                  {col.label}
                </th>
              ))}
              {showActions && <th className="px-4 py-3 font-extrabold text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.id ?? idx} className="border-t border-pink-50/80 hover:bg-pink-50/30 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3.5 text-[13px] text-[#2c2338] font-medium ${col.className ?? ""}`}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "—")}
                  </td>
                ))}
                {showActions && (
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {onView && (
                        <button
                          type="button"
                          title="Ver detalle"
                          onClick={() => onView(row)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#584f66] hover:text-[#ff1f68] hover:bg-pink-50 cursor-pointer transition-all"
                        >
                          <Eye size={15} strokeWidth={2.2} />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          type="button"
                          title="Editar"
                          onClick={() => onEdit(row)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#584f66] hover:text-[#ff1f68] hover:bg-pink-50 cursor-pointer transition-all"
                        >
                          <Pencil size={15} strokeWidth={2.2} />
                        </button>
                      )}
                      {onToggleStatus && (
                        <button
                          type="button"
                          title="Cambiar estado"
                          onClick={() => onToggleStatus(row)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#584f66] hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-all"
                        >
                          <Power size={15} strokeWidth={2.2} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          title="Eliminar"
                          onClick={() => onDelete(row)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#584f66] hover:text-red-500 hover:bg-red-50 cursor-pointer transition-all"
                        >
                          <Trash2 size={15} strokeWidth={2.2} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-[11px] font-semibold text-[#8f889c]">
            Página {pagination.page} de {Math.max(pagination.pageCount, 1)} · {pagination.itemCount} registros
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="w-8 h-8 rounded-full border border-pink-100 flex items-center justify-center disabled:opacity-40 hover:bg-pink-50 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="w-8 h-8 rounded-full border border-pink-100 flex items-center justify-center disabled:opacity-40 hover:bg-pink-50 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
