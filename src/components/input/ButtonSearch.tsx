import { Search } from "lucide-react";
import type { IButtonSearch } from "./typeInput";

export const ButtonSearch: React.FC<IButtonSearch> = ({ is_search, typeInput, onClickSearch, containerLoading }) => {
  if (!is_search) {
    return null;
  }

  const handleChangeSearch = async () => {
    const container = document.getElementById(containerLoading);

    if (container) {
      container.classList.add("active");
    }

    if (onClickSearch) {
      await onClickSearch();
    }

    if (container) {
      container.classList.remove("active");
    }
  };

  const getClassName = (typeInput: string) => {
    switch (typeInput) {
      case "first":
        return "top-[55%]";

      case "second":
        return "top-2.5";

      case "third":
        return "top-2";

      case "fourth":
        return "top-0.8";

      default:
        return "top-2";
    }
  };

  return (
    <div className={`absolute right-4 cursor-pointer ${getClassName(typeInput)}`}>
      <Search size={16} className="bx bx-search text-slate-400 mt-1.5" onClick={handleChangeSearch} />
    </div>
  );
};
