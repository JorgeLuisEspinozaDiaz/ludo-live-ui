import { signal } from "@preact/signals-react";

const sizeAbogeTable = signal<number>(22.3);

export const UseTablet = (size?: number) => {
    if (size) sizeAbogeTable.value = size
    return {
        sizeAbogeTable,
    }
}