import type { IListLi } from "./types";
import { addClass } from "./utils";

export const ListLi = (props: IListLi) => {
  const { classNameItem, classItemOption, handleChangeClickMenu, item, readView, handleChangeReadViewButton } = props;

  return (
    <li
      className={`${classNameItem} ${classItemOption} text-select-text-color cursor-pointer font-semibold  relative py-1 px-3 hover:bg-select-secondary-color/90 rounded-md hover:text-select-text-color-list text-[13px]`}
      id="listbox-option-0"
      role="option"
      onClick={(e: any) => handleChangeClickMenu(e, item)}
    >
      <span className={`${classItemOption} items-center block`}>
        {handleChangeReadViewButton ? addClass(handleChangeReadViewButton(item), classItemOption) : item[readView]}
      </span>
    </li>
  );
};
