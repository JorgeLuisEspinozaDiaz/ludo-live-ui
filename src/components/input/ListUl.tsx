import { ListLi } from "./ListLi";
import type { IListUl } from "./typeInput";

export const ListUl = (props: IListUl) => {
  const { data, classNameItem, handleChangeClickMenu } = props;

  const { classItemOption, readView, registrosView, activeSelect } = props;

  const { handleChangeReadViewButton, classListItemCustom } = props;

  const classUl = registrosView == "top" ? " -top-40 " : " ";

  return (
    <ul
      className={`${activeSelect} ${classUl} ${classListItemCustom} absolute z-10 mt-1 w-full bg-white shadow-md max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm`}
      role="listbox"
      aria-labelledby="listbox-label"
      aria-activedescendant="listbox-option-3"
      id="list-select"
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
};
