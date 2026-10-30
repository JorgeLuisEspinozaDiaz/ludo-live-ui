import { useEffect, useState, useMemo, type CSSProperties } from "react";
import "./tablet.css";
import { InputSearch } from "../InputSearch";
import { PaginationFooter, PaginationInfoFooter, PaginationSelectRegisterFooter } from "./Pagination";
import { HeaderTablet } from "./HeaderTablet";
import { BodyTablet } from "./BodyTablet";
import { MoreOptionsTable } from "./MoreOptionsTable";
import { Signal, useSignalEffect } from "@preact/signals-react";
import type { IPaginated } from "../../interface/IPaginated";
import { UseForm } from "../../hooks/UseForm";
import type { IStack, TextAlignment } from "../../helper/GenerateExportPdf";

interface ITable {
  header: IHeaderTable<any>[];
  data: Array<any>;
  arraySelectRegisterFooter?: number[];
  style?: CSSProperties;
  isLoading?: boolean;

  rowByPage?: number; // registors que se van a mostrar por pagina
  actualPage?: number;
  totalPage?: number; // cantidad de paginas
  totalRow?: number; // total de registros paginados y no paginados
  handleChangeRegisterTable?: (item: Partial<IPaginated>) => any; //

  maxHeightBody?: string;
  footer?: boolean;
  footerHeader?: boolean;
  showHeader?: boolean;
  showBorderBody?: boolean;
  showBorderHeader?: boolean;
  intercalateColorBody?: boolean;

  registrosView?: "top";

  sizeAbogeTable?: string;
  sizeAbogeTableSignal?: Signal<number>;
  showSearch?: boolean;
  placeHolderSearch?: string;
  childrenFilter?: React.ReactNode;
  titleForExcel?: string;
  handleChangeFilter?: () => void;

  heigthForCalculate?: string; // default 100vh

  title?: string;
  onClickRow?: (item: any) => void;
}

export interface IHeaderTable<T = any> {
  id?: number;
  title: string;
  titleRender?: () => React.JSX.Element | string | number | undefined | boolean;
  className?: string;
  classNameTh?: string;
  center?: boolean;
  style?: CSSProperties;
  children?: IHeaderTable<T>[];
  cols?: number;
  render?: (e: T, i?: number, ss?: (updated?: number) => void) => React.JSX.Element | string | number | undefined | boolean;
  excelValue?: (row: T) => string | number;
  pdfValue?: (row: T) => string | number | IStack[];
  sizeExcel?: number;
  sizePdf?: number;
  alignmentPdf?: TextAlignment;
  omitirForExcel?: boolean;
}

const dataForLoading = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }));

