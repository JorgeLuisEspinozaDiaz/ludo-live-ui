import { File, Banknote, CreditCard, Smartphone, Landmark, LayoutGrid, Zap, TriangleAlert, Minus, } from "lucide-react";
import { FileText, FileImage, FileVideo, FileAudio, FileArchive, FileSpreadsheet, FileCode } from "lucide-react";

export const BankAccount = [
    { id: 2, name: "BANCO DE CRÉDITO DEL PERÚ", svg: "bcp.svg" },
    { id: 5, name: "BANCO CONTINENTAL", svg: "bbva.svg" },
    { id: 7, name: "INTERBANK", svg: "interbank.svg" },
]

export const Bank = [
    { name: "BCP", slug: "BCP" },
    { name: "INTERBANK", slug: "INTERBANK" },
    { name: "BBVA", slug: "BBVA" },
    { name: "SCOTIABANK", slug: "SCOTIABANK" },
    { name: "BANCO DE LA NACION", slug: "BANCO_DE_LA_NACION" },
    { name: "MI BANCO", slug: "MIBANCO" }
];

export const AccountType = [
    { name: "CORRIENTE", slug: "CORRIENTE" },
    { name: "AHORROS", slug: "AHORROS" },
    { name: "PLAZO FIJO", slug: "PLAZO_FIJO" }
];

export const TipoMaterial = [
    { name: "CONSUMIBLE", slug: "CONSUMIBLE" },
    { name: "REUTILIZABLE", slug: "REUTILIZABLE" },
    { name: "REACTIVO", slug: "REACTIVO" },
    { name: "OTRO", slug: "OTRO" },
]

export const TipoReactivo = [
    { name: "CUALITATIVO", slug: "CUALITATIVO" },
    { name: "CUANTITATIVO", slug: "CUANTITATIVO" },
    { name: "SEMI CUANTITATIVO", slug: "SEMI_CUANTITATIVO" },
    { name: "OTRO", slug: "OTRO" },
]


export const Currency = [
    { name: "SOLES", slug: "SOLES", className: "bg-[#669133]/10 text-[#669133]", iconClassName: "bg-[#669133]" },
    { name: "DOLARES", slug: "DOLARES", className: "bg-[#F59E0B]/10 text-[#F59E0B]", iconClassName: "bg-[#F59E0B]" }
];
export const OrigenPurchase = [
    { name: "LOCAL", slug: "LOCAL", className: "bg-[#669133]/10 text-[#669133]", iconClassName: "bg-[#669133]" },
    { name: "IMPORTADO", slug: "IMPORTADO", className: "bg-[#F59E0B]/10 text-[#F59E0B]", iconClassName: "bg-[#F59E0B]" }
];

export const TypeVoucher = [
    { name: "BOLETA", slug: "BOLETA", select: false, className: "bg-[#6DACCB]/10 text-[#6DACCB]", iconClassName: "bg-[#6DACCB]" },
    { name: "FACTURA", slug: "FACTURA", select: false, className: "bg-[#669133]/10 text-[#669133]", iconClassName: "bg-[#669133]" },
    { name: "NOTA DE CRÉDITO", slug: "NOTA_DE_CREDITO", select: false, className: "bg-[#F59E0B]/10 text-[#F59E0B]", iconClassName: "bg-[#F59E0B]" },
    { name: "NOTA DE DÉBITO", slug: "NOTA_DE_DEBITO", select: false, className: "bg-[#DC2626]/10 text-[#DC2626]", iconClassName: "bg-[#DC2626]" },
    { name: "TICKET", slug: "TICKET", select: false, className: "bg-[#64748B]/10 text-[#64748B]", iconClassName: "bg-[#64748B]" },
    // { name: "PROFORMA", slug: "PROFORMA", select: false, className: "bg-[#8B5CF6]/10 text-[#8B5CF6]", iconClassName: "bg-[#8B5CF6]" },
    // { name: "GUÍA DE REMISIÓN", slug: "GUIA-DE-REMISION", select: false, className: "bg-[#0EA5E9]/10 text-[#0EA5E9]", iconClassName: "bg-[#0EA5E9]" },
    // { name: "RECIBO POR HONORARIOS", slug: "RECIBO-POR-HONORARIOS", select: false, className: "bg-[#14B8A6]/10 text-[#14B8A6]", iconClassName: "bg-[#14B8A6]" },
];

