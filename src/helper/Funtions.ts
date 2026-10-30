import axios, { AxiosError } from "axios";
import { toast } from "sonner";
// import QRCode from "qrcode-generator";

import * as Excel from "exceljs";

import { Border } from "./structureEXCELComponents";
import { MimeIconMap } from "./Arrays";

export const getRandomHexColor = (opacity: number = 1): string => {
  if (opacity < 0 || opacity > 1) {
    throw new Error("La opacidad debe estar en el rango de 0 a 1");
  }

  const randomColor = Math.floor(Math.random() * 0xffffff);
  const colorString = randomColor.toString(16).padStart(6, "0");

  // Convierte la opacidad a un valor en el rango de 0 a 255 (equivalente a 0% a 100%)
  const opacityValue = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${colorString}${opacityValue}`;
};

export const formatearFechaHora = (
  fechaString: string = "",
  formato: "fecha" | "hora" | "fecha hora" = "fecha",
  format: "yyyy-mm-dd" | "yyyy/mm/dd" | "dd-mm-yyyy" | "dd/mm/yyyy" = "dd-mm-yyyy"
): string => {
  try {
    const opcionesFecha: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const opcionesHora: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };

    if ((fechaString || "").length == 0) return "";

    const fecha = new Date(fechaString);

    let fechaFormateada = "";
    let horaFormateada = "";

    if (formato.includes("fecha")) {
      fechaFormateada = fecha
        .toLocaleDateString("es-ES", opcionesFecha)
        .replace(/\//g, "-");
    }

    if (format && format === "yyyy-mm-dd") {
      let partesFecha: string[] = fechaFormateada.split("-");
      let nuevaFechaFormateada: string = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
      fechaFormateada = nuevaFechaFormateada;
    }
    if (format && format === "yyyy/mm/dd") {
      let partesFecha: string[] = fechaFormateada.split("-");
      let nuevaFechaFormateada: string = `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}`;
      fechaFormateada = nuevaFechaFormateada;
    }
    if (format && format === "dd-mm-yyyy") {
      let partesFecha: string[] = fechaFormateada.split("-");
      let nuevaFechaFormateada: string = `${partesFecha[0]}-${partesFecha[1]}-${partesFecha[2]}`;
      fechaFormateada = nuevaFechaFormateada;
    }
    if (format && format === "dd/mm/yyyy") {
      let partesFecha: string[] = fechaFormateada.split("-");
      let nuevaFechaFormateada: string = `${partesFecha[0]}/${partesFecha[1]}/${partesFecha[2]}`;
      fechaFormateada = nuevaFechaFormateada;
    }

    if (formato.includes("hora")) {
      horaFormateada = fecha.toLocaleTimeString("es-ES", opcionesHora);
    }

    if (formato.includes("fecha") && formato.includes("hora")) {
      return `${fechaFormateada} - ${horaFormateada}`;
    } else if (formato.includes("fecha")) {
      return fechaFormateada;
    } else if (formato.includes("hora")) {
      return horaFormateada;
    }

    return "";
  } catch (error) {
    console.log(error);
    return "";
  }
};

export const fechaATexto = (fecha: string): string => {
  if (!fecha) return "";

  const [year, month, day] = fecha.split("-");
  if (!year || !month || !day) return fecha;

  const mesesCortos: Record<string, string> = {
    "01": "Ene",
    "02": "Feb",
    "03": "Mar",
    "04": "Abr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Ago",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dic",
  };

  const monthText = mesesCortos[month];
  if (!monthText) return fecha;

  const dayFormatted = day.padStart(2, "0");
  return `${dayFormatted} ${monthText} ${year}`;
};

export const obtenerPrimeraLetra = ({ nombre, apellido }: { nombre: string, apellido?: string }): string => {
  if (!nombre && !apellido) return "";
  if (!apellido) return nombre.charAt(0).toUpperCase();
  if (!nombre) return apellido.charAt(0).toUpperCase();
  return nombre.charAt(0).toUpperCase() + apellido.charAt(0).toUpperCase();
};

export interface IAtributosValidar {
  slug: string;
  message: string;
  functionValidate?: (
    value: number | string | Date | boolean | null | undefined | any[]
  ) => [boolean, string | null];
}


export const base64_encode = async (ruta: string): Promise<string> => {
  try {
    // Obtener la ruta completa de la imagen dentro de la carpeta public
    const rutaCompleta = import.meta.env.VITE_BASE_URL + ruta;
    // Verificar la extensión del archivo
    const extension = ruta.split(".").pop()?.toLowerCase();
    let responseType: "blob" | "text" = "blob";
    if (extension === "svg") {
      // Si la extensión es SVG, configurar responseType como 'text'
      responseType = "text";
    }
    const response = await axios.get(rutaCompleta, {
      headers: {
        "Access-Control-Allow-Origin": "*", // Puedes ajustar esto según tus necesidades
      },
      responseType, // Indicar que esperamos un blob como respuesta
    });

    // Convertir la imagen a base64 dependiendo de la extensión

    if (extension === "svg") {
      return await convertirTextToBase64(response.data);
    } else {
      return await convertirBlobToBase64(response.data);
    }
  } catch (error) {
    console.error("Error al cargar la imagen:", error);
    throw error;
  }
};

const convertirBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === "string") {
        resolve(reader.result);
      }
    };
    reader.readAsDataURL(blob);
  });
};

const convertirTextToBase64 = (text: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const base64String = `data:image/svg+xml;base64,${btoa(text)}`;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const newBase64ToString = canvas.toDataURL("image/png");
          resolve(newBase64ToString);
        }
      };
      img.src = base64String;
    } catch (error) {
      reject(error);
    }
  });
};

export const extraerIds = (formForId: any) => {
  const regex = /id_(\d+)_idDetailCdr_(\d+)/;
  const invoiceIds: any = [];
  const detailCdrIds: any = [];
  for (const clave in formForId) {
    if (formForId[clave] === true) {
      const match = clave.match(regex);
      if (match) {
        const id = match[1];
        const idDetailCdr = match[2];
        invoiceIds.push({
          id: Number(id),
          value: true,
        });
        detailCdrIds.push({
          id: Number(idDetailCdr),
          value: true,
        });
        // console.log(`id: ${id}, idDetailCdr: ${idDetailCdr}`);
      }
    }
  }
  return {
    invoiceIds,
    detailCdrIds,
  };
};



// export const generateQRBase64 = (value: string): string => {
//   // Crea un objeto QRCode con el valor proporcionado
//   const qr = QRCode(0, "M");
//   qr.addData(value);
//   qr.make();

//   // Crea un elemento canvas para renderizar el código QR
//   const canvas = document.createElement("canvas");
//   const ctx: any = canvas.getContext("2d");

//   // Ajusta el tamaño del canvas según el tamaño del código QR generado
//   const size = qr.getModuleCount();
//   const cellSize = 4; // Tamaño de cada celda del código QR
//   canvas.width = size * cellSize;
//   canvas.height = size * cellSize;

//   // Dibuja el código QR en el canvas
//   for (let y = 0; y < size; y++) {
//     for (let x = 0; x < size; x++) {
//       ctx.fillStyle = qr.isDark(y, x) ? "#000" : "#fff";
//       ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
//     }
//   }

//   // Convierte el canvas a una imagen base64
//   const base64Image = canvas.toDataURL("image/png");

//   // Devuelve la imagen base64
//   return base64Image;
// };

export const evalExpression = (
  valueOne: number | string | undefined | Date | boolean | null,
  expression: string = ">=",
  vaueTwo: number
) => {
  if (valueOne === undefined || valueOne === null) return false;

  let newValue: number | string | Date | boolean = valueOne || "";
  if (typeof valueOne == "number")
    newValue =
      (valueOne == undefined ? "" : valueOne).toString().length == 0
        ? ""
        : valueOne;

  switch (expression) {
    case "<":
      return newValue.toString().length < vaueTwo;
    case ">":
      return newValue.toString().length > vaueTwo;
    case ">=":
      return newValue.toString().length >= vaueTwo;
    case "<=":
      return newValue.toString().length <= vaueTwo;
    case "==":
      return newValue.toString().length == vaueTwo;
    case "!=":
      return newValue.toString().length != vaueTwo;

    default:
      return false;
  }
};

export const returnScreenSize = (): any => {
  const width = window.innerWidth;
  if (width < 768) {
    return "phone";
  } else if (width >= 768 && width < 1024) {
    return "tablet";
  } else if (width >= 1024 && width < 1440) {
    return "laptop";
  } else if (width >= 1440) {
    return "desktop";
  }
};

export const getStartOfMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = "01";

  return `${year}-${month}-${day}`;
};

export const getEndOfMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  const formattedMonth = String(month).padStart(2, "0");
  const formattedDay = String(lastDay).padStart(2, "0");

  return `${year}-${formattedMonth}-${formattedDay}`;
};

export const getCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const replaceTextoForAddress = (input: string): string => {
  let value = input;
  value = value.replace(/&#45;/g, "-");
  value = value.replace(/&#47;/g, "/");
  value = value.replace(/&#40;/g, "(");
  value = value.replace(/&#41;/g, ")");
  value = value.replace(/&#176;/g, "°");
  return value;
};



export const formatFechaPdfIntl = (dateInput: string | Date): string => {
  const date = new Date(dateInput);

  const [dia, mes, año] = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(date)
    .replace(" de ", " ")
    .replace(" de ", " ")
    .split(" ");

  return `${dia} ${mes.charAt(0).toUpperCase() + mes.slice(1)} ${año}`;
};


export const globalFilter = <T extends Record<string, any>>(
  data: T[],
  search: string
): T[] => {
  if (!search) return data;
  const normalizedSearch = search.toLowerCase();
  return data.filter((item) => {
    const text = Object.values(item)
      .map((value) => {
        if (value == null) return "";
        if (Array.isArray(value)) return value.join(" ");
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
      })
      .join(" ")
      .toLowerCase();
    return text.includes(normalizedSearch);
  });
};

export const getFileIcon = (mimeType?: string) => {
  if (!mimeType) return MimeIconMap.default;
  return MimeIconMap[mimeType] || MimeIconMap.default;
};

export const getFileColor = (mimeType?: string) => {
  if (!mimeType) return "text-slate-500";

  if (mimeType.startsWith("image/")) return "text-emerald-600";
  if (mimeType.startsWith("video/")) return "text-purple-600";
  if (mimeType.startsWith("audio/")) return "text-orange-600";
  if (mimeType.includes("pdf")) return "text-red-600";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
    return "text-green-600";

  return "text-blue-600";
};

export const toCellValue = (value: unknown): Excel.CellValue => {
  if (value === null || value === undefined) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value instanceof Date
  ) {
    return value;
  }

  return String(value);
}

export const paintGrid = (
  worksheet: Excel.Worksheet,
  totalRows = 2000,
  totalCols = 30,
) => {
  for (let r = 1; r <= totalRows; r++) {
    for (let c = 1; c <= totalCols; c++) {
      const cell = worksheet.getCell(r, c);

      cell.border = Border({
        left: true,
        right: true,
        top: true,
        bottom: true
      });

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFFFF" }
      };
    }
  }
}

export const handleError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    toast.info(getAxiosErrorMessage(error));
  }
  return "Error inesperado";
};

export const getAxiosErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) return error.response?.data?.message ?? error.message;
  return "Error inesperado";
};

export const formatDate = (date: string) => {
  if (date.includes("/")) {
    // dd/MM/yyyy → yyyy-MM-dd
    const [day, month, year] = date.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  if (date.includes("-")) {
    // yyyy-MM-dd → dd/MM/yyyy
    const [year, month, day] = date.split("-");
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  }

  return date;
};