export const Tablet = (props: ITable) => {
  const data = useMemo(() => props.data, [props.data]);
  const [dataTemportal, setDataTemportal] = useState(data);
  const header = useMemo(() => props.header, [props.header]);
  const { rowByPage = 50, isLoading, maxHeightBody = "22rem" } = props;
  const { totalPage, actualPage = 1, registrosView, totalRow } = props;
  const { sizeAbogeTable = 26, handleChangeRegisterTable } = props;
  const { arraySelectRegisterFooter = [10, 20, 30, 50] } = props;
  const { footer = true, showHeader = true, showBorderBody = true } = props;
  const { intercalateColorBody = false, showBorderHeader = false } = props;
  const { footerHeader = false, showSearch = false, placeHolderSearch } = props;
  const { childrenFilter, titleForExcel, handleChangeFilter, onClickRow } = props;
  const { heigthForCalculate = "100vh", title, sizeAbogeTableSignal } = props;

  const [maxRows, setMaxRows] = useState<number>(rowByPage);
  const [currentPage, setCurrentPage] = useState<number>(actualPage);
  const [sizeComputed, setSizeComputed] = useState(sizeAbogeTableSignal ? `${sizeAbogeTableSignal.value}` : sizeAbogeTable);

  useEffect(() => {
    setMaxRows(rowByPage);
  }, [rowByPage]);

  useEffect(() => {
    setCurrentPage(actualPage);
  }, [actualPage]);

  const paginatedData = useMemo(() => {
    if (isLoading) return dataForLoading;
    const startRow = (currentPage - 1) * maxRows;
    const endRow = startRow + maxRows;
    return handleChangeRegisterTable ? dataTemportal : dataTemportal.slice(startRow, endRow);
  }, [dataTemportal, currentPage, maxRows, isLoading]);

  const totalPages = useMemo(() => totalPage ?? Math.ceil(dataTemportal.length / maxRows), [dataTemportal.length, maxRows, totalPage]);

  const handlePageSelect = (page: number) => {
    setCurrentPage(page);
    handleChangeRegisterTable?.({ page: page, actualPage: page }); // cambiar el atributo de la paginacion
  };

  const handleMaxRowsChange = (rows: number) => {
    setMaxRows(rows);
    handleChangeRegisterTable?.({ itemsPerPage: rows }); // cambiar el atributo de la paginacion
  };

  const startRow = (currentPage - 1) * maxRows + 1;
  const endRow = Math.min(startRow + maxRows - 1, totalRow ?? dataTemportal.length);

  const { form, keyUpHandler } = UseForm({
    search: "",
  });

  const handleChangeOnSearch = () => {
    const { search } = form;
    if (form.search) {
      // onSearch(form.search || undefined);
      const lowerSearch = search.toLowerCase();
      const filtered = data.filter((item) => Object.values(item).some((value) => String(value).toLowerCase().includes(lowerSearch)));

      setDataTemportal(filtered);
    } else setDataTemportal(data);
  };

  useSignalEffect(() => {
    if (sizeAbogeTableSignal) setSizeComputed(`${sizeAbogeTableSignal.value}`);
  });

  useEffect(() => {
    setDataTemportal(data);
  }, [data]);

  return (
    <div className="relative  w-full rounded-xl px-3 pt-3 ">
      {footerHeader && (
        <div className="flex p-2 w-full flex-col mobile:flex-row" id="footer">
          <div className="grid grid-cols-2 tablet:grid-cols-3 gap-x-4 laptopBig:grid-cols-4 desktop:grid-cols-5 tablet:w-[60%] laptop:w-[65%]  laptopBig:w-[70%] desktop:w-[75%]  gap-y-4">
            {showSearch && (
              <div className="w-full">
                <InputButtonForSearch
                  handleChangeOnSearch={handleChangeOnSearch}
                  keyUpHandler={keyUpHandler}
                  placeholder={placeHolderSearch || "Buscar"}
                />
              </div>
            )}
            {childrenFilter && childrenFilter}
          </div>
          <div className="flex tablet:w-[40%] laptop:w-[35%] laptopBig:w-[30%] desktop:w-[25%] py-2">
            <div className="flex justify-center items-start gap-x-3 w-[44%]  ">
              <div className="flex  pt-1">
                <PaginationInfoFooter
                  startRow={startRow}
                  endRow={endRow}
                  endData={totalRow ?? dataTemportal.length}
                  isLoading={isLoading}
                  textNameRegistros={""}
                  className="text-[10px]!"
                />
              </div>
              <div className="">
                <PaginationFooter
                  pagesNum={totalPages}
                  maxRows={maxRows}
                  actualPage={currentPage}
                  resultsNumShown={dataTemportal.length}
                  resultsNumTotal={totalRow ?? dataTemportal.length}
                  selectPage={handlePageSelect}
                  isLoading={isLoading}
                  showIcons
                  startRow={startRow}
                  endRow={endRow}
                  endData={totalRow ?? dataTemportal.length}
                />
              </div>
            </div>
            <MoreOptionsTable data={dataTemportal} header={header} titleForExcel={titleForExcel} handleChangeFilter={handleChangeFilter} />
          </div>
        </div>
      )}
      {title && (
        <div className="flex justify-between text-xs font-medium  items-center px-6 py-3.5 border-slate-100 border rounded-t-3xl">
          <span className="text-slate-500">{title ?? "Todos los registros"}</span>
          <span className="text-slate-400">{totalRow ?? data.length} registros</span>
        </div>
      )}
      <div
        className="container-table min-h-0 overflow-y-auto overflow-x-hidden transition-[height] duration-500 ease-in-out"
        style={{
          height: `calc(${heigthForCalculate} - ${sizeComputed}rem)`,
        }}
      >
        <table className="text-[11px] w-full text-left ">
          {showHeader && (
            <thead className="text-[10px] text-slate-500">
              <HeaderTablet header={header} showBorderHeader={showBorderHeader} />
            </thead>
          )}
          <tbody className="overflow-y-auto text-table-text-body" style={{ maxHeight: maxHeightBody }}>
            <BodyTablet
              header={header}
              data={paginatedData}
              isLoading={isLoading}
              showBorderBody={showBorderBody}
              intercalateColorBody={intercalateColorBody}
              onClickRow={onClickRow}
            />
          </tbody>
        </table>
      </div>
      {footer && (
        <div className="flex p-2 items-center w-full" id="footer">
          <div className="flex w-[14.5%]  h-full justify-start items-center">
            <PaginationSelectRegisterFooter
              maxRows={maxRows}
              changeSelectRegister={handleMaxRowsChange}
              arraySelectRegisterFooter={arraySelectRegisterFooter}
              isLoading={isLoading}
              registrosView={registrosView}
              rowByPage={rowByPage}
            />
          </div>
          <div className=" tablet:flex w-[9%] h-full justify-center items-center ">
            <div className="hidden">
              <PaginationInfoFooter startRow={startRow} endRow={endRow} endData={totalRow ?? dataTemportal.length} isLoading={isLoading} />
            </div>
          </div>

          <div className="flex justify-end w-[76.5%]  h-full items-center">
            <PaginationFooter
              pagesNum={totalPages}
              maxRows={maxRows}
              actualPage={currentPage}
              resultsNumShown={dataTemportal.length}
              resultsNumTotal={totalRow ?? dataTemportal.length}
              selectPage={handlePageSelect}
              isLoading={isLoading}
              startRow={startRow}
              endRow={endRow}
              endData={totalRow ?? dataTemportal.length}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface IButtonForSearch {
  placeholder?: string;
  keyUpHandler: ({ target }: any) => void;
  handleChangeOnSearch: () => void;
}

const InputButtonForSearch = (props: IButtonForSearch) => {
  const { keyUpHandler, handleChangeOnSearch, placeholder } = props;
  return (
    <div className=" ">
      <InputSearch
        placeholder={placeholder}
        classNameInput={"text-[#03022980] placeholder-[#03022980] text-[12px] placeholder-[#244675] h-8  border-none bg-[#F7F7F7] font-semibold"}
        name="search"
        onKeyUp={keyUpHandler}
        onBlur={keyUpHandler}
        onEnter={handleChangeOnSearch}
      />
    </div>
  );
};
