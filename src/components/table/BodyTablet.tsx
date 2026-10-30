import type { IHeaderTable } from "./Tablet";

interface IBody {
  header: IHeaderTable<any>[];
  data: Array<any>;
  isLoading?: boolean;
  showBorderBody: boolean;
  intercalateColorBody: boolean;
  onClickRow?: (item: any) => void;
}

export const BodyTablet = (props: IBody) => {
  const { header, data, isLoading, showBorderBody } = props;
  const { intercalateColorBody, onClickRow } = props;

  return data.map((dt, index) => (
    <RowBody
      key={index}
      header={header}
      item={dt}
      index={index}
      isLoading={isLoading}
      dataLength={data.length}
      showBorderBody={showBorderBody}
      intercalateColorBody={intercalateColorBody}
      onClickRow={onClickRow}
    />
  ));
};

interface IRowBody {
  item: any;
  header: IHeaderTable<any>[];
  index: number;
  isLoading?: boolean;
  dataLength: number;
  showBorderBody: boolean;
  intercalateColorBody: boolean;
  onClickRow?: (item: any) => void;
}

const RowBody = (props: IRowBody) => {
  const {
    item,
    header,
    index,
    isLoading,
    onClickRow,
    // dataLength
  } = props;
  const { showBorderBody, intercalateColorBody } = props;

  let className =
    (index + 1) % 2 === 0
      ? intercalateColorBody
        ? "bg-table-body-line-gb-color-two"
        : "bg-table-body-line-gb-color-one"
      : "bg-table-body-line-gb-color-one";
  // if (dataLength === index + 1) className += showBorderBody ? " border-b " : "";

  return (
    <tr
      className={`${className} ${showBorderBody ? "border border-slate-100/70" : ""} hover:bg-[#6DACCB]/3 ${onClickRow ? "cursor-pointer" : ""}`}
      onClick={() => {
        if (onClickRow) onClickRow(item);
      }}
    >
      {header.map((dt, indexHeader) =>
        (dt.children || [])?.length > 0 ? (
          (dt?.children || []).map((dtChildren, indexHeaderChildren) => (
            <ThBody
              key={indexHeaderChildren}
              itemHeader={dtChildren}
              itemData={item}
              indexHeader={indexHeader}
              indexHeaderChildren={indexHeaderChildren}
              indexLastHeaderChildren={dt?.children?.length}
              indexLastHeader={header.length}
              isLoading={isLoading}
            />
          ))
        ) : (
          <ThBody key={indexHeader} itemHeader={dt} itemData={item} indexHeader={indexHeader} indexLastHeader={header.length} isLoading={isLoading} />
        ),
      )}
    </tr>
  );
};

interface IThbody {
  itemHeader: IHeaderTable;
  itemData: any;
  indexHeader: number;
  indexHeaderChildren?: number;
  indexLastHeaderChildren?: number;
  indexLastHeader: number;
  isLoading?: boolean;
}

const ThBody = (props: IThbody) => {
  const { itemHeader, itemData, indexHeader, indexHeaderChildren } = props;
  const { indexLastHeader, indexLastHeaderChildren, isLoading } = props;
  // const contentCenter = itemHeader.center ? "text-center" : "";
  let value: string | number | React.JSX.Element | undefined | boolean;
  let className = "";

  if (itemHeader.render && !isLoading) {
    value = itemHeader.render(itemData);
    value = typeof value === "boolean" ? value.toString() : (value ?? "");
  }

  if (indexHeader === 0) className += " pl-4";

  if (indexLastHeader === indexHeader + 1) {
    if (indexHeaderChildren !== undefined && indexLastHeaderChildren !== undefined) {
      if (indexHeaderChildren === indexLastHeaderChildren + 1) {
        className += `pr-4`;
      }
    } else {
      className += " pr-4";
    }
  }

  return (
    <td className={`p-0 ${className} py-1 `}>
      {isLoading ? (
        <div className="flex items-center w-full py-2.5 text-table-loading max-w-sm animate-pulse h-9">
          <div className="h-3 bg-table-loading rounded-full w-full "></div>
        </div>
      ) : (
        <div
          className={`h-full flex items-center font-normal w-full ${itemHeader.center ? "justify-center text-center" : ""}`}
          style={{ minHeight: "31px" }}
        >
          {value}
        </div>
      )}
    </td>
  );
};
