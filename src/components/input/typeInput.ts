import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import type { Signal } from "@preact/signals-react";
import type { IValidateForm } from "../../interface/IValidateForm";
import type { IProgressValue } from "../../interface/IProgressValue";

export interface IPropsInput {
    className?: string | ((e: any) => string);
    style?: CSSProperties;
    onRequiredChange?: (isValid: boolean) => void;
    classNameLabel?: string | ((e: any) => string);
    labelStyle?: CSSProperties;
    label?: string;
    styleContainer?: string;
    required?: boolean;
    disabled?: boolean;
    min?: number[];
    max?: number[];
    expresionMin?: string;
    expresionMax?: string;
    messageError?: string;
    IconLeft?: LucideIcon;
    iconClassName?: string;
    value?: number | string | undefined | Date;
    form?: any;
    onChange?: (e: any) => any;
    onKeyUp?: (e: any) => any;
    onEnter?: (e: string | number) => any;
    onBlur?: (e: any) => any;
    inputStyle?: CSSProperties;
    placeholder?: string;
    classNameInput?: string | ((e: any) => string);
    type?: "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week";
    name: string;
    typeInput?: "first" | "second" | "third" | "fourth";
    update?: Signal<boolean>;
    is_search?: boolean;
    onClickSearch?: () => any;
    validateFormulario?: Signal<IValidateForm>;
    dateMin?: string;
    dateMax?: string;
    autocomplete?: boolean;
    classListItemCustom?: string;
    classNameItem?: string;
    handleChangeReadViewButton?: (
        item: any,
    ) => React.JSX.Element | string;
    keyValue?: string;
    keyValueFilter?: string;
    data?: any;
    readView?: string;
    onClick?: (e: any) => any;
    isArrowForNumber?: boolean;
    textArea?: boolean;
    rowsTextArea?: number;
    autoFocus?: boolean;
    progressValue?: Signal<IProgressValue>;
}

export interface ILabel {
    classNameLabel?: string | ((e: any) => string);
    labelStyle?: CSSProperties;
    label?: string;
    inputId: string;
    required?: boolean;
    disabled?: boolean;
    labelIconSuccess: string;
    labelIconWarning: string;
    containerLoading: string;
    typeInput: "first" | "second" | "third" | "fourth";
}

export interface IInputCustom {
    inputId: string;
    inputStyle?: CSSProperties;
    placeholder: string;
    type?: string;
    IconLeft?: LucideIcon;
    iconClassName?: string;
    name: string;
    required?: boolean;
    disabled?: boolean;
    classNameInput?: string | ((e: any) => string);
    isArrowForNumber?: boolean;
    classText: string;
    onKeyUp: (ev: any) => void;
    onBlur: (ev: any) => void;
    onChange: (ev: any) => void;
    onFocus: (ev: string) => void;
    typeInput: "first" | "second" | "third" | "fourth";
    containerLoading: string;
    textArea?: boolean;
    is_search?: boolean;
    autoFocus: boolean;
    label?: string;
    rowsTextArea: number;
}

export interface IButtonSearch {
    is_search?: boolean;
    containerLoading: string;
    onClickSearch?: () => any;
    typeInput: "first" | "second" | "third" | "fourth";
}

export interface IListUl {
    data: Signal<any[]>;
    classNameItem?: string | ((e: any) => string);
    classListItemCustom: string;
    classItemOption: string;
    handleChangeClickMenu: (e: any, item: any) => any;
    readView?: string;
    registrosView?: string;
    activeSelect: string;
    handleChangeReadViewButton?: (
        item: any,
    ) => React.JSX.Element | string;
}

export interface IListLi {
    classNameItem?: string | ((e: any) => string);
    classItemOption: string;
    handleChangeClickMenu: (e: any, item: any) => any;
    item: any;
    readView?: string;
    handleChangeReadViewButton?: (
        item: any,
    ) => React.JSX.Element | string;
}

export type InputElement =
    | HTMLInputElement
    | HTMLTextAreaElement;

export type InputValue =
    | string
    | number
    | Date
    | boolean;