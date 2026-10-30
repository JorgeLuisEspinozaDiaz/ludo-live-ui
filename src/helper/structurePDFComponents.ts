// ! hancho 502 total  y sin border 507

export const TitlePDF = (text: string, fillColor: string, color: string, fontSize: number, bold: boolean = false, alignment: "left" | "center" | "right" | "justify", margin?: [number, number, number, number]) => {
    return {
        text,
        alignment,
        fillColor,
        color,
        fontSize,
        bold,
        ...(margin ? { margin } : {})
    }
}

export const WithLineBorder = (vertial: number = 0, horizontal: number = 0) => {
    return {
        hLineWidth: function () {
            return horizontal;
        },
        vLineWidth: function () {
            return vertial;
        }
    }
}

export const ColorLineBorder = (vertial: string = "", horizontal: string = "") => {
    return {
        hLineColor: function () {
            return horizontal;
        },
        vLineColor: function () {
            return vertial;
        }
    }
}

export const TestColorRowAll = () => {
    return {
        table: {
            widths: ['*'],
            body: [
                [{
                    text: "",
                    fillColor: "#00ff00"
                }
                ]
            ]
        },
        // layout: {
        //     defaultBorder: false,
        // }
        layout: 'noBorders',
    }
}

export const ColorRowLimePastel = () => {
    return {
        canvas: [
            {
                type: "rect",
                x: 0,
                y: 0,
                w: 515,
                h: 1,
                color: "#C8F473"
            }
        ]
    };
}


export const Separador = (horizontal: number = 0, vertical: number = 0) => {
    return {
        text: '', margin: [horizontal, vertical],
    }
}

export const SpaceLine = (height: number) => {
    return {
        margin: [0, height, 0, 0],
        text: ''
    }
}

export const LineColorTable = (color: string) => {
    return {
        hLineColor: color,
        vLineColor: color,
    }
}

export const LineTest = () => {
    return {
        table: {
            widths: ['*'],
            body: [
                [
                    {
                        fillColor: "#ff0000",
                        text: ''
                    }
                ]
            ]
        },
        layout: {
            defaultBorder: false,
        }
    }
}

//Svg para exportar

export const checkSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: #203C80;transform: ;msFilter:;"><path d="m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z"></path></svg>'

export function checkColorSvg(color: string) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: ${color};transform: ;msFilter:;"><path d="m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z"></path></svg>`;
}

export const noteSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: #F65A74 ;transform: ;msFilter:;"><path d="M19 4h-3V2h-2v2h-4V2H8v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V7h14V6l.002 14H5z"></path><path d="M7 9h10v2H7zm0 4h5v2H7z"></path></svg>'

export const lupaSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: #F65A74;transform: ;msFilter:;"><path d="M13.707 2.293A.996.996 0 0 0 13 2H6c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V9a.996.996 0 0 0-.293-.707l-6-6zM6 4h6.586L18 9.414l.002 9.174-2.568-2.568c.35-.595.566-1.281.566-2.02 0-2.206-1.794-4-4-4s-4 1.794-4 4 1.794 4 4 4c.739 0 1.425-.216 2.02-.566L16.586 20H6V4zm6 12c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z"></path></svg>'

export const bulbSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: #F65A74;transform: ;msFilter:;"><path d="M9 20h6v2H9zm7.906-6.288C17.936 12.506 19 11.259 19 9c0-3.859-3.141-7-7-7S5 5.141 5 9c0 2.285 1.067 3.528 2.101 4.73.358.418.729.851 1.084 1.349.144.206.38.996.591 1.921H8v2h8v-2h-.774c.213-.927.45-1.719.593-1.925.352-.503.726-.94 1.087-1.363zm-2.724.213c-.434.617-.796 2.075-1.006 3.075h-2.351c-.209-1.002-.572-2.463-1.011-3.08a20.502 20.502 0 0 0-1.196-1.492C7.644 11.294 7 10.544 7 9c0-2.757 2.243-5 5-5s5 2.243 5 5c0 1.521-.643 2.274-1.615 3.413-.373.438-.796.933-1.203 1.512z"></path></svg>'

export const buildSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: #F65A74;transform: ;msFilter:;"><path d="M18 2H6c-1.103 0-2 .897-2 2v17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2zm0 18H6V4h12v16z"></path><path d="M8 6h3v2H8zm5 0h3v2h-3zm-5 4h3v2H8zm5 .031h3V12h-3zM8 14h3v2H8zm5 0h3v2h-3z"></path></svg>'

export const laptopSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: #F65A74;transform: ;msFilter:;"><path d="M20 17.722c.595-.347 1-.985 1-1.722V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v11c0 .736.405 1.375 1 1.722V18H2v2h20v-2h-2v-.278zM5 16V5h14l.002 11H5z"></path></svg>'

export const qaSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: #F65A74;transform: ;msFilter:;"><path d="m7 17.013 4.413-.015 9.632-9.54c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.756-.756-2.075-.752-2.825-.003L7 12.583v4.43zM18.045 4.458l1.589 1.583-1.597 1.582-1.586-1.585 1.594-1.58zM9 13.417l6.03-5.973 1.586 1.586-6.029 5.971L9 15.006v-1.589z"></path><path d="M5 21h14c1.103 0 2-.897 2-2v-8.668l-2 2V19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2z"></path></svg>'

export const letterSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: #F65A74;transform: ;msFilter:;"><path d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm0 2v.511l-8 6.223-8-6.222V6h16zM4 18V9.044l7.386 5.745a.994.994 0 0 0 1.228 0L20 9.044 20.002 18H4z"></path></svg>'

export const stackSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: #F65A74;transform: ;msFilter:;"><path d="M12 22c3.976 0 8-1.374 8-4V6c0-2.626-4.024-4-8-4S4 3.374 4 6v12c0 2.626 4.024 4 8 4zm0-2c-3.722 0-6-1.295-6-2v-1.268C7.541 17.57 9.777 18 12 18s4.459-.43 6-1.268V18c0 .705-2.278 2-6 2zm0-16c3.722 0 6 1.295 6 2s-2.278 2-6 2-6-1.295-6-2 2.278-2 6-2zM6 8.732C7.541 9.57 9.777 10 12 10s4.459-.43 6-1.268V10c0 .705-2.278 2-6 2s-6-1.295-6-2V8.732zm0 4C7.541 13.57 9.777 14 12 14s4.459-.43 6-1.268V14c0 .705-2.278 2-6 2s-6-1.295-6-2v-1.268z"></path></svg>'