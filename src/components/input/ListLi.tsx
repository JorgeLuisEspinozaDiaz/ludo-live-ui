import React, { type ReactNode } from "react";
import type { IListLi } from "./typeInput";

export const ListLi = (props: IListLi) => {
  const { classNameItem, classItemOption, handleChangeClickMenu } = props;

  const { item, readView, handleChangeReadViewButton } = props;

  return (
    <li
      className={`${
        typeof classNameItem === "function" ? classNameItem(item) : classNameItem
      } text-text-color cursor-pointer  relative py-1.5 px-3 hover:bg-select-secondary-color rounded-md hover:text-select-text-color-list ${classItemOption} text-[10px]`}
      id="listbox-option-0"
      role="option"
      onClick={(e: any) => handleChangeClickMenu(e, item)}
    >
      <div className={"flex items-center " + classItemOption}>
        <span className={"font-normal block truncate " + classItemOption}>
          {handleChangeReadViewButton ? addClass(handleChangeReadViewButton(item), classItemOption) : item[readView || ""]}
        </span>
      </div>
    </li>
  );
};

const addClass = (elemento: ReactNode, clase: string): ReactNode => {
  if (
    React.isValidElement<{
      className?: string;
      children?: ReactNode;
    }>(elemento)
  ) {
    const { children, ...props } = elemento.props;

    const childrenWithClass = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return addClass(child, clase);
      }

      return child;
    });

    return React.cloneElement(
      elemento as React.ReactElement<any>,
      {
        ...props,
        className: `${elemento.props.className ?? ""} ${clase}`.trim(),
      },
      childrenWithClass,
    );
  }

  return elemento;
};