export const CurrencyType = [
    { name: "Pen", slug: "pen", select: false, className: "bg-[#669133]/10 text-[#669133]", iconClassName: "bg-[#669133]" },
    { name: "Euro", slug: "euro", select: false, className: "bg-[#64748B]/10 text-[#64748B]", iconClassName: "bg-[#64748B]" },
    { name: "Usd", slug: "usd", select: false, className: "bg-[#F59E0B]/10 text-[#F59E0B]", iconClassName: "bg-[#F59E0B]" },
];

export const StatusPurchase = [
    { name: "Completo", slug: "Completo", select: false, className: "text-emerald-700 bg-emerald-50 border-emerald-100" },
    { name: "Parcial", slug: "Parcial", select: false, className: "text-amber-500 bg-amber-50 border-amber-100" },
    { name: "Pendiente", slug: "Pendiente", select: false, className: "text-slate-500 bg-slate-50 border-slate-100" },
];


export const StatusInvoice = [
    { name: "Pendiente", slug: "PENDING", select: false, className: "text-amber-700 bg-amber-50 border-amber-100", classNameInvoice: "bg-amber-700" },
    { name: "Pagado", slug: "PAID", select: false, className: "text-emerald-500 bg-emerald-50 border-emerald-100", classNameInvoice: "bg-emerald-700" },
    { name: "Pago Parcial", slug: "PARTIAL", select: false, className: "text-blue-500 bg-blue-50 border-blue-100", classNameInvoice: "bg-blue-700" },
    { name: "Vencido", slug: "OVERDUE", select: false, className: "text-red-500 bg-red-50 border-red-100", classNameInvoice: "bg-red-700" },
];

export const TypeMovement = [
    { name: "Nuevo Stock", slug: "NEW_STOCK" },
    { name: "Merma", slug: "WASTE" },
]

export const PaymentMethodOptions = [
    { name: "Efectivo", slug: "CASH", icon: Banknote, color: "text-[#6b9437]" },
    { name: "Tarjeta", slug: "CARD", icon: CreditCard, color: "text-[#72a1c1]" },
    { name: "Yape", slug: "YAPE", icon: Smartphone, color: "text-[#8a3ffc]" },
    { name: "Plin", slug: "PLIN", icon: Smartphone, color: "text-[#00a0e3]" },
    { name: "Transferencia", slug: "TRANSFER", icon: Landmark, color: "text-[#1c2d4e]" },
    { name: "Otros", slug: "OTHER", icon: LayoutGrid, color: "text-[#6c7b93]" },
];

export const StatusShipment = [
    {
        name: "Pendiente",
        slug: "PENDING",
        select: false,
        className: "text-yellow-700 bg-yellow-50 border-yellow-100"
    },
    {
        name: "En Tránsito",
        slug: "IN_TRANSIT",
        select: false,
        className: "text-blue-700 bg-blue-50 border-blue-100"
    },
    {
        name: "Arribado",
        slug: "ARRIVED",
        select: false,
        className: "text-emerald-700 bg-emerald-50 border-emerald-100"
    },
    {
        name: "Cancelado",
        slug: "CANCELLED",
        select: false,
        className: "text-red-700 bg-red-50 border-red-100"
    }
];

