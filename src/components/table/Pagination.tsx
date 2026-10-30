import { useEffect, useMemo } from "react";
import { Select } from "../select/Select";
import { signal } from "@preact/signals-react";
import { UseForm } from "../../hooks/UseForm";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface IPaginationInfoFooter {
  startRow: number;
  endRow: number;
  endData: number;
  isLoading?: boolean;
  textNameRegistros?: string;
  className?: string;
}

export const PaginationInfoFooter = (props: IPaginationInfoFooter) => {
  const { startRow, endRow, endData, isLoading, textNameRegistros = "items", className } = props;

  const baseClassName = "font-semibold text-table-primary-color flex";
  const loadingElement = (
    <div className="flex items-center w-10 px-1 py-1 font-medium text-table-loading whitespace-nowrap max-w-sm animate-pulse">
      <div className="h-3 bg-table-loading rounded-full w-full"></div>
    </div>
  );

  if (isLoading) {
    return (
      <span className={`font-normal text-table-primary-color flex items-center text-[10px] ${className}`}>
        <span className={baseClassName}>{loadingElement}</span> {" - "}
        <span className={baseClassName}>{loadingElement}</span> de{" "}
        <span className={baseClassName}>
          {loadingElement} {textNameRegistros}
        </span>
      </span>
    );
  }

  return (
    <span className={`font-normal text-table-primary-color text-[10px] ${className} `}>
      <span className="font-semibold">{startRow}</span>
      {" - "}
      <span className="font-semibold">{endRow}</span> de{" "}
      <span className="font-semibold">
        {endData} {textNameRegistros}
      </span>
    </span>
  );
};

interface IPaginationSelectRegisterFooter {
  maxRows: number;
  changeSelectRegister: (e: any) => void;
  arraySelectRegisterFooter: number[];
  isLoading?: boolean;
  registrosView?: "top";
  rowByPage: number;
}
const updateInputs = signal(false);
export const PaginationSelectRegisterFooter = (props: IPaginationSelectRegisterFooter) => {
  const { arraySelectRegisterFooter, changeSelectRegister, maxRows } = props;
  const { isLoading, registrosView, rowByPage } = props;
  const { form, keyUpHandler } = UseForm({
    selectFooter: maxRows,
  });

  // const arraySelectRegisterFooterInit: any = [];
  // arraySelectRegisterFooter.map((dt: number) => {
  //   arraySelectRegisterFooterInit.push({ id: dt });
  // });

  const arraySelectRegisterFooterInit = useMemo(() => arraySelectRegisterFooter.map((dt: number) => ({ id: dt })), [arraySelectRegisterFooter]);

  const handleChangeRegisterFooter = (event: any) => {
    keyUpHandler(event);
    changeSelectRegister(form.selectFooter);
  };

  useEffect(() => {
    if (form.selectFooter !== maxRows) {
      const event = {
        target: {
          name: "selectFooter",
          value: maxRows,
        },
      };
      keyUpHandler(event);
      updateInputs.value = !updateInputs.value;
    }
  }, [maxRows, form.selectFooter, keyUpHandler]);

  return (
    <div className="flex items-center text-[10px]">
      <span className="tablet:flex font-normal text-table-footer-letter mr-2 text-[11px] ">Filas por página:</span>
      {isLoading ? (
        <div className="w-14">
          <div className="flex items-center w-14 px-1 py-1 font-medium text-table-loading whitespace-nowrap max-w-sm animate-pulse h-9">
            <div className="h-3 bg-table-loading rounded-full w-full"></div>
          </div>
        </div>
      ) : (
        <Select
          data={arraySelectRegisterFooterInit}
          readView="id"
          keyValue="id"
          name="selectFooter"
          form={form}
          value={form.selectFooter}
          onChange={handleChangeRegisterFooter}
          classNameButton="rounded-2xl!"
          registrosView={registrosView}
          update={updateInputs}
          placeholder={(rowByPage || "").toString()}
        />
      )}
      {/* <span className="hidden tablet:flex font-normal text-table-primary-color ml-2">
        Registros
      </span> */}
    </div>
  );
};

interface IPaginationFooter {
  pagesNum: number;
  maxRows: number;
  actualPage: number;
  resultsNumShown: number;
  resultsNumTotal: number;
  selectPage: (e: any) => void;
  isLoading?: boolean;
  showIcons?: boolean;
  startRow: number;
  endRow: number;
  endData: number;
  className?: string;
}

export const PaginationFooter = (props: IPaginationFooter) => {
  const { selectPage, pagesNum, actualPage, isLoading, showIcons = false } = props;
  const { startRow, endRow, endData, className = "" } = props;

  // const baseClassName =
  //   "flex justify-center text-[10px] items-center font-semibold w-[24px] h-[24px] p-0 text-center hover:bg-table-secondary-color cursor-pointer rounded-md hover:text-white mx-0.5 text-table-primary-color";

  const baseClass =
    "flex items-center justify-center font-normal  cursor-pointer hover:bg-table-secondary-color rounded-md hover:text-white px-2 py-[3.6px]";

  const handleChangePaginate = (type: string, number?: number) => {
    let newNumber = actualPage;
    if (type === "previous" && actualPage > 1) {
      newNumber -= 1;
    } else if (type === "center" && number != undefined) {
      newNumber = number;
    } else if (type === "next" && actualPage < pagesNum) {
      newNumber += 1;
    }
    selectPage(newNumber);
  };

  // const generatePagination = () => {
  //   let startPage = 1;
  //   let endPage = pagesNum;
  //   const pagination: React.JSX.Element[] = [];

  //   if (pagesNum > 3) {
  //     startPage = Math.max(1, actualPage - 1);
  //     endPage = Math.min(pagesNum, actualPage + 1);
  //     if (endPage - startPage < 2) {
  //       startPage = Math.max(1, endPage - 2);
  //       endPage = Math.min(pagesNum, startPage + 2);
  //     }
  //   }

  //   for (let index = startPage; index <= endPage; index++) {
  //     const className = `${baseClassName} ${actualPage === index ? "bg-table-secondary-color text-white" : ""}`;
  //     pagination.push(
  //       <span key={index} className={className} onClick={() => handleChangePaginate("center", index)}>
  //         {index}
  //       </span>,
  //     );
  //   }

  //   return pagination;
  // };

  if (isLoading) {
    return (
      <div className="flex items-center w-full justify-end text-[10px]">
        <span className="flex items-center justify-center rounded-md px-2 border-[1.5px] py-[3.6px] text-table-primary-color mr-2">Previous</span>
        <div className="flex items-center">
          <div className="flex items-center w-10 py-1 font-medium text-table-loading whitespace-nowrap max-w-sm animate-pulse h-9">
            <div className="h-3 bg-table-loading rounded-full w-full"></div>
          </div>
        </div>
        <span className="flex items-center justify-center rounded-md px-2 border-[1.5px] py-[3.6px] text-table-primary-color ml-2 ">Next</span>
      </div>
    );
  }

  if (showIcons) {
    return (
      <div className="flex text-base w-full gap-x-2">
        <i className="ri-arrow-left-s-line cursor-pointer text-[#35353A] hover:text-[#00B6FE]" onClick={() => handleChangePaginate("previous")}></i>
        <i className="ri-arrow-right-s-line cursor-pointer text-[#35353A] hover:text-[#00B6FE]" onClick={() => handleChangePaginate("next")}></i>
      </div>
    );
  }

  return (
    <div className="flex items-center text-[11px] w-full justify-end gap-x-2 ">
      <span className={`font-normal text-table-footer-letter  ${className} `}>
        <span className="">{startRow}</span>
        {" - "}
        <span className="">{endRow}</span> de <span className="">{endData}</span>
      </span>
      <span className={`${baseClass} ${actualPage > 1 ? " " : ""} `} onClick={() => handleChangePaginate("previous")}>
        <ChevronLeft size={13} />
      </span>
      {/* <div className="flex items-center">{generatePagination()}</div> */}
      <span
        className={`${baseClass} ${actualPage < pagesNum ? "border-primary-color text-primary-color" : "text-table-primary-color"} `}
        onClick={() => handleChangePaginate("next")}
      >
        <ChevronRight size={13} />
      </span>
    </div>
  );
};
