import type { EntityStatus } from "../types/enums";

export const StatusBadge = ({ status }: { status?: EntityStatus | string }) => {
  const active = status === "ACTIVE" || status === "OPEN" || status === "PAID" || status === "COMPLETED";
  const cancelled = status === "INACTIVE" || status === "CANCELLED" || status === "CLOSED";

  const label =
    status === "ACTIVE"
      ? "Activo"
      : status === "INACTIVE"
        ? "Inactivo"
        : status === "OPEN"
          ? "Abierta"
          : status === "CLOSED"
            ? "Cerrada"
            : (status ?? "—");

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide uppercase ${
        active
          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
          : cancelled
            ? "bg-slate-100 text-slate-500 border border-slate-200"
            : "bg-pink-50 text-[#ff1f68] border border-pink-100"
      }`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
