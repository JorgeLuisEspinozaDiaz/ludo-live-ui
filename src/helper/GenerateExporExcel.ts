import * as Excel from "exceljs";

import { ExportExcel } from "./ExportExcel";
import { Alignment, Border, Fill, Font } from "./structureEXCELComponents";
import type { IHeaderGenerateExportExcelPdf } from "../components/table/MoreOptionsTable";

const abcRow = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE']



export const GenerateExportExcel = async (header: IHeaderGenerateExportExcelPdf[], data: any, title?: string) => {

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Guia Remision");
    worksheet.addRow([]); // Fila 1
    worksheet.addRow([]); // Fila 2

    const colorAzul = "FF43708B";
    const colorTabletBorder = "FFB3B4AE";
    abcRow.map(dt => {
        for (let index = 1; index < 100; index++) {
            const cell = worksheet.getCell(`${dt}${index}`);
            cell.border = Border({ left: true, right: true, top: true, bottom: true });
        }
    });
    let row = 2;

    row++;

    const letterColumnsHeader = header.map((dt, index) => {
        return { name: dt.title, letter: abcRow[index], size: dt.sizeExcel }
    });

    letterColumnsHeader.map((dt) => {
        worksheet.getCell(`${dt.letter}${row}`).value = dt.name;
        worksheet.getColumn(dt.letter).width = dt.size; // !HANCHO DE LA COLUMA
        const cell = worksheet.getCell(`${dt.letter}${row}`);
        cell.fill = Fill({});
        cell.font = Font({ bold: true, fgColor: colorAzul });
        cell.alignment = Alignment({ horizontal: "center", vertical: "middle", wrapText: true });
        cell.border = Border({ fgColor: colorTabletBorder, left: true, right: true, top: true, bottom: true });
    })

    row++;

    data.map((dt: Partial<any>) => {
        header.map((dtH, index) => {
            worksheet.getCell(`${abcRow[index]}${row}`).value = dtH.excelValue ? dtH.excelValue(dt) : "";
        })
        letterColumnsHeader.map((dt) => {
            // worksheet.getColumn(dt.letter).width = dt.size; // !HANCHO DE LA COLUMA
            const cell = worksheet.getCell(`${dt.letter}${row}`);
            cell.fill = Fill({});
            cell.font = Font({ fgColor: "00000000" });
            cell.alignment = Alignment({ horizontal: "center", vertical: "middle", wrapText: true });
            cell.border = Border({ fgColor: colorTabletBorder, left: true, right: true, top: true, bottom: true });
        })
        row++;
    })

    return await ExportExcel(workbook, title)

}