export const MimeIconMap: Record<string, any> = {
    "application/pdf": FileText,
    "application/msword": FileText,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": FileText,
    "text/plain": FileText,

    "application/vnd.ms-excel": FileSpreadsheet,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": FileSpreadsheet,
    "text/csv": FileSpreadsheet,

    "application/vnd.ms-powerpoint": FileText,
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": FileText,

    "image/jpeg": FileImage,
    "image/png": FileImage,
    "image/gif": FileImage,
    "image/webp": FileImage,
    "image/svg+xml": FileImage,
    "image/bmp": FileImage,
    "image/tiff": FileImage,
    "image/heic": FileImage,

    "video/mp4": FileVideo,
    "video/mpeg": FileVideo,
    "video/webm": FileVideo,
    "video/quicktime": FileVideo,
    "video/x-msvideo": FileVideo,

    "audio/mpeg": FileAudio,
    "audio/wav": FileAudio,
    "audio/ogg": FileAudio,
    "audio/webm": FileAudio,
    "audio/aac": FileAudio,

    "application/zip": FileArchive,
    "application/x-rar-compressed": FileArchive,
    "application/x-7z-compressed": FileArchive,
    "application/gzip": FileArchive,
    "application/x-tar": FileArchive,

    "application/json": FileCode,
    "application/xml": FileCode,
    "text/html": FileCode,
    "text/css": FileCode,
    "text/javascript": FileCode,

    default: File,
};

export const ColorPalette = [
    { bg: 'bg-blue-400', dot: 'bg-blue-500', text: 'text-blue-600' },
    { bg: 'bg-amber-300', dot: 'bg-amber-400', text: 'text-amber-500' },
    { bg: 'bg-emerald-300', dot: 'bg-emerald-400', text: 'text-emerald-500' },
    { bg: 'bg-indigo-300', dot: 'bg-indigo-400', text: 'text-indigo-500' },
    { bg: 'bg-fuchsia-300', dot: 'bg-fuchsia-400', text: 'text-fuchsia-500' },
    { bg: 'bg-orange-300', dot: 'bg-orange-400', text: 'text-orange-500' },
    { bg: 'bg-cyan-300', dot: 'bg-cyan-400', text: 'text-cyan-500' },
    { bg: 'bg-lime-300', dot: 'bg-lime-400', text: 'text-lime-500' },
    { bg: 'bg-violet-300', dot: 'bg-violet-400', text: 'text-violet-500' },
    { bg: 'bg-pink-300', dot: 'bg-pink-400', text: 'text-pink-500' },
    { bg: 'bg-teal-300', dot: 'bg-teal-400', text: 'text-teal-500' },
    { bg: 'bg-yellow-300', dot: 'bg-yellow-400', text: 'text-yellow-500' },
    { bg: 'bg-purple-300', dot: 'bg-purple-400', text: 'text-purple-500' },
    { bg: 'bg-sky-300', dot: 'bg-sky-400', text: 'text-sky-500' },
    { bg: 'bg-red-300', dot: 'bg-red-400', text: 'text-red-500' },
    { bg: 'bg-green-300', dot: 'bg-green-400', text: 'text-green-500' },
    { bg: 'bg-slate-300', dot: 'bg-slate-400', text: 'text-slate-500' },
    { bg: 'bg-stone-300', dot: 'bg-stone-400', text: 'text-stone-500' },
    { bg: 'bg-neutral-300', dot: 'bg-neutral-400', text: 'text-neutral-500' },
    { bg: 'bg-rose-300', dot: 'bg-rose-400', text: 'text-rose-500' },
];


export const StatusGlobal = [
    { name: "Anulado", slug: "Anulado", select: false, className: "border bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/20" },
    { name: "En Tránsito", slug: "En Tránsito", select: false, className: "border bg-[#6DACCB]/10 text-[#6DACCB] border-[#6DACCB]/20" },
    { name: "Pendiente", slug: "Pendiente", select: false, className: "border bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20" },
    { name: "CONSUMIBLE", slug: "Consumible", select: false, className: " bg-[#6DACCB14] text-[#6DACCB] " },
    { name: "REUTILIZABLE", slug: "Reutilizable", select: false, className: " bg-[#66913312] text-[#669133] " },

];


