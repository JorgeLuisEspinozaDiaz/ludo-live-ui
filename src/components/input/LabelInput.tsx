import { Asterisk, CheckCircle } from "lucide-react";
import type { ILabel } from "./typeInput";

export const Label = (props: ILabel) => {
  const { label, classNameLabel, typeInput } = props;
  const { labelStyle, inputId, required, disabled } = props;
  const { labelIconSuccess, labelIconWarning } = props;

  if (!label || label.length === 0) {
    return null;
  }

  const renderIcons = () =>
    required &&
    !disabled && (
      <>
        <CheckCircle id={labelIconSuccess} className="w-4 h-4 text-green-500 flex items-center ml-1" />
        <Asterisk id={labelIconWarning} className="w-4 h-4 text-red-500 flex items-center ml-1" />
      </>
    );

  const getClassName = () => {
    const baseClass =
      " absolute flex text-xs duration-300 transform scale-75 origin-[0] peer-focus:text-input-primary-color peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 ";

    switch (typeInput) {
      case "second":
        return `${baseClass} top-[0.90rem] z-[1] left-2.5 -translate-y-4 peer-focus:-translate-y-4 cursor-text`;

      case "third":
        return `${baseClass} top-[0.86rem] z-[1] peer-focus:left-0 -translate-y-4 peer-focus:-translate-y-4 cursor-text`;

      case "fourth":
        return `${baseClass} bg-white px-1 mx-2 -translate-y-[1.10rem] top-[0.45rem] z-[1] peer-focus:left-0 peer-focus:-translate-y-[1.10rem] cursor-text`;

      default:
        return "absolute flex items-center text-[11px] font-extrabold pb-1 top-[0.8rem] uppercase";
    }
  };

  return (
    <label
      className={`${typeof classNameLabel === "function" ? classNameLabel({}) : classNameLabel} ${getClassName()} text-text-color `}
      style={labelStyle}
      htmlFor={inputId}
    >
      {label}

      {renderIcons()}
    </label>
  );
};
