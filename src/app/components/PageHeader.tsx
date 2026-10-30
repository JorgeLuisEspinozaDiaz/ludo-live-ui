import React from "react";
import { Plus, type LucideIcon } from "lucide-react";
import kittySvg from "../../assets/svg/kitty.svg";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  buttonText?: string;
  onButtonClick?: () => void;
  buttonIcon?: LucideIcon;
  rightContent?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  buttonText,
  onButtonClick,
  buttonIcon: ButtonIcon = Plus,
  rightContent,
}) => {
  return (
    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-6 ">
      <div className="flex items-center gap-4">
        <div className="shrink-0 bg-white rounded-full shadow-sm p-1 flex items-center justify-center w-12 h-12 overflow-hidden border border-pink-100">
          <img src={kittySvg} alt="Kitty Logo" className="w-10 h-10 object-contain animate-kitty-float  pointer-events-none" />
        </div>

        <div className="flex flex-col">
          <h1 className="text-[27px] font-extrabold text-[#2c2338] leading-tight tracking-tight">{title}</h1>
          <p className="text-[16px] font-bold text-[#7e768c] mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        {rightContent ? (
          rightContent
        ) : buttonText && onButtonClick ? (
          <button
            onClick={onButtonClick}
            className="flex items-center gap-2 bg-gradient-to-r from-[#ff1f68] to-[#ff3b7f] text-white px-5 py-3.5 rounded-full font-bold text-xs tracking-wide shadow-[0_4px_18px_rgba(255,31,104,0.35)] hover:shadow-[0_6px_22px_rgba(255,31,104,0.45)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <ButtonIcon size={16} strokeWidth={2.6} />
            <span>{buttonText}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default PageHeader;
