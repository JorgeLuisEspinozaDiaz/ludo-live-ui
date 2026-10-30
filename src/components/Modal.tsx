import React, { useRef, type ReactElement } from "react";
import { X, type LucideIcon } from "lucide-react";
import { Signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import kittySvg from "../assets/svg/kitty.svg";

type ModalSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";

const sizeClasses: Record<ModalSize, string> = {
  xs: "w-full max-w-xs",
  sm: "w-full max-w-sm",
  base: "w-full max-w-md",
  lg: "w-full max-w-lg",
  xl: "w-full max-w-xl",
  "2xl": "w-full max-w-2xl",
  "3xl": "w-full max-w-3xl",
  "4xl": "w-full max-w-4xl",
  "5xl": "w-full max-w-5xl",
  "6xl": "w-full max-w-6xl",
  "7xl": "w-full max-w-7xl",
};

interface ModalProps {
  activeModal: Signal<boolean>;
  onClose?: () => void;
  onSave?: () => void;
  btnCancel?: () => void;
  title?: string;
  subTitle?: string;
  icon?: LucideIcon;
  children: ReactElement;
  nameBtnSave?: string;
  size?: ModalSize;
  bgIcon?: string;
  textIcon?: string;
}

export const Modal: React.FC<ModalProps> = (props: ModalProps) => {
  const {
    activeModal,
    btnCancel,
    onClose,
    title,
    subTitle,
    icon: Icon,
    children,
    nameBtnSave = "Guardar",
    size = "base",
    bgIcon,
    textIcon,
    onSave,
  } = props;

  useSignals();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!activeModal.value) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 ">
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-[#2d1b2e]/20 backdrop-blur-[3px] transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      <div
        ref={contentRef}
        className={`relative ${sizeClasses[size]} bg-white rounded-[36px] shadow-[0_20px_50px_rgba(255,182,193,0.3)] border border-pink-100/90 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ease-out z-10`}
      >
        <div className="px-7 pt-6 pb-4 flex items-center justify-between border-b border-pink-50">
          <div className="flex items-center gap-3">
            {Icon ? (
              <div
                style={{ backgroundColor: bgIcon || "#FFF0F5" }}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-pink-100"
              >
                <Icon size={19} style={{ color: textIcon || "#ff1f68" }} />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden">
                <img src={kittySvg} alt="Kitty" className="w-8 h-8 object-contain animate-kitty-float  pointer-events-none" />
              </div>
            )}

            <div className="flex flex-col">
              <h2 className="text-[#2c2338] text-[19px] font-black leading-tight tracking-tight">{title}</h2>
              {subTitle && <p className="text-[#8f889c] text-xs font-medium mt-0.5">{subTitle}</p>}
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-pink-50/50 rounded-full transition-all cursor-pointer"
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          )}
        </div>

        <div className="px-7 py-6">{children}</div>

        <div className="px-7 pb-6 pt-2 flex items-center justify-end gap-5">
          <button
            type="button"
            onClick={btnCancel || onClose}
            className="text-[#6f677d] hover:text-[#2c2338] font-bold text-sm transition-colors cursor-pointer px-2 py-1"
          >
            Cancelar
          </button>

          <button
            type="submit"
            onClick={onSave}
            className="bg-gradient-to-r from-[#ff1f68] to-[#ff3b7f] text-white px-7 py-2.5 rounded-full font-extrabold text-[13px] tracking-wide shadow-[0_4px_16px_rgba(255,31,104,0.35)] hover:shadow-[0_6px_20px_rgba(255,31,104,0.45)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            {nameBtnSave ?? "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
