export const DAY_NAMES: Record<"es" | "en", string[]> = {
    es: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
    en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
};

export const MONTH_NAMES: Record<"es" | "en", string[]> = {
    es: [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
    ],
    en: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ],
};

export const DATE_TEMPLATE = "dd/mm/aaaa";

export const DATE_SEGMENTS = [
    { start: 0, end: 2 },
    { start: 3, end: 5 },
    { start: 6, end: 10 },
];

export const DATE_SEGMENT_LENGTHS = [2, 2, 4];

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const isDateComplete = (value: string) =>
    /^\d{2}\/\d{2}\/\d{4}$/.test(value);

export const isDateTimeComplete = (value: string) =>
    /^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}$/.test(value);

export const isLeapYear = (year: number) =>
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

export const maskDate = (raw: string) => {
    const digits = onlyDigits(raw).slice(0, 8);

    const dayRaw = digits.slice(0, 2);
    const monthRaw = digits.slice(2, 4);
    const yearRaw = digits.slice(4, 8);

    const toBoundedTwo = (v: string, min: number, max: number) => {
        if (!v) return "";
        if (v.length === 1) return v;

        const clamped = Math.min(Math.max(Number(v), min), max);

        return String(clamped).padStart(2, "0");
    };

    const day = toBoundedTwo(dayRaw, 1, 31);
    const month = toBoundedTwo(monthRaw, 1, 12);

    let year = yearRaw;

    if (yearRaw.length === 4) {
        const boundedYear = Math.min(
            Math.max(Number(yearRaw), 1900),
            2200
        );

        year = String(boundedYear);
    }

    if (digits.length <= 2) return day;
    if (digits.length <= 4) return `${day}/${month}`;

    return `${day}/${month}/${year}`;
};

export const maskDateTime = (raw: string) => {
    const digits = onlyDigits(raw).slice(0, 12);

    const datePart = digits.slice(0, 8);
    const timePart = digits.slice(8, 12);

    let content = "";

    if (datePart.length > 0) {
        content = maskDate(datePart);
    }

    if (timePart.length > 0) {
        const hRaw = timePart.slice(0, 2);
        const mRaw = timePart.slice(2, 4);

        const h =
            hRaw.length === 2
                ? String(Math.min(Math.max(Number(hRaw), 0), 23)).padStart(2, "0")
                : hRaw;

        const m =
            mRaw.length === 2
                ? String(Math.min(Math.max(Number(mRaw), 0), 59)).padStart(2, "0")
                : mRaw;

        content = `${content} ${h}${m ? `:${m}` : ""}`.trim();
    }

    return content;
};

export const isRealDate = (value: string) => {
    if (!isDateComplete(value)) return false;

    const [ddText, mmText, yyyyText] = value.split("/");

    const dd = Number(ddText);
    const mm = Number(mmText);
    const yyyy = Number(yyyyText);

    if (yyyy < 1900 || yyyy > 2200) return false;
    if (mm < 1 || mm > 12) return false;

    const monthDays = [
        31,
        isLeapYear(yyyy) ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ];

    return dd >= 1 && dd <= monthDays[mm - 1];
};

export const isRealDateTime = (value: string) => {
    if (!isDateTimeComplete(value)) return false;

    const [datePart, timePart] = value.split(" ");

    if (!isRealDate(datePart)) return false;

    const [hhText, mmText] = timePart.split(":");

    const hh = Number(hhText);
    const mm = Number(mmText);

    return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
};

export const getRangeParts = (value: string) => {
    const [start = "", end = ""] = value.split(" - ");

    return {
        start,
        end,
    };
};

export const toDateObject = (value: string) => {
    if (!isRealDate(value)) return null;

    const [ddText, mmText, yyyyText] = value.split("/");

    return new Date(
        Number(yyyyText),
        Number(mmText) - 1,
        Number(ddText)
    );
};

export const formatDate = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");

    return `${dd}/${mm}/${date.getFullYear()}`;
};

export const getDaysInMonth = (
    year: number,
    monthIndex: number
) => {
    return new Date(year, monthIndex + 1, 0).getDate();
};

export const isSameDate = (
    a: Date | null,
    b: Date | null
) =>
    !!a &&
    !!b &&
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

export const getNativeDateValue = (value: string) => {
    if (!isRealDate(value)) return "";

    const [dd, mm, yyyy] = value.split("/");

    return `${yyyy}-${mm}-${dd}`;
};

export const getNativeDateTimeValue = (value: string) => {
    if (!isRealDateTime(value)) return "";

    const [datePart, timePart] = value.split(" ");
    const [dd, mm, yyyy] = datePart.split("/");

    return `${yyyy}-${mm}-${dd}T${timePart}`;
};

/** Convierte Date a ISO local sin zona: 2026-10-01T15:30:00 */
export const toLocalIsoDateTime = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

export const parseLocalIsoDateTime = (value: string): Date | null => {
    if (!value) return null;
    const normalized = value.trim().replace(" ", "T");
    const match = normalized.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/
    );
    if (!match) {
        const asDate = new Date(value);
        return Number.isNaN(asDate.getTime()) ? null : asDate;
    }
    const [, y, m, d, hh, mm, ss = "0"] = match;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss));
};

export const to12HourParts = (hours24: number, minutes: number) => {
    const period: "AM" | "PM" = hours24 >= 12 ? "PM" : "AM";
    let hour12 = hours24 % 12;
    if (hour12 === 0) hour12 = 12;
    return {
        hour12: String(hour12).padStart(2, "0"),
        minute: String(minutes).padStart(2, "0"),
        period,
    };
};

export const from12HourParts = (hour12: string | number, minute: string | number, period: "AM" | "PM") => {
    let h = Number(hour12);
    const m = Number(minute);
    if (period === "AM") {
        if (h === 12) h = 0;
    } else if (h !== 12) {
        h += 12;
    }
    return {
        hours24: h,
        minutes: m,
        time24: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    };
};

/** dd/mm/aaaa hh:mm AM|PM */
export const formatDateTime12h = (date: Date) => {
    const parts = to12HourParts(date.getHours(), date.getMinutes());
    return `${formatDate(date)} ${parts.hour12}:${parts.minute} ${parts.period}`;
};

export const formatDateTime24h = (date: Date) => {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${formatDate(date)} ${hh}:${mm}`;
};

export const isRealDateTime12h = (value: string) => {
    const match = value.trim().match(/^(\d{2}\/\d{2}\/\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return false;
    const [, datePart, hourText, minuteText, periodText] = match;
    if (!isRealDate(datePart)) return false;
    const hour12 = Number(hourText);
    const minute = Number(minuteText);
    if (hour12 < 1 || hour12 > 12 || minute < 0 || minute > 59) return false;
    return periodText.toUpperCase() === "AM" || periodText.toUpperCase() === "PM";
};

export const parseDisplayDateTime = (value: string): Date | null => {
    const trimmed = value.trim();
    if (isRealDateTime12h(trimmed)) {
        const match = trimmed.match(/^(\d{2}\/\d{2}\/\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i)!;
        const [, datePart, hourText, minuteText, periodText] = match;
        const base = toDateObject(datePart);
        if (!base) return null;
        const { hours24, minutes } = from12HourParts(hourText, minuteText, periodText.toUpperCase() as "AM" | "PM");
        base.setHours(hours24, minutes, 0, 0);
        return base;
    }
    if (isRealDateTime(trimmed)) {
        const [datePart, timePart] = trimmed.split(" ");
        const base = toDateObject(datePart);
        if (!base) return null;
        const [hh, mm] = timePart.split(":").map(Number);
        base.setHours(hh, mm, 0, 0);
        return base;
    }
    return parseLocalIsoDateTime(trimmed);
};

export const isoToDisplayDateTime = (value: string, use12h = true) => {
    const date = parseLocalIsoDateTime(value) ?? parseDisplayDateTime(value);
    if (!date) return "";
    return use12h ? formatDateTime12h(date) : formatDateTime24h(date);
};

export const displayDateTimeToIso = (value: string) => {
    const date = parseDisplayDateTime(value);
    if (!date) return "";
    return toLocalIsoDateTime(date);
};

export const getDisplayValue = (inputValue: string) => {
    const digits = onlyDigits(inputValue).slice(0, 8);

    const slots = DATE_TEMPLATE.split("");

    const positions = [
        0,
        1,
        3,
        4,
        6,
        7,
        8,
        9,
    ];

    positions.forEach((position, index) => {
        if (digits[index]) {
            slots[position] = digits[index];
        }
    });

    return slots.join("");
};