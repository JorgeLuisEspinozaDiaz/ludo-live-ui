import { useState } from "react";
import type { IHeaderTable } from "./Tablet";
import { GenerateExportPdf, type IStack, type TextAlignment } from "../../helper/GenerateExportPdf";
import { newPDFMAKE } from "../../helper/newPDFMAKE";
import { GenerateExportExcel } from "../../helper/GenerateExporExcel";

interface IMoreOptionsTable {
  header: IHeaderTable<any>[];
  data: Array<any>;
  titleForExcel?: string;
  handleChangeFilter?: () => void;
}

export interface IHeaderGenerateExportExcelPdf {
  title: string;
  sizeExcel?: number;
  sizePdf?: number;
  alignmentPdf?: TextAlignment;
  pdfValue?: (row: any) => string | number | IStack[];
  excelValue?: (row: any) => string | number;
}

export const MoreOptionsTable = (props: IMoreOptionsTable) => {
  const { header, data, titleForExcel } = props;
  const [expand, setExpand] = useState<Boolean>(false);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setExpand(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setExpand(false);
      }
    }
  };
  const handleChangePrintDataToPdf = async () => {
    const headerForExcel = [] as IHeaderGenerateExportExcelPdf[];
    header.map((dt) => {
      if (dt.omitirForExcel) return;
      headerForExcel.push({
        title: dt.title,
        sizePdf: dt.sizePdf ?? 30,
        alignmentPdf: dt.alignmentPdf ?? "center",
        pdfValue: dt.pdfValue,
      });
    });
    const estructurePdf = await GenerateExportPdf(headerForExcel, data, titleForExcel);
    if (estructurePdf) await newPDFMAKE(estructurePdf, "open");
  };
  const handleChangePrintDataToExcel = () => {
    const headerForExcel = [] as IHeaderGenerateExportExcelPdf[];
    header.map((dt) => {
      if (dt.omitirForExcel) return;
      headerForExcel.push({
        title: dt.title,
        sizeExcel: dt.sizeExcel ?? 25,
        excelValue: dt.excelValue,
      });
    });
    GenerateExportExcel(headerForExcel, data, titleForExcel);
  };

  return (
    <>
      <div className="flex justify-center w-[44%]  h-full gap-x-4 tablet:gap-x-3 desktop:gap-x-5">
        <div>
          <div className="border-l h-6 "></div>
        </div>
        {/* <i
          className="ri-filter-line text-[#35353A] cursor-pointer hover:text-[#00B6FE]"
          onClick={() => (handleChangeFilter ? handleChangeFilter() : null)}
        ></i> */}
        <i className="ri-printer-line text-[#35353A] cursor-pointer hover:text-[#00B6FE]" onClick={handleChangePrintDataToPdf}></i>
        <i className="ri-download-2-line text-[#35353A] cursor-pointer hover:text-[#00B6FE]" onClick={handleChangePrintDataToExcel}></i>
        <div className="border-r h-6"></div>
      </div>
      <div className="flex justify-center w-[12%] ">
        {expand ? (
          <i className="ri-collapse-diagonal-line cursor-pointer hover:text-[#00B6FE]" onClick={toggleFullscreen}></i>
        ) : (
          <i className="ri-expand-diagonal-s-line cursor-pointer hover:text-[#00B6FE]" onClick={toggleFullscreen}></i>
        )}
      </div>
    </>
  );
};
