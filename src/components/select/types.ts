import type { CSSProperties } from "react";
import type { IValidateForm } from "../../interface/IValidateForm";
import type { Signal } from "@preact/signals-react";
import type { LucideIcon } from "lucide-react";

export interface IPropsSelect {
    label?: string;
    labelRender?: () => React.JSX.Element | string;
    classNameLabel?: string | ((e: any) => string);
    labelStyle?: CSSProperties;
    classNameContainer?: string | ((e: any) => string);
    classNameLabelInButton?: string | ((e: any) => string);
    classNameButton?: string | ((e: any) => string);
    classListItemCustom?: string;
    classNameItem?: string | ((e: any) => string);
    value: number | string | boolean | Date | undefined | null | Array<number>;
    onChange?: (e: any) => any;
    required?: boolean;
    disabled?: boolean;
    data?: any;
    readView: string;
    keyValue: string;
    placeholder?: string;
    name: string;
    registrosView?: string;
    update?: Signal<boolean>;
    form?: any;
    search?: boolean;
    searchValue?: ((item: any) => string) | string;
    handleSearch?: (value: string) => void;
    handleChangeReadViewButton?: (item: any) => React.JSX.Element | string;
    validateFormulario?: Signal<IValidateForm>;
    messageError?: string;
    multiple?: boolean;
    iconBeforeLabel?: LucideIcon;
    usePortal?: boolean;
}

export interface ITitleLabel {
    label?: string;
    labelRender?: () => React.JSX.Element | string;
    classNameLabel?: string | ((e: any) => string);
    labelStyle?: CSSProperties;
    required?: boolean;
    disabled?: boolean;
    labelIconSuccess: string;
    labelIconWarning: string;
    iconBeforeLabel?: LucideIcon;
}

export interface IButton {
    classNameButton?: string | ((e: any) => string);
    classNameLabelInButton?: string | ((e: any) => string);
    classText: string;
    handleChangeClickButton: () => void;
    disabled?: boolean;
    value?: number | string | Date | boolean | undefined | null | Array<number>;
    placeholder: string;
    data: Signal<any[]>;
    readView: string;
    keyValue: string;
    activeSelect: string;
    update?: Signal<boolean>;
    form?: any;
    name: string;
    inputSearchId: string;
    buttonSelectId: string;
    search?: boolean;
    handleChangeFilterData?: (value: string) => void;
    handleChangeClickMenu: (e: any, item: any) => any;
    handleSearch?: (value: string) => any;
    handleChangeReadViewButton?: (item: any) => React.JSX.Element | string;
    multiple: boolean;
    dataSelect: any[];
    handleChangeDeleteItemToDataSelect: (
        event: any,
        indexDt: number,
    ) => void;
    label?: string;
    containerLoading: string;
}

export interface IListItemsForBtn {
    data: any[];
    handleChangeReadViewButton?: (item: any) => React.JSX.Element | string;
    readView: string;
    inputSearchId: string;
    classText: string;
    handleKeyDown: (event: any) => void;
    search?: boolean;
    activeSelect: string;
    handleChangeDeleteItemToDataSelect: (
        event: any,
        indexDt: number,
    ) => void;
}

export interface IIconForBtn {
    activeSelect: string;
}

export interface IListUl {
    data: Signal<any[]>;
    classNameItem?: string | ((e: any) => string);
    classListItemCustom: string;
    classItemOption: string;
    handleChangeClickMenu: (e: any, item: any) => any;
    readView: string;
    registrosView?: string;
    activeSelect: string;
    handleChangeReadViewButton?: (item: any) => React.JSX.Element | string;
    buttonSelectId: string;
    usePortal?: boolean;
}

export interface IListLi {
    classNameItem?: string | ((e: any) => string);
    classItemOption: string;
    handleChangeClickMenu: (e: any, item: any) => any;
    item: any;
    readView: string;
    handleChangeReadViewButton?: (item: any) => React.JSX.Element | string;
}