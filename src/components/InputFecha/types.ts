import type { CSSProperties } from "react";
import type { Signal } from "@preact/signals-react";

export type InputFechaModo = "date" | "datetime" | "range";
export type PickerVariant = "custom" | "native";
export type SelectionMode = "single" | "range";
export type TimeFormat = "12h" | "24h";
export type ValueFormat = "display" | "iso";

export interface InputFechaProps {
    name: string;
    label?: string;
    placeholder?: string;
    form?: any;
    value?: string;
    onChange?: (e: any) => void;
    onKeyUp?: (e: any) => void;
    update?: Signal<boolean>;
    required?: boolean;
    disabled?: boolean;
    selectionMode?: SelectionMode;
    showTime?: boolean;
    readOnlyInput?: boolean;
    hideOnRangeSelection?: boolean;
    showButtonBar?: boolean;
    minDate?: Date;
    maxDate?: Date;
    locale?: "es" | "en";
    calendarSize?: "sm" | "md";
    rangeStartBgColor?: string;
    rangeStartTextColor?: string;
    rangeFillBgColor?: string;
    rangeFillTextColor?: string;
    mode?: InputFechaModo;
    enableRangePicker?: boolean;
    allowPicker?: boolean;
    showIcon?: boolean;
    pickerVariant?: PickerVariant;
    /** Formato de hora en UI (AM/PM vs 24h) */
    timeFormat?: TimeFormat;
    /** Cómo se guarda en form/value: ISO local o texto visible */
    valueFormat?: ValueFormat;
    /** Renderiza el calendario en portal (fuera del modal) */
    usePortal?: boolean;
    className?: string;
    classNameInput?: string;
    style?: CSSProperties;
    styleContainer?: string;
    iconClassName?: string;
    top?: boolean;
}

export interface CalendarPickerProps {
    locale: "es" | "en";
    calendarSize: "sm" | "md";
    viewMonth: number;
    viewYear: number;
    dayCells: (number | null)[];
    selectedStart: Date | null;
    selectedEnd: Date | null;
    previewEnd: Date | null;
    rangeStep: "start" | "end";
    resolvedMode: InputFechaModo;
    showButtonBar: boolean;
    hideOnRangeSelection: boolean;
    rangeStartBgColor: string;
    rangeStartTextColor: string;
    rangeFillBgColor: string;
    rangeFillTextColor: string;
    showTime: boolean;
    tempTime: string;
    timeFormat?: TimeFormat;
    inputValue?: string;
    minDate?: Date;
    maxDate?: Date;
    className?: string;
    style?: CSSProperties;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
    onPickDay: (day: number) => void;
    onHoverRangeDate: (date: Date | null) => void;
    onToday: () => void;
    onClear: () => void;
    onTimeChange: (time: string) => void;
}

export interface NativePickersProps {
    resolvedMode: InputFechaModo;
    inputValue: string;
    rangeStart: string;
    rangeEnd: string;
    rangeStartPickerRef: React.RefObject<HTMLInputElement | null>;
    rangeEndPickerRef: React.RefObject<HTMLInputElement | null>;
    datePickerRef: React.RefObject<HTMLInputElement | null>;
    dateTimePickerRef: React.RefObject<HTMLInputElement | null>;
    onDateChange: (value: string) => void;
    onDateTimeChange: (value: string) => void;
    onRangeStartChange: (value: string) => void;
    onRangeEndChange: (value: string) => void;
}