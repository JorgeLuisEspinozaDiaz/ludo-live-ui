import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { IInputCustom } from "./typeInput";

export const InputCustom = forwardRef((props: IInputCustom, ref) => {
  const { iconClassName, IconLeft } = props;

  const { inputId, inputStyle, placeholder, type, name, is_search } = props;

  const { isArrowForNumber, disabled, classNameInput } = props;

  const { classText, onKeyUp, onBlur, onChange, onFocus, typeInput } = props;

  const { containerLoading, textArea, autoFocus, label, rowsTextArea } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const inputTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const getClassName = (typeInput: string) => {
    const baseClass = `${is_search && ""} border-gray-300 appearance-none !w-full text-text-color focus:outline-none focus:border-primary-color`;

    const baseClas = "block focus:ring-0 focus:border-primary-color peer";

    switch (typeInput) {
      case "first":
        return `${baseClass} text-[14px] pl-3 leading-tight px-2 py-2.5 border-[1px] border-slate-100 rounded-2xl ${
          label ? "mt-[2.2rem]" : ""
        } focus:border-primary-color/50 focus:ring-2 focus:ring-primary-color/10 transition-all bg-slate-50 placeholder:text-slate-300 placeholder:font-medium placeholder:tracking-wide placeholder:text-[13px]`;

      case "second":
        return `${baseClass} ${baseClas} rounded-t-lg px-2.5 pb-1.5 pt-5 bg-gray-100 border-0 border-b-2`;

      case "third":
        return `${baseClass} ${baseClas} bg-white pt-4 pb-0.5 px-0 bg-transparent border-0 border-b-2`;

      case "fourth":
        return `${baseClass} ${baseClas} bg-white py-1.5 px-2 rounded-md bg-transparent border-2`;

      default:
        return baseClass;
    }
  };

  const newClassNameInput =
    typeof classNameInput === "function" ? classNameInput({}) : `${classNameInput} ${type === "number" ? "remove-arrow" : ""}`;

  useImperativeHandle(ref, () => ({
    handleChangeValueItem: (newValue: string) => {
      if (textArea) {
        if (inputTextAreaRef.current) {
          inputTextAreaRef.current.value = newValue;
        }
      } else if (inputRef.current) {
        inputRef.current.value = newValue;
      }
    },
  }));

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (autoFocus) {
        inputRef.current?.focus();
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  const commonClassName = `
      ${newClassNameInput}
      ${getClassName(typeInput)}
      ${isArrowForNumber ? "" : "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"}
      ${classText}
    `;

  return (
    <>
      {textArea ? (
        <textarea
          ref={inputTextAreaRef}
          id={inputId}
          rows={rowsTextArea}
          style={inputStyle}
          placeholder={placeholder}
          autoComplete="off"
          name={name}
          disabled={disabled}
          onKeyUp={(ev) => onKeyUp(ev)}
          onBlur={(ev) => onBlur(ev)}
          onChange={(ev) => onChange(ev)}
          onFocus={() => onFocus("")}
          className={commonClassName}
        />
      ) : IconLeft ? (
        <div className="flex ">
          <div className={`w-20 h-[3.9rem] content-center ml-5 absolute top-6 ${iconClassName ? iconClassName : "left-0"}`}>
            {IconLeft && <IconLeft strokeWidth="1.8" size={17} className="text-gray-300" />}
          </div>

          <input
            ref={inputRef}
            id={inputId}
            style={inputStyle}
            type={type || "text"}
            placeholder={placeholder}
            autoComplete="off"
            name={name}
            disabled={disabled}
            onKeyUp={(ev) => onKeyUp(ev)}
            onBlur={(ev) => onBlur(ev)}
            onChange={(ev) => onChange(ev)}
            onFocus={() => onFocus("")}
            className={`${disabled ? "cursor-not-allowed bg-[#ebeff4]" : ""} ${
              IconLeft !== undefined ? "pl-14!" : "pl-0!"
            } ${iconClassName} ${commonClassName}`}
          />
        </div>
      ) : (
        <input
          ref={inputRef}
          id={inputId}
          style={inputStyle}
          type={type || "text"}
          placeholder={placeholder}
          autoComplete="off"
          name={name}
          disabled={disabled}
          onKeyUp={(ev) => onKeyUp(ev)}
          onBlur={(ev) => onBlur(ev)}
          onChange={(ev) => onChange(ev)}
          onFocus={() => onFocus("")}
          className={commonClassName}
        />
      )}

      <div id={containerLoading} className="container-loading" />
    </>
  );
});

InputCustom.displayName = "InputCustom";
