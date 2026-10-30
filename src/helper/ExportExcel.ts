import * as Excel from "exceljs";
import * as fs from "file-saver";

export const ExportExcel = async (workbook: Excel.Workbook, title: string = "Report") => {
    return await workbook.xlsx.writeBuffer().then((data: any) => {
        const blob = new Blob([data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        fs.saveAs(blob, `${title}-${Date.now()}.xlsx`);
    });
}