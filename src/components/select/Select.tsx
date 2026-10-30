import { signal, useSignalEffect } from "@preact/signals-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { evalExpression } from "../../helper/Funtions";
import { TitleLabel } from "./TitleLabel";
import { Button } from "./Button";
import { ListUl } from "./ListUl";
import type { IPropsSelect } from "./types";

let valueId = 1;

export const Select = memo((props: IPropsSelect) => {
  const data = useMemo(() => props.data ?? [], [props.data]);
  const onChange = useMemo(() => props.onChange, [props.onChange]);
  const [activeSelect, setActiveSelect] = useState("hidden");

  const {
    classNameLabel,
    labelStyle,
    label,
    classNameButton,
    required,
    disabled,
    classNameLabelInButton,
    registrosView,
    placeholder = "Seleccione",
    labelRender,
    readView,
    name,
    search,
    searchValue,
    iconBeforeLabel,
    classNameItem,
    keyValue,
    update,
    form,
    handleSearch,
    handleChangeReadViewButton,
    classListItemCustom,
    value,
    messageError,
    validateFormulario,
    multiple = false,
  } = props;

  const buttonChildRef = useRef<any>(null);
  const getTime = new Date().getTime() + valueId;
  const [dataSelect, setDataSelect] = useState<any[]>([]);
  const selectId = `select-${getTime}`;
  const inputSearchId = `input-search-${selectId}`;
  const textErrorId = ` text-error-${selectId}`;
  const buttonSelectId = `btn-select-${selectId}`;
  const labelIconSuccess = `icon-label-success-${selectId}`;
  const labelIconWarning = `icon-label-warning-${selectId}`;
  const containerLoading = `container-loading-${selectId}`;

  valueId = valueId + 1;

  const [classItemOption] = useState(`custom-select-option-${getTime}`);
  const [classText] = useState(`selected-text-${getTime}`);
  const dataAux = signal([...data]);

  const evaluarExpresion = (value: number | string | undefined | Date | boolean | any[] | null): boolean => {
    if (Array.isArray(value)) return value.length == 0 ? false : true;
    return evalExpression(value, ">", 0);
  };

  const handleChangeFilterDataForMultiple = (newDataSelect: any[]) => {
    const dataOriginal = [...data];
    const dataFilter = dataOriginal.filter((originalItem) => {
      return !newDataSelect.some((selectedItem) => selectedItem[keyValue] === originalItem[keyValue]);
    });

    dataAux.value = dataFilter;
  };

  const handleChangeClickButton = () => {
    activeSelect == "hidden" ? setActiveSelect("") : setActiveSelect("hidden");
    if (form) addOrRemoveBorderRedToInput(form[name]);
    else if (value) addOrRemoveBorderRedToInput(value);
  };

  const handleChangeClickMenu = (e: any, item: any) => {
    e.stopPropagation();
    setActiveSelect("hidden");
    const newDataSelect = [...dataSelect, item];
    if (item && multiple) setDataSelect(newDataSelect);
    let selectedValue = item[keyValue] ?? null;
    if (multiple) {
      const newValue: any[] = [];
      newDataSelect.map((dt) => {
        if (dt && dt[keyValue]) newValue.push(dt[keyValue]);
      });
      selectedValue = newValue;
    }

    const event = {
      target: {
        name,
        value: selectedValue,
        item,
      },
    };
    if (onChange) onChange(event);
    if (form && form[name] != undefined && form[name] != null) buttonChildRef.current.handleChangeValueItem(item);
    handleChangeValidateFormulario(selectedValue);
    addOrRemoveBorderRedToInput(selectedValue);
  };

  const handleClickOutside = (e: any) => {
    const classList = e.target.classList;
    if (!classList.contains(classItemOption) && !classList.contains(classText)) setActiveSelect("hidden");
  };

  const normalizeText = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const handleChangeFilterData = (value: string) => {
    if (value.length > 0) {
      const dataTemp = [...data];
      let readViewAux = readView ?? "";
      if (typeof searchValue === "string") readViewAux = searchValue;
      dataAux.value = dataTemp.filter((dt) =>
        (typeof searchValue === "function" ? searchValue(dt) : normalizeText(dt[readViewAux]).toLowerCase()).includes(value.toLowerCase()),
      );
    } else dataAux.value = [...data];
  };

  const addOrRemoveBorderRedToInput = (value: string | number | Date | boolean | any[]) => {
    if (!required) return;
    const nodeButtonSelectId = document.getElementById(buttonSelectId);
    const nodeTextErrorId = document.getElementById(textErrorId);
    const response = evaluarExpresion(value);
    if (nodeTextErrorId) {
      if (response) {
        nodeTextErrorId.classList.add("hidden");
        nodeTextErrorId.textContent = "";
        nodeButtonSelectId?.classList.remove("border-red-600");
      } else {
        nodeTextErrorId.classList.remove("hidden");
        nodeTextErrorId.textContent = messageError ?? `Es necesario ingresar ${label}`;
        nodeButtonSelectId?.classList.add("border-red-600");
      }
    }
  };

  const handleChangeRemoveBorderRedToInput = () => {
    const nodeButtonSelectId = document.getElementById(buttonSelectId);
    const nodeTextErrorId = document.getElementById(textErrorId);
    if (nodeButtonSelectId) nodeButtonSelectId.classList.remove("border-red-600");
    if (nodeTextErrorId) nodeTextErrorId.classList.add("hidden");
  };

  const handleChangeValidateFormulario = (value: string | number | Date | boolean | any[] | undefined | null) => {
    if (!required) return;
    const response = evaluarExpresion(value);
    if (validateFormulario?.value == undefined) return;
    const { data } = validateFormulario.value;
    const newItem = {
      name,
      value,
      message: messageError ?? `Es necesario ingresar ${label}`,
    };
    const nodeIconSuccess = document.getElementById(labelIconSuccess);
    const nodeIconWarning = document.getElementById(labelIconWarning);
    if (response) {
      if (nodeIconSuccess) nodeIconSuccess.classList.remove("hidden");
      if (nodeIconWarning) nodeIconWarning.classList.add("hidden");
    } else {
      if (nodeIconSuccess) nodeIconSuccess.classList.add("hidden");
      if (nodeIconWarning) nodeIconWarning.classList.remove("hidden");
    }

    const updatedData = response
      ? data.filter((dt) => dt.name !== name)
      : data.some((dt) => dt.name === name)
        ? data.map((dt) => (dt.name === name ? newItem : dt))
        : [...data, newItem];

    validateFormulario.value.data = updatedData;
  };

  const handleChangeDeleteItemToDataSelect = (e: any, indexDt: number) => {
    e.stopPropagation();
    const newDataSelect = dataSelect.filter((_, index) => index != indexDt);
    if (multiple) setDataSelect(newDataSelect);
    let selectedValue: any[] = [];
    if (multiple) {
      const newValue: any[] = [];
      newDataSelect.map((dt) => {
        if (dt && dt[keyValue]) newValue.push(dt[keyValue]);
      });
      selectedValue = newValue;
    }

    const event = {
      target: {
        name,
        value: selectedValue,
      },
    };

    if (onChange) onChange(event);
    handleChangeValidateFormulario(selectedValue);
    addOrRemoveBorderRedToInput(selectedValue);
  };

  useEffect(() => {
    if (activeSelect == "hidden") document.removeEventListener("mousedown", handleClickOutside);
    else document.addEventListener("mousedown", handleClickOutside);
    if (form) addOrRemoveBorderRedToInput(form[name]);
    else if (value) addOrRemoveBorderRedToInput(value);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeSelect]);

  useEffect(() => {
    if (validateFormulario?.value.active) addOrRemoveBorderRedToInput(form[name] ?? "");
  }, [validateFormulario?.value]);

  useSignalEffect(() => {
    if (form) {
      if (Array.isArray(form[name])) {
        const dataSelectUpdate: any[] = [];
        form[name].map((dt) => {
          const findItem = data.find((dtItem: any) => dtItem[keyValue ?? "id"] == dt);
          if (findItem) dataSelectUpdate.push(findItem);
        });
        setDataSelect(dataSelectUpdate);
        handleChangeValidateFormulario(form[name] ?? value);
      } else handleChangeValidateFormulario(form[name] ?? "");
    } else handleChangeValidateFormulario(value);
    if (!update?.value) handleChangeRemoveBorderRedToInput();
  });

  if (multiple) handleChangeFilterDataForMultiple(dataSelect);

  return (
    <div className={props.classNameContainer + " relative "}>
      <TitleLabel
        label={label}
        labelRender={labelRender}
        classNameLabel={classNameLabel}
        labelStyle={labelStyle}
        required={required}
        disabled={disabled}
        labelIconSuccess={labelIconSuccess}
        labelIconWarning={labelIconWarning}
        iconBeforeLabel={iconBeforeLabel}
      />

      <Button
        label={label}
        activeSelect={activeSelect}
        classText={classText}
        handleChangeClickButton={handleChangeClickButton}
        readView={readView}
        classNameButton={classNameButton}
        classNameLabelInButton={classNameLabelInButton}
        data={dataAux}
        disabled={disabled}
        keyValue={keyValue}
        placeholder={placeholder}
        value={value}
        ref={buttonChildRef}
        update={update}
        form={form}
        name={name}
        search={search}
        handleChangeFilterData={handleChangeFilterData}
        handleChangeClickMenu={handleChangeClickMenu}
        handleSearch={handleSearch}
        handleChangeReadViewButton={handleChangeReadViewButton}
        inputSearchId={inputSearchId}
        buttonSelectId={buttonSelectId}
        multiple={multiple}
        dataSelect={dataSelect}
        handleChangeDeleteItemToDataSelect={handleChangeDeleteItemToDataSelect}
        containerLoading={containerLoading}
      />

      <div id={containerLoading} className="container-loading z-50!"></div>

      <ListUl
        data={dataAux}
        classListItemCustom={classListItemCustom ?? ""}
        classNameItem={classNameItem}
        handleChangeClickMenu={handleChangeClickMenu}
        classItemOption={classItemOption}
        readView={readView}
        registrosView={registrosView}
        activeSelect={activeSelect}
        handleChangeReadViewButton={handleChangeReadViewButton}
        buttonSelectId={buttonSelectId}
        usePortal={props.usePortal}
      />

      <div className="absolute w-full">
        <span id={textErrorId} className="text-[11px] text-red-500 hidden align-top"></span>
      </div>
    </div>
  );
});
