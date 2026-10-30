interface IData {
    name: string;
    value: string | number | boolean | any[] | Date | null | undefined;
    message: string;
}

export interface IProgressValue {
    validate: number;
    total: number;
    data: IData[]
    dataKey: string[]
}