import { useEffect, useMemo, useRef, useState } from "react";
import "./input.css";
import { signal, useSignalEffect } from "@preact/signals-react";
import { ButtonSearch } from "./ButtonSearch";
import { InputCustom } from "./InputCustom";
import { ListUl } from "./ListUl";
import type { InputElement, InputValue, IPropsInput } from "./typeInput";
import { evalExpression } from "../../helper/Funtions";
import { Label } from "./LabelInput";

let countInstancia = 1;

export const Input = (props: IPropsInput) => {
  const { iconClassName, IconLeft } = props;
  const data = useMemo(() => props.data || [], [props.data]);
  const { className, style, value, onKeyUp, onBlur } = props;
  const { classNameLabel, labelStyle, label = "", styleContainer = "" } = props;
  const { dateMin, dateMax } = props;
  const { required, disabled, min, expresionMin, max, expresionMax } = props;
  const { inputStyle, placeholder = "", classNameInput, type, name } = props;
  const { update, form, messageError, validateFormulario } = props;
  const { typeInput = "first", keyValueFilter = "id", progressValue } = props;
  const { autocomplete, classListItemCustom, classNameItem } = props;
  const { readView, handleChangeReadViewButton, textArea, rowsTextArea = 4 } = props;
  const { is_search = false, onClickSearch, onChange, onClick } = props;
  const { isArrowForNumber, keyValue = "id", onEnter, autoFocus = false } = props;
  const [activeSelect, setActiveSelect] = useState("hidden");
  const idRef = useRef<string | null>(null);

  if (!idRef.current) {
    const getTime = new Date().getTime() + countInstancia;
    idRef.current = `input-${getTime}`;
    countInstancia++;
  }

  const inputId = idRef.current;
  const labelIconSuccess = `icon-label-success-${inputId}`;
  const labelIconWarning = `icon-label-warning-${inputId}`;
  const containerLoading = `container-loading-${inputId}`;
  const textErrorId = `text-error-${inputId}`;
  const classItemOptionRef = useRef(`custom-select-option-${inputId}`);
  const classTextRef = useRef(`selected-text-${inputId}`);
  const classItemOption = classItemOptionRef.current;
  const classText = classTextRef.current;
  const buttonChildRef = useRef<any>(null);
  const dataAux = signal([...data]);
  const minArray = useMemo(() => min ?? [], [min]);
  const maxArray = useMemo(() => max ?? [], [max]);

  const evaluarExpresion = (inputValue: InputValue): boolean => {
    const cumpleMin = minArray.length === 0 || minArray.some((v) => evalExpression(inputValue, expresionMin, v));
    const cumpleMax = maxArray.length === 0 || maxArray.some((v) => evalExpression(inputValue, expresionMax, v));
    return cumpleMin && cumpleMax;
  };

  const addOrRemoveBorderRedToInput = (inputValue: InputValue) => {
    if (!required) return;
    const nodeInputId = document.getElementById(inputId);
    const nodeTextErrorId = document.getElementById(textErrorId);
    const response = evaluarExpresion(inputValue);
    if (nodeInputId) {
      if (response) nodeInputId.classList.remove("border-red-600");
      else nodeInputId.classList.add("border-red-600");
    }

    if (nodeTextErrorId) {
      if (response) {
        nodeTextErrorId.classList.add("hidden");
        nodeTextErrorId.textContent = "";
      } else {
        nodeTextErrorId.classList.remove("hidden");
        nodeTextErrorId.textContent = messageError || `Es necesario ingresar ${label}`;
      }
    }
  };

  const handleChangeRemoveBorderRedToInput = () => {
    const nodeInputId = document.getElementById(inputId);
    const nodeTextErrorId = document.getElementById(textErrorId);
    if (nodeInputId) {
      nodeInputId.classList.remove("border-red-600");
    }
    if (nodeTextErrorId) {
      nodeTextErrorId.classList.add("hidden");
    }
  };

  const handleChangeValidateFormulario = (inputValue: InputValue) => {
    if (!required) return;

    const response = evaluarExpresion(inputValue);
    if (validateFormulario?.value) {
      if (response) {
        validateFormulario.value.data = validateFormulario.value.data.filter((dt) => dt.name != name);
      } else {
        const findData = validateFormulario.value.data.find((dt) => dt.name == name);
        const newItem: any = {
          name,
          value: inputValue,
          message: messageError || `Es necesario ingresar ${label}`,
        };

        if (findData) {
          validateFormulario.value.data = validateFormulario.value.data.map((dt) => (dt.name == findData.name ? newItem : dt));
        } else {
          validateFormulario.value.data = [...validateFormulario.value.data, newItem];
        }
      }
    }
  };

  const handleChangeValidateFormularioForProgressValue = (inputValue: InputValue) => {
    const response = inputValue.toString().length > 0;
    if (!progressValue?.value) return;
    const { data } = progressValue.value;
    const newItem = {
      name,
      value: inputValue,
      message: messageError || `Es necesario ingresar ${label}`,
    };

    const updatedData = response
      ? data.filter((dt) => dt.name !== name)
      : data.some((dt) => dt.name === name)
        ? data.map((dt) => (dt.name === name ? newItem : dt))
        : [...data, newItem];

    progressValue.value = {
      ...progressValue.value,
      data: updatedData,
      validate: progressValue.value.total - updatedData.length,
    };
  };

  const handleChangeRequiredPassValue = (inputValue: InputValue) => {
    const nodeIconSuccess = document.getElementById(labelIconSuccess);
    const nodeIconWarning = document.getElementById(labelIconWarning);
    if (required) {
      handleChangeValidateFormulario(inputValue);
      if (evaluarExpresion(inputValue)) {
        if (nodeIconSuccess) nodeIconSuccess.classList.remove("hidden");
        if (nodeIconWarning) nodeIconWarning.classList.add("hidden");
      } else {
        if (nodeIconSuccess) nodeIconSuccess.classList.add("hidden");
        if (nodeIconWarning) nodeIconWarning.classList.remove("hidden");
      }
    }
  };

  const keyUpHandler = (ev: any) => {
    const { value: inputValue } = ev.target;
    if (onKeyUp) onKeyUp(ev);
    if (ev.key === "Enter" && onEnter) onEnter(ev);
    addOrRemoveBorderRedToInput(inputValue);
    handleChangeRequiredPassValue(inputValue);
    handleChangeValidateFormularioForProgressValue(inputValue);
    dataAux.value = data.filter((dt: any) =>
      dt[keyValueFilter]
        .toString()
        .toLowerCase()
        .includes((form[name] || "").toLowerCase()),
    );
  };

  const handleChangeInput = (ev: any) => {
    if (onChange) onChange(ev);
  };

  const blurHandler = (ev: any) => {
    const { value: inputValue } = ev.target;
    if (onBlur) onBlur(ev);
    handleChangeRequiredPassValue(inputValue);
    addOrRemoveBorderRedToInput(inputValue);
  };

  const handleChangeClickMenu = (e: any, item: any) => {
    e.stopPropagation();
    setActiveSelect("hidden");
    const event = {
      target: {
        name,
        value: item[keyValue] || undefined,
      },
    };
    const { value: inputValue } = event.target;
    if (onClick) onClick(event);
    if (form && form[name] != undefined) buttonChildRef.current.handleChangeValueItem(inputValue);
    handleChangeRequiredPassValue(inputValue);
    addOrRemoveBorderRedToInput(inputValue);
  };

  const handleClickOutside = (e: any) => {
    if (!e.target.classList.contains(classItemOption) && !e.target.classList.contains(classText)) setActiveSelect("hidden");
  };

  useEffect(() => {
    if (progressValue && name && !progressValue.value.dataKey.includes(name)) {
      progressValue.value = {
        ...progressValue.value,
        total: progressValue.value.total + 1,
        dataKey: [...progressValue.value.dataKey, name],
      };
    }

    return () => {
      if (progressValue && name && progressValue.value.dataKey.includes(name)) {
        const total = progressValue.value.total - 1;
        const dataKey = progressValue.value.dataKey.filter((key) => key !== name);
        const dataProgressvalue = progressValue.value?.data ?? [];
        const filteredData = dataProgressvalue.filter((item) => item.name !== name);
        progressValue.value = {
          ...progressValue.value,
          total,
          dataKey,
          data: filteredData,
          validate: dataKey.length - filteredData.length,
        };
      }
    };
  }, []);

  const handleChangeUpdateNodeInput = (nodeInput: InputElement, newValue: any) => {
    if (nodeInput) {
      nodeInput.setAttribute("defaultValue", newValue);
      nodeInput.value = newValue;
    }
  };

  useSignalEffect(() => {
    let nodeInput: HTMLInputElement | HTMLTextAreaElement = document.querySelector(`input[id="${inputId}"][name="${name}"]`) as HTMLInputElement;

    if (textArea) nodeInput = document.querySelector(`textarea[id="${inputId}"][name="${name}"]`) as HTMLTextAreaElement;

    if (form) {
      let newValue = form[name] ?? "";
      if (typeof form[name] == "number") newValue = (form[name] == undefined ? "" : form[name]).toString().length == 0 ? "" : form[name];

      handleChangeUpdateNodeInput(nodeInput, newValue);
      handleChangeRequiredPassValue(newValue);
      if (validateFormulario?.value.active) addOrRemoveBorderRedToInput(newValue);
      handleChangeValidateFormularioForProgressValue(newValue);
    } else {
      handleChangeUpdateNodeInput(nodeInput, value?.toString() || "");
      handleChangeRequiredPassValue(value || "");
      if (validateFormulario?.value.active) addOrRemoveBorderRedToInput(value || "");
      handleChangeValidateFormularioForProgressValue(value ?? "");
    }
    if (!update?.value) handleChangeRemoveBorderRedToInput();
    const nodeInputId = document.getElementById(inputId);
    if (nodeInputId) {
      if (dateMin) nodeInputId.setAttribute("min", dateMin);
      if (dateMax) nodeInputId.setAttribute("max", dateMax);
    }
  });

  useEffect(() => {
    if (validateFormulario?.value.active) {
      let newValue = form[name] || "";
      if (typeof form[name] == "number") newValue = (form[name] == undefined ? "" : form[name]).toString().length == 0 ? "" : form[name];
      addOrRemoveBorderRedToInput(newValue);
    }
  }, [validateFormulario?.value]);

  useEffect(() => {
    let content = "";
    if (form) content = form[name] || "";
    handleChangeRequiredPassValue(content);
    handleChangeValidateFormulario(content);
    handleChangeValidateFormularioForProgressValue(content);
  }, []);

  useEffect(() => {
    dataAux.value = data.filter((dt: any) => dt[keyValueFilter].toString().includes(form[name] || ""));
    if (form && !(dataAux.value || []).length && !(form[name] != undefined)) setActiveSelect("hidden");
  }, [data]);

  useEffect(() => {
    if (activeSelect == "hidden") document.removeEventListener("mousedown", handleClickOutside);
    else document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeSelect]);

  return (
    <>
      <div className={`${styleContainer} relative ${typeInput == "first" && ""}`}>
        <div className={"relative " + className} style={style}>
          <ButtonSearch is_search={is_search} typeInput={typeInput} onClickSearch={onClickSearch} containerLoading={containerLoading} />

          <InputCustom
            IconLeft={IconLeft}
            iconClassName={iconClassName}
            autoFocus={autoFocus}
            inputId={inputId}
            inputStyle={inputStyle}
            placeholder={placeholder}
            classNameInput={classNameInput}
            type={type}
            name={name}
            required={required}
            disabled={disabled}
            isArrowForNumber={isArrowForNumber}
            classText={classText}
            onKeyUp={keyUpHandler}
            onBlur={blurHandler}
            onChange={handleChangeInput}
            onFocus={setActiveSelect}
            typeInput={typeInput}
            containerLoading={containerLoading}
            ref={buttonChildRef}
            textArea={textArea}
            rowsTextArea={rowsTextArea}
            is_search={is_search}
            label={label}
          />

          <Label
            classNameLabel={classNameLabel}
            labelStyle={labelStyle}
            label={label}
            inputId={inputId}
            required={required}
            disabled={disabled}
            labelIconSuccess={labelIconSuccess}
            labelIconWarning={labelIconWarning}
            containerLoading={containerLoading}
            typeInput={typeInput}
          />

          {autocomplete && (
            <ListUl
              data={dataAux}
              classListItemCustom={classListItemCustom || ""}
              classNameItem={classNameItem}
              handleChangeClickMenu={handleChangeClickMenu}
              classItemOption={classItemOption || ""}
              readView={readView}
              activeSelect={activeSelect}
              handleChangeReadViewButton={handleChangeReadViewButton}
            />
          )}
        </div>

        <div className="absolute w-full">
          <span id={textErrorId} className="text-[11px] text-red-500 hidden align-top" />
        </div>
      </div>
    </>
  );
};
