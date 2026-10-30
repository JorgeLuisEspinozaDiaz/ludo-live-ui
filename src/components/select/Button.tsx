import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { signal, useSignalEffect } from "@preact/signals-react";
import { addClass } from "./utils";
import { ListItemsForBtn } from "./ListItemsForBtn";
import { IconForBtn } from "./IconForBtn";
import type { IButton } from "./types";

export const Button = forwardRef((props: IButton, ref) => {
  const {
    classNameButton,
    classText,
    disabled,
    value,
    placeholder,
    handleChangeClickButton,
    classNameLabelInButton,
    name,
    data,
    readView,
    keyValue = "id",
    activeSelect,
    update,
    form,
    handleChangeFilterData,
    search,
    handleSearch,
    inputSearchId,
    handleChangeClickMenu,
    handleChangeReadViewButton,
    buttonSelectId,
    multiple,
    dataSelect,
    handleChangeDeleteItemToDataSelect,
    containerLoading,
  } = props;

  const [defaultValue, setDefaultValue] = useState<React.JSX.Element | string>(<>{placeholder}</>);

  const handleChangeDefaultValueNode = (item?: any) => {
    const nodeAdd = item ? (
      handleChangeReadViewButton ? (
        <>{addClass(handleChangeReadViewButton(item), "truncate")}</>
      ) : (
        <>{item?.[readView] ?? placeholder}</>
      )
    ) : (
      <>{placeholder}</>
    );

    setDefaultValue(nodeAdd);
  };

  const handleChangeValueItem = (item: any) => handleChangeDefaultValueNode(item);

  useImperativeHandle(ref, () => ({
    handleChangeValueItem,
  }));

  const handleClickButton = (event: any) => {
    event.stopPropagation();
    handleChangeClickButton();
  };

  const handleKeyDown = async (event: any) => {
    event.preventDefault();

    const nodeInput = document.getElementById(inputSearchId) as HTMLInputElement;

    if (handleChangeFilterData && nodeInput) {
      handleChangeFilterData(nodeInput.value);

      const container = document.getElementById(containerLoading);

      if (container) {
        container.classList.add("active");
      }

      if (event.code === "Enter" && handleSearch) {
        await handleSearch(nodeInput.value);
      }

      if (container) {
        container.classList.remove("active");
      }
    }
  };

  const handleChangeReturnListItemsForBtn = () => {
    if (!multiple) return <></>;

    return (
      <ListItemsForBtn
        data={dataSelect}
        handleChangeReadViewButton={handleChangeReadViewButton}
        readView={readView}
        inputSearchId={inputSearchId}
        classText={classText}
        handleKeyDown={handleKeyDown}
        search={search}
        activeSelect={activeSelect}
        handleChangeDeleteItemToDataSelect={handleChangeDeleteItemToDataSelect}
      />
    );
  };

  const ListItemsNodo = signal<React.JSX.Element>(handleChangeReturnListItemsForBtn());

  const handleChangeDeleteItem = (e: any) => {
    handleChangeClickMenu(e, {});
    handleChangeDefaultValueNode(null);
  };

  useSignalEffect(() => {
    update?.value;

    const item = form ? (form[name] ?? "") : value;

    const findItem = data.value.find((dt: any) => dt[keyValue] == item);

    handleChangeDefaultValueNode(findItem ? findItem : null);
  });

  useEffect(() => {
    ListItemsNodo.value = handleChangeReturnListItemsForBtn();

    if (dataSelect.length == 0 && !form?.[name]) {
      setDefaultValue(placeholder);
    }
  }, [dataSelect]);

  return (
    <button
      type="button"
      className={` ${classNameButton} ${classText} ${disabled ? " bg-gray-100 " : "  "} ${
        activeSelect == "" ? "border-select-primary-color " : ""
      } relative w-full pl-3 pr-10 text-left cursor-default focus:outline-none sm:text-sm py-2.5 text-slate-700 placeholder:text-slate-300 outline-none focus:border-select-primary-color/50 focus:ring-2 focus:ring-select-primary-color/10 transition-all bg-slate-50 border border-slate-100 rounded-2xl px-4 text-[13px] font-medium`}
      aria-haspopup="listbox"
      aria-expanded="true"
      aria-labelledby="listbox-label"
      onClick={handleClickButton}
      id={buttonSelectId}
      disabled={disabled}
    >
      <div className="h-full flex">
        {multiple ? (
          <span className={`${classNameLabelInButton} ${classText} flex items-center w-full h-full`} id="btn-span-select">
            {dataSelect.length != 0 || activeSelect == "" ? (
              ListItemsNodo
            ) : (
              <span className={`${classText} block truncate text-select-text-color text-[13px]`}>{defaultValue}</span>
            )}
          </span>
        ) : (
          <span
            className={`${classNameLabelInButton} ${classText} flex items-center w-full h-full ${search && activeSelect == "" ? "hidden" : "flex"}`}
            id="btn-span-select"
          >
            <span className={`${classNameLabelInButton} ${classText} block truncate text-select-text-color text-[13px]`}>{defaultValue}</span>
          </span>
        )}

        {!multiple && search && form && form[name] != undefined && form[name] != null && form[name].toString().length > 0 && (
          <span
            className="absolute right-8 flex justify-center items-center text-select-text-color h-5 rounded-full hover:bg-gray-100 cursor-pointer"
            onClick={handleChangeDeleteItem}
          >
            <i className="bx bx-x text-lg"></i>
          </span>
        )}

        <IconForBtn activeSelect={activeSelect} />
      </div>

      {!multiple && search && activeSelect == "" && (
        <input
          id={inputSearchId}
          className={`${classText} w-full h-full form-control focus:outline-none text-select-text-color text-xs`}
          onClick={(event: any) => event.stopPropagation()}
          autoFocus={true}
          onKeyUp={handleKeyDown}
        />
      )}
    </button>
  );
});
