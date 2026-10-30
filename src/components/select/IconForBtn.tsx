import type { IIconForBtn } from "./types";

export const IconForBtn = (props: IIconForBtn) => {
  const { activeSelect } = props;

  return (
    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
      <svg
        className={`${activeSelect == "" ? "text-select-primary-color" : "text-select-text-color"} h-5 w-5`}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
      </svg>
    </span>
  );
};
