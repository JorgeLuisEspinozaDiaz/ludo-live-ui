

import type { IHeaderGenerateExportExcelPdf } from "../components/table/MoreOptionsTable";
import { base64_encode } from "./Funtions";
import { LineColorTable, SpaceLine, TitlePDF } from "./structurePDFComponents";
export type TextAlignment = 'left' | 'center' | 'right' | 'justify';
export interface IStack {
    text: string;
    bold?: boolean;
    color?: string;
    fontSize?: number;
    alignment?: TextAlignment;
    margin?: number[],
    border?: boolean[];
    borderColor?: string,
}
export const GenerateExportPdf = async (header: IHeaderGenerateExportExcelPdf[], data: any, title?: string) => {

    try {

        const imgLogo = await base64_encode('/assets/png/logo_chamba.png')


        const colorAzul = "#43708B";
        const colorTabletBorder = "#B3B4AE"

        const headerTable = header.map((dt, index) => {
            return { id: (index + 1), name: dt.title, fillColor: "", border: [true, true, true, true], size: dt.sizePdf, alignment: dt.alignmentPdf }
        });


        const arrayBody: any[] = [];
        data.map((dt: any) => {
            const itemsBody = [] as any[]
            header.map((dtH) => {
                let itemForBody: any = {
                    border: [true, true, true, true],
                    alignment: dtH.alignmentPdf ?? 'center',
                    text: ""
                }
                if (!dtH.pdfValue) {
                    itemsBody.push(itemForBody)
                    return;
                };
                const value = dtH.pdfValue(dt);
                if (typeof value === "string" || typeof value === "number") itemForBody = { ...itemForBody, text: value, }
                if (Array.isArray(value)) itemForBody = { ...itemForBody, stack: value, }
                itemsBody.push(itemForBody)
            })
            if (itemsBody.length > 0) arrayBody.push(itemsBody)

        })

        const getHout = (): string => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');

            return `${hours}:${minutes}:${seconds}`;
        }

        const getDate = () => {
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0'); // Los meses comienzan en 0
            const year = now.getFullYear();

            return `${day}/${month}/${year}`;
        }

        let docDefinition = {
            pageMargins: [25, 10, 25, 10],
            content: [
                {
                    fontSize: 7,
                    table: {
                        widths: [68, 70, 240, 130],
                        heights: ['*'],
                        body: [
                            [
                                TitlePDF(`Impreso: ${getHout()}`, '', colorAzul, 8, true, "left", [-5, 25, 0, 0]),
                                TitlePDF('', '', colorAzul, 8, true, "left", [0, 47, 0, 0]),
                                // TitlePDF('TARA: 2.60 KGS', '', colorAzul, 8, true, "left", [0, 47, 0, 0]),
                                TitlePDF('RESUMEN', '', colorAzul, 16, true, "center", [0, 10, 0, 0]),
                                {
                                    margin: [0, 0, 0, 0],
                                    table: {
                                        widths: ['*'],
                                        body: [
                                            [
                                                {
                                                    border: [false, false, false, false],
                                                    image: imgLogo,
                                                    width: 60,
                                                    margin: [0, 0, -4, 0],
                                                    alignment: "right"
                                                }
                                            ],
                                            [
                                                {
                                                    ...TitlePDF(getDate(), '', colorAzul, 8, true, "right"),
                                                    margin: [0, 0, 30, 0]
                                                }
                                            ],
                                        ]
                                    },
                                    layout: 'noBorders'
                                },
                            ]
                        ]
                    },
                    layout: {
                        defaultBorder: false,
                    }
                },
                SpaceLine(5),
                {
                    fontSize: 5.5,
                    table: {
                        widths: headerTable.map((dt) => dt.size),
                        body: [
                            headerTable.map((dt) => {

                                return {
                                    border: dt.border,
                                    ...TitlePDF(dt.name, dt.fillColor, colorAzul, 6, true, "center"),
                                }
                            }),
                            ...arrayBody
                        ]
                    },
                    layout: {
                        ...LineColorTable(colorTabletBorder)
                    }
                },

                SpaceLine(5),

            ],
            header: {
                fontSize: 7,
                text: "",
                margin: [0, 0, 0, 0],

            },
        }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const nameFile = `documento-proyecto-${uniqueSuffix}.pdf`

        const options = {};
        return {
            docDefinition,
            options,
            nameFile,
            title
        }
    } catch (error) {
        console.log(error)
    }

}