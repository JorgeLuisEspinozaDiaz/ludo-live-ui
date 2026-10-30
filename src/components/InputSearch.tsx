interface InputSearchProps {
  form?: any;
  name?: string;
  value?: string;
  onKeyUp?: (e: any) => void;
  placeholder?: string;
  onSearch?: () => void;
  [key: string]: unknown;
}

/** Stub compatible con Tablet legado */
export const InputSearch = ({ value, onKeyUp, name, placeholder, form }: InputSearchProps) => (
  <input
    name={name}
    value={value ?? form?.[name ?? ""] ?? ""}
    placeholder={placeholder}
    onChange={(e) => onKeyUp?.({ target: { name: name ?? e.target.name, value: e.target.value } })}
    className="w-full border border-pink-100 rounded-full px-4 py-2 text-sm"
  />
);

export default InputSearch;
