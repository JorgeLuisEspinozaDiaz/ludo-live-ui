import React from "react";
import { Search } from "lucide-react";

interface PageBodyProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  rightActions?: React.ReactNode;
  isEmpty?: boolean;
  emptyText?: string;
  emptySubtext?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
  ClassNameHeight?: string;
}

export const PageBody: React.FC<PageBodyProps> = ({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar...",
  showSearch = true,
  rightActions,
  isEmpty = false,
  emptyText = "No se encontraron resultados.",
  emptySubtext,
  isLoading = false,
  children,
  ClassNameHeight = "min-h-115",
}) => {
  return (
    <div
      className={`${ClassNameHeight} w-full bg-white rounded-[36px] shadow-[0_10px_35px_rgba(255,182,193,0.16)] border border-pink-100/80 p-6 flex flex-col transition-all duration-300`}
    >
      {(showSearch || rightActions) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          {showSearch && (
            <div className="relative w-full max-w-sm">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a8a1b5] pointer-events-none" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-white border border-pink-100/90 rounded-full pl-10 pr-4 py-2 text-[13px] text-[#2c2338] placeholder:text-[#a8a1b5] shadow-sm focus:outline-none focus:border-[#ff1f68] focus:ring-2 focus:ring-[#ff1f68]/15 transition-all"
              />
            </div>
          )}
          {rightActions && <div className="flex items-center gap-2">{rightActions}</div>}
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#ff1f68]">
            <div className="w-8 h-8 border-3 border-pink-200 border-t-[#ff1f68] rounded-full animate-spin" />
            <span className="text-xs font-semibold text-[#8f889c]">Cargando datos...</span>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-300 ">
            <div className="w-20 h-20 mb-4 flex items-center justify-center animate-kitty-float">
              <KittySleepingSvg />
            </div>
            <p className="text-[14px] font-bold text-[#5c546a]">{emptyText}</p>
            {emptySubtext && <p className="text-xs text-[#9d97a9] mt-1">{emptySubtext}</p>}
          </div>
        ) : (
          <div className="w-full flex-1">{children}</div>
        )}
      </div>
    </div>
  );
};

export default PageBody;

const KittySleepingSvg = () => (
  <svg viewBox="0 0 120 100" className="w-full h-full drop-shadow-sm">
    <ellipse cx="60" cy="55" rx="42" ry="32" fill="#FFFFFF" stroke="#3A2D40" strokeWidth="4.5" />
    <path d="M 28 32 L 20 14 Q 35 15 45 28 Z" fill="#FFFFFF" stroke="#3A2D40" strokeWidth="4.5" strokeLinejoin="round" />
    <path d="M 75 28 Q 85 15 100 14 L 92 32 Z" fill="#FFFFFF" stroke="#3A2D40" strokeWidth="4.5" strokeLinejoin="round" />

    <g transform="translate(68, 6)">
      <circle cx="20" cy="18" r="7" fill="#FF1F68" stroke="#3A2D40" strokeWidth="4" />
      <path d="M 14 15 C 2 5 2 28 14 21 Z" fill="#FF2D75" stroke="#3A2D40" strokeWidth="4" strokeLinejoin="round" />
      <path d="M 26 15 C 38 5 38 28 26 21 Z" fill="#FF2D75" stroke="#3A2D40" strokeWidth="4" strokeLinejoin="round" />
    </g>

    <path d="M 40 54 Q 45 59 50 54" fill="none" stroke="#3A2D40" strokeWidth="4" strokeLinecap="round" />
    <path d="M 70 54 Q 75 59 80 54" fill="none" stroke="#3A2D40" strokeWidth="4" strokeLinecap="round" />

    <ellipse cx="60" cy="62" rx="4.5" ry="3.5" fill="#FFD200" stroke="#3A2D40" strokeWidth="2.5" />

    <line x1="22" y1="52" x2="33" y2="54" stroke="#3A2D40" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="20" y1="62" x2="32" y2="62" stroke="#3A2D40" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="22" y1="72" x2="33" y2="70" stroke="#3A2D40" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="87" y1="54" x2="98" y2="52" stroke="#3A2D40" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="88" y1="62" x2="100" y2="62" stroke="#3A2D40" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="87" y1="70" x2="98" y2="72" stroke="#3A2D40" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);
