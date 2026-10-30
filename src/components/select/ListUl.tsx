import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import type { IListUl } from "./types";
import { ListLi } from "./ListLi";

export const ListUl = (props: IListUl) => {
  const {
    data,
    classNameItem,
    handleChangeClickMenu,
    classItemOption,
    readView,
    activeSelect,
    handleChangeReadViewButton,
    classListItemCustom,
    usePortal = true,
    buttonSelectId,
  } = props;

  const [position, setPosition] = useState<any>({});

  useEffect(() => {
    if (!usePortal) return;

    const button = document.getElementById(buttonSelectId);

    if (button) {
      const rect = button.getBoundingClientRect();

      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [activeSelect, usePortal, buttonSelectId]);

  const content = (
    <ul
      className={`${activeSelect} ${classListItemCustom} ${
        usePortal ? "fixed z-[9999]" : "absolute z-20"
      } bg-white shadow-custom max-h-56 rounded-md py-1 text-base ring-1 ring-select-tertiary-color ring-opacity-5 overflow-auto focus:outline-none sm:text-sm shadow-lg`}
      style={
        usePortal
          ? {
              top: position.top,
              left: position.left,
              width: position.width,
            }
          : {}
      }
    >
      {data.value.map((item: any, index: number) => (
        <ListLi
          key={index}
          classNameItem={classNameItem}
          classItemOption={classItemOption}
          handleChangeClickMenu={handleChangeClickMenu}
          item={item}
          readView={readView}
          handleChangeReadViewButton={handleChangeReadViewButton}
        />
      ))}
    </ul>
  );

  if (usePortal) {
    return createPortal(content, document.body);
  }

  return content;
};