export const StatusCotizacion = [
    { name: "Pendiente", slug: "Pendiente", select: false, className: " text-[#F59E0B] bg-[#F59E0B18] " },
    { name: "Aprobada", slug: "Aprobada", select: false, className: " text-[#669133] bg-[#66913318] " },
    { name: "Rechazada", slug: "Rechazada", select: false, className: " text-[#F43F5E] bg-[#F43F5E18] " },
    { name: "Expirada", slug: "Expirada", select: false, className: " text-[#94A3B8] bg-[#94A3B818] " },
]

export const StatusOrdenServicio = [
    {
        name: "Registrado",
        slug: "REGISTERED",
        select: false,
        className: "text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20",
    },
    {
        name: "Aprobada",
        slug: "Aprobada",
        select: false,
        className: "text-[#669133] bg-[#669133]/10 border border-[#669133]/20",
    },
    {
        name: "Rechazada",
        slug: "CANCELLED",
        select: false,
        className: "text-[#F43F5E] bg-[#F43F5E]/10 border border-[#F43F5E]/20",
    },
    {
        name: "Expirada",
        slug: "Expirada",
        select: false,
        className: "text-[#94A3B8] bg-[#94A3B8]/10 border border-[#94A3B8]/20",
    },
];

export const DataBloodType = [
    { id: 1, name: "A+", valor: "A_POSITIVE" },
    { id: 2, name: "A-", valor: "A_NEGATIVE" },
    { id: 3, name: "B+", valor: "B_POSITIVE" },
    { id: 4, name: "B-", valor: "B_NEGATIVE" },
    { id: 5, name: "AB+", valor: "AB_POSITIVE" },
    { id: 6, name: "AB-", valor: "AB_NEGATIVE" },
    { id: 7, name: "O+", valor: "O_POSITIVE" },
    { id: 8, name: "O-", valor: "O_NEGATIVE" },
]

export const BloodTypes = {
    "A+": "A positivo",
    "A-": "A negativo",
    "B+": "B positivo",
    "B-": "B negativo",
    "AB+": "AB positivo",
    "AB-": "AB negativo",
    "O+": "O positivo",
    "O-": "O negativo",
};

// export const TypeMovementKardex = [
//     { name: "Entrada", className: "bg-[#669133]/[0.07] text-[#669133] border-[#669133]/[0.19]", classNameBg: "bg-[#669133]/[0.07]" },
//     { name: "Salida", className: "bg-[#f43f5e]/[0.063] text-[#f43f5e] border-[#f43f5e]/[0.145]", classNameBg: "bg-[#669133]/[0.07]" },
//     { name: "Transfer.", className: "bg-[#6DACCB]/[0.063] text-[#6DACCB] border-[#6DACCB]/[0.145]", classNameBg: "bg-[#669133]/[0.07]" },
//     { name: "Ajuste", className: "bg-[#F59E0B]/[0.07] text-[#F59E0B] border-[#F59E0B]/[0.19]", classNameBg: "bg-[#669133]/[0.07]" },
// ]

