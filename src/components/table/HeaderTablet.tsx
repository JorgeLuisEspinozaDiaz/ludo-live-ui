import type { IHeaderTable } from "./Tablet";

interface IHeader {
  header: IHeaderTable<any>[];
  showBorderHeader: boolean;
}

export const HeaderTablet = (props: IHeader) => {
  const { header, showBorderHeader } = props;
  const trArray = [0, 1];
  let paddingClassName = " ";
  const verifyChildren = header.find((dt: IHeaderTable<any>) => dt.children && dt.children?.length > 0);
  if (verifyChildren) paddingClassName = "";

  return trArray.map((dt) => (
    <RowHeader index={dt} key={dt} header={header} paddingClassName={paddingClassName} showBorderHeader={showBorderHeader} />
  ));
};

interface IRowHeader {
  header: IHeaderTable<any>[];
  paddingClassName: string;
  index: number;
  showBorderHeader: boolean;
}

const RowHeader = (props: IRowHeader) => {
  const { header, paddingClassName, index, showBorderHeader } = props;
  let className = "sticky top-0 ";

  if (index === 1) className = showBorderHeader ? " sticky top-7 " : " sticky top-7 ";

  return (
    <tr className={className + " bg-[#F9FBFC] "} style={{ zIndex: "1" }}>
      {header.map((dt, indexHeader) => (
        <ThHeader
          key={indexHeader}
          item={dt}
          paddingClassName={paddingClassName}
          index={index}
          indexHeader={indexHeader}
          indexLastHeader={header.length}
          showBorderHeader={showBorderHeader}
        />
      ))}
    </tr>
  );
};

interface IThHeader {
  item: IHeaderTable;
  paddingClassName: string;
  index: number;
  indexHeader: number;
  indexLastHeader: number;
  showBorderHeader: boolean;
}

const ThHeader = (props: IThHeader) => {
  const { item, paddingClassName, index, indexLastHeader, indexHeader } = props;
  //   const { showBorderHeader } = props;
  const children = item.children || [];
  const colSpan = item.cols || (children.length > 0 ? children.length : 1);
  const rowSpan = colSpan > 1 ? 1 : 2;
  let className = "p-0 bg-table-bg-header";

  if (colSpan > 1) className += " text-center";

  if (indexHeader === 0) className += " pl-4 ";
  // else if (indexHeader + 1 === indexLastHeader)
  //   className += showBorderHeader ? " pr-4 rounded-se-md border-t border-r " : " pr-4 rounded-se-md ";
  // else className += showBorderHeader ? " border-t " : "";

  const thNode = (
    <th
      scope="col"
      className={` ${item.classNameTh} ${paddingClassName} font-semibold text-[13px] p-0`}
      colSpan={colSpan}
      rowSpan={rowSpan}
      style={item.style}
    >
      <div className={`${className} ${item.center ? "text-center" : ""} ${item.className} truncate py-3 `}>
        {item.titleRender ? item.titleRender() : item.title}
      </div>
    </th>
  );

  return index === 0
    ? thNode
    : children.map((dt, indexChildren) => (
        <ThChildren
          key={indexChildren}
          item={dt}
          paddingClassName={paddingClassName}
          indexHeader={indexHeader}
          indexLastHeader={indexLastHeader}
          indexFirstHeaderChildren={indexChildren}
        />
      ));
};

interface IThChildren {
  item: IHeaderTable;
  paddingClassName: string;
  indexHeader: number;
  indexLastHeader: number;
  indexFirstHeaderChildren: number;
}

const ThChildren = (props: IThChildren) => {
  const { item, paddingClassName } = props;
  const { indexHeader, indexFirstHeaderChildren } = props;
  let className = `${item.className} `;
  if (indexHeader === 0 && indexFirstHeaderChildren === 0) className += "pl-4";

  return (
    <th scope="col" className={`${className} ${paddingClassName} p-0 bg-table-bg-header`}>
      <div className={`${className} ${item.className} truncate py-1.5 `}>{item.title}</div>
    </th>
  );
};
