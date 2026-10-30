import { useEffect, useState } from "react";
import { Ellipsis } from "lucide-react";
import { permissions } from "../helper/permissions";

export interface IDataForDropdown {
  id: number;
  name?: string;
  icon?: string;
  iconLucia?: any;
  classNameContent?: string;
  itemClassName?: string;
  classNameText?: string;
  disabled?: boolean;
  onClick?: (e: any, item: IDataForDropdown) => void;
  permissionClaim?: string;
  closeOnClick?: boolean;
}

interface IDropdown {
  icon?: string;
  forceClose?: boolean;
  classNameIcon?: string;
  classNameButton?: string;
  classNameContainerOptions?: string;
  classNameContainerOptionsLi?: string;
  positionList?: "left" | "right";
  data: IDataForDropdown[];
  iconList?: boolean;
  onClose?: () => void;
}

let instantDropDown = 1;

export const Dropdown = (props: IDropdown) => {
  const { icon, classNameIcon, data, classNameButton } = props;
  const { classNameContainerOptions = "", positionList = "left" } = props;
  const { classNameContainerOptionsLi = "", iconList = false } = props;
  const getTime = new Date().getTime();
  const [classItemOption] = useState(`custom-select-option-${getTime}-${instantDropDown}`);
  const [buttonId] = useState(`button-id-${getTime}-${instantDropDown}`);
  const [classUl] = useState(`custom-ul-${getTime}-${instantDropDown}`);
  const [classText] = useState(`selected-text-${getTime}-${instantDropDown}`);
  const [activeSelect, setActiveSelect] = useState("hidden");

  instantDropDown = instantDropDown + 1;

  const handleChangeClickButton = () => {
    activeSelect == "hidden" ? setActiveSelect("") : setActiveSelect("hidden");
  };

  const handleClickOutside = (e: any) => {
    if (!e.target.classList.contains(classItemOption) && !e.target.classList.contains(classText)) {
      closeDropdown();
    }
  };

  const closeDropdown = () => {
    setActiveSelect("hidden");
    props.onClose?.();
  };

  useEffect(() => {
    if (props.forceClose) {
      closeDropdown();
    }
  }, [props.forceClose]);

  useEffect(() => {
    if (activeSelect == "hidden") document.removeEventListener("mousedown", handleClickOutside);
    else document.addEventListener("mousedown", handleClickOutside);

    const ulNodo = document.querySelector(`.${classUl}`) as HTMLUListElement;
    const button = document.getElementById(buttonId);
    if (button) {
      const rect = button.getBoundingClientRect();
      if (ulNodo && rect.bottom >= 465) {
        ulNodo.classList.remove(positionList == "left" ? "left-0" : "right-0");

        if (ulNodo.offsetHeight > 0) {
          const sizeUp = ulNodo.offsetHeight + 16;
          const sizeWidthUp = ulNodo.offsetWidth;
          ulNodo.style.top = `-${sizeUp - 80}px `;
          ulNodo.style.left = `-${sizeWidthUp - 8}px`;
          // ulNodo.classList.add(`-top-[5.5rem]`);
          // ulNodo.classList.add("-left-28");
        }
      }
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeSelect]);

  return (
    <div className="relative">
      <button
        id={buttonId}
        onClick={handleChangeClickButton}
        className={`w-7 h-7 ${classNameButton} ${classText} relative flex items-center justify-center bg-slate-100 rounded-full text-xl text-[#293675] `}
      >
        {icon && <i className={`${icon} ${classNameIcon} ${classText} text-xl   `}></i>}
        <Ellipsis size={15} color="#62748e" />
        {iconList && (
          <div className="ml-3">
            <svg className={"w-2.5 h-2.5 ms-2.5 " + classText} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m1 1 4 4 4-4" />
            </svg>
          </div>
        )}
      </button>

      <ListUl
        data={data}
        classItemOption={classItemOption}
        activeSelect={activeSelect}
        classNameContainerOptions={classNameContainerOptions}
        classNameContainerOptionsLi={classNameContainerOptionsLi}
        positionList={positionList}
        classUl={classUl}
        handleChangeClickButton={handleChangeClickButton}
      />
    </div>
  );
};

interface IListUl {
  data: IDataForDropdown[];
  classItemOption?: string;
  classUl?: string;
  activeSelect: string;
  classNameContainerOptions: string;
  classNameContainerOptionsLi: string;
  positionList: "left" | "right";
  handleChangeClickButton: (event: Event) => void;
}

const ListUl = (props: IListUl) => {
  const { data, activeSelect, classItemOption, positionList } = props;
  const { handleChangeClickButton, classNameContainerOptions } = props;
  const { classNameContainerOptionsLi, classUl } = props;

  return (
    <ul
      className={` ${classUl} ${activeSelect} ${classNameContainerOptions} ${
        positionList == "left" ? "left-0" : "right-0"
      } absolute z-10 mt-1 h-fit py-1 w-44  bg-white  ring-black ring-opacity-5  focus:outline-none sm:text-sm rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60`}
      // } absolute z-10 mt-1 flex flex-col gap-2 !rounded-xl  min-w-fit w-fit  bg-white max-h-56  p-[.5rem]  ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm shadow-lg `}
      role="listbox"
      aria-labelledby="listbox-label"
      aria-activedescendant="listbox-option-3"
      id="list-select"
    >
      {data.map((item: any, index: number) => (
        <ListLi
          key={index * new Date().getTime()}
          classItemOption={classItemOption}
          handleChangeClickButton={handleChangeClickButton}
          classNameContainerOptionsLi={classNameContainerOptionsLi}
          item={item}
        />
      ))}
    </ul>
  );
};

interface IListLi {
  classItemOption?: string;
  item: IDataForDropdown;
  classNameContainerOptionsLi: string;
  handleChangeClickButton: (event: Event) => void;
}

const ListLi = (props: IListLi) => {
  const { classItemOption, handleChangeClickButton } = props;
  const { item, classNameContainerOptionsLi } = props;

  const handleChangeClickItem = (event: any) => {
    if (item.disabled) return;
    if (item.onClick) item.onClick(event, item);
    if (item.closeOnClick !== false) {
      handleChangeClickButton(event);
    }
  };

  if (!permissions(item.permissionClaim || "")) {
    return <></>;
  }

  return (
    <li
      id="listbox-option-0"
      role="option"
      onClick={handleChangeClickItem}
      className={` ${classNameContainerOptionsLi ?? ""} ${classItemOption ?? ""}`}
    >
      <div
        className={`w-full hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold flex items-center gap-4 cursor-pointer ${classItemOption ?? ""} ${item.classNameContent ?? ""}`}
      >
        {item.icon && <i className={`${classItemOption ?? ""} ${item.icon}`} />}

        {item.iconLucia && <span className={classItemOption ?? ""}>{item.iconLucia}</span>}

        <span className={`cursor-pointer ${classItemOption ?? ""} ${item.classNameText ?? ""}`}>{item.name}</span>
      </div>
    </li>
  );
};