export const TypeMovementKardex = [
    {
        name: "Entrada",
        slug: "PURCHASE_IN",
        className: "bg-[#669133]/[0.07] text-[#669133] border-[#669133]/[0.19]",
        classNameBg: "bg-[#669133]",
    },
    {
        name: "Entrada Transfer.",
        slug: "TRANSFER_IN",
        className: "bg-[#6DACCB]/[0.063] text-[#6DACCB] border-[#6DACCB]/[0.145]",
        classNameBg: "bg-[#6DACCB]",
    },
    {
        name: "Salida Transfer.",
        slug: "TRANSFER_OUT",
        className: "bg-[#0ea5e9]/[0.07] text-[#0ea5e9] border-[#0ea5e9]/[0.19]",
        classNameBg: "bg-[#0ea5e9]",
    },
    {
        name: "Ajuste +",
        slug: "ADJUSTMENT_IN",
        className: "bg-[#F59E0B]/[0.07] text-[#F59E0B] border-[#F59E0B]/[0.19]",
        classNameBg: "bg-[#F59E0B]",
    },
    {
        name: "Ajuste -",
        slug: "ADJUSTMENT_OUT",
        className: "bg-[#f97316]/[0.07] text-[#f97316] border-[#f97316]/[0.19]",
        classNameBg: "bg-[#f97316]",
    },
    {
        name: "Consumo",
        slug: "CONSUMPTION",
        className: "bg-[#f43f5e]/[0.063] text-[#f43f5e] border-[#f43f5e]/[0.145]",
        classNameBg: "bg-[#f43f5e]",
    },
];

export const TypeMovementKardexMotivoConcepto = [
    { name: "Orden de compra", slug: "PURCHASE_ORDER", merma: false },
    { name: "Recepción proveedor", slug: "SUPPLIER_RECEPTION", merma: false },
    { name: "Devolución área clínica", slug: "CLINICAL_AREA_RETURN", merma: false },
    { name: "Transferencia recibida", slug: "TRANSFER_RECEIVED", merma: false },
    { name: "Ajuste de inventario (+)", slug: "INVENTORY_ADJUSTMENT_IN", merma: false },
    { name: "Merma", slug: "WASTE", merma: true },
    { name: "Vencido", slug: "EXPIRED", merma: true },
    { name: "Dañado", slug: "DAMAGE", merma: true },
    { name: "Transferencia enviada", slug: "TRANSFER_SENT", merma: true },
    { name: "Ajuste de inventario (-)", slug: "INVENTORY_ADJUSTMENT_OUT", merma: true },
];

export const TipoMuestraData = [
    { name: "Sangre Venosa", slug: "SANGRE_VENOSA" },
    { name: "Orina", slug: "ORINA" },
    { name: "LCR", slug: "LCR" },
    { name: "Suero", slug: "SUERO" },
    { name: "Cultivo", slug: "CULTIVO" },
    { name: "Biopsia", slug: "BIOPSIA" },
]

export const TuboContenedorData = [
    { name: "EDTA Morado", slug: "EDTA_MORADO" },
    { name: "Rojo", slug: "ROJO" },
    { name: "Dorado (SST)", slug: "DORADO_SST" },
    { name: "Azul Celeste", slug: "AZUL_CELESTE" },
    { name: "Verde", slug: "VERDE" },
    { name: "Gris", slug: "GRIS" },
    { name: "Urinario", slug: "URINARIO" },
    { name: "LCR", slug: "LCR" },
]

export const PrioridadDataMuestra = [
    { name: "Rutina", slug: "RUTINA", classNameText: "text-slate-500", classNameBg: "bg-slate-100", icon: Minus },
    { name: "Urgente", slug: "URGENTE", classNameText: "text-white", classNameBg: "bg-[#F59E0B]", icon: TriangleAlert },
    { name: "STAT", slug: "STAT", classNameText: "text-white", classNameBg: "bg-[#F43F5E]", icon: Zap },
]
export const StatusMuestras = [
    { name: "En Espera", slug: "EN_ESPERA", classNameText: "text-[#F59E0B]", classNameBg: "bg-[#F59E0B]", icon: Minus },
    { name: "En Proceso", slug: "EN_PROCESO", classNameText: "text-[#6DACCB]", classNameBg: "bg-[#6DACCB]", icon: TriangleAlert },
    { name: "Completada", slug: "COMPLETADA", classNameText: "text-[#669133]", classNameBg: "bg-[#669133]", icon: Zap },
    { name: "Rechazada", slug: "RECHAZADA", classNameText: "text-[#F43F5E]", classNameBg: "bg-[#F43F5E]", icon: Zap },
]