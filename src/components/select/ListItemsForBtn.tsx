import type { IListItemsForBtn } from "./types";

export const ListItemsForBtn = (props: IListItemsForBtn) => {
  const {
    data,
    handleChangeReadViewButton,
    readView,
    inputSearchId,
    classText,
    handleKeyDown,
    search,
    activeSelect,
    handleChangeDeleteItemToDataSelect,
  } = props;

  const handleParseToView = (item: any) => {
    if (handleChangeReadViewButton) {
      return handleChangeReadViewButton(item);
    }

    return item[readView];
  };

  return (
    <div className={`flex flex-wrap gap-1 items-center ${data.length > 0 ? "py-1" : ""}`}>
      {data.map((dt, index) => (
        <span
          key={index}
          className="flex gap-x-1 justify-between items-center text-[9.5px] px-2 border border-sidebar-bg-color bg-sidebar-bg-color text-white rounded-lg"
        >
          {handleParseToView(dt)}

          <i className="bx bx-x-circle text-sm cursor-pointer text-red-500" onClick={(event) => handleChangeDeleteItemToDataSelect(event, index)}></i>
        </span>
      ))}

      {search && activeSelect == "" && (
        <input
          id={inputSearchId}
          className={`${classText} w-[40%] form-control focus:outline-none text-select-text-color text-xs min-h-5`}
          onClick={(event: any) => event.stopPropagation()}
          autoFocus={true}
          onKeyUp={handleKeyDown}
        />
      )}
    </div>
  );
};
