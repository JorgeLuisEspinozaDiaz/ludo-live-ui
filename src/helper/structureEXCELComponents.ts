import * as Excel from "exceljs";

interface IFill{
    fgColor?: string
}

export const Fill = (props: IFill ): Excel.Fill => {
    const {  fgColor= "FFFFFFFF" } = props
    return {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: fgColor }
    }
}

interface IFont{
    size?: number;
    bold?: boolean;
    fgColor?: string;
}

export const Font = (props:IFont): Partial<Excel.Font> => {
    const { size = 10, bold = false, fgColor= "FFFFFFFF" } = props
    return {
        name: 'Calibri',
        color: { argb: fgColor },
        size: size,
        bold: bold
    }
}

interface IAlignment {
    horizontal: "left" | "center" | "right" | "fill" | "justify" | "centerContinuous" | "distributed"
    vertical: "top" | "middle" | "bottom" | "justify" | "distributed",
    wrapText: boolean
}

export const Alignment = (props: IAlignment): Partial<Excel.Alignment> => {
    const {vertical, horizontal, wrapText} = props
    return {
        vertical,
        horizontal,
        wrapText
    }
}

interface IBorder {
    fgColor?: string;
    left?: boolean;
    right?: boolean;
    top?: boolean;
    bottom?: boolean;
}

export const Border = (props: IBorder): Partial<Excel.Borders> => {
    const {fgColor = "FFFFFFFF"} = props;
    const {left = false, right = false} = props
    const {top = false, bottom = false} = props
    return {
        left: left ? { style: 'thin', color: { argb: fgColor } } : {},
        top: top ? { style: 'thin', color: { argb: fgColor } } : {},
        right: right ? { style: 'thin', color: { argb: fgColor } } : {},
        bottom: bottom ? { style: 'thin', color: { argb: fgColor } } : {}
    }
}