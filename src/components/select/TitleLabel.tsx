import type { ITitleLabel } from "./types";

export const TitleLabel = (props: ITitleLabel) => {
  const {
    label,
    classNameLabel,
    labelStyle,
    required,
    disabled,
    labelIconSuccess,
    labelIconWarning,
    iconBeforeLabel: IconCustom,
    labelRender,
  } = props;

  if (!label || label.length === 0) {
    return null;
  }

  const renderIcons = () =>
    required &&
    !disabled && (
      <>
        <i id={labelIconSuccess} className="bx bx-check-circle text-green-500 flex items-center ml-1"></i>

        <i id={labelIconWarning} className="bx bx-error text-yellow-500 flex items-center ml-1"></i>
      </>
    );

  return (
    <span
      className={`${classNameLabel} flex items-center text-[11px] font-extrabold pb-[5.4px] text-text-color justify-between mt-3`}
      style={labelStyle}
    >
      <div className="flex uppercase">
        {IconCustom && (
          <div className="flex items-center pr-1 text-slate-400">
            <IconCustom size={12} strokeWidth={2} />
          </div>
        )}

        {label}

        {renderIcons()}
      </div>

      <div>{labelRender && labelRender()}</div>
    </span>
  );
};
