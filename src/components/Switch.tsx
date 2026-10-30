import { useState, type CSSProperties } from "react";
import type { Signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";

const DEFAULT_TRACK_ON = "#047857";
const DEFAULT_TRACK_OFF = "#cbd5e1";

interface SwitchProps {
  name: string;
  form: any;
  update?: Signal<boolean>;
  onKeyUp?: (e: any) => void;
  disabled?: boolean;
  colorOn?: string;
  colorOff?: string;
}

export const Switch = ({ name, form, update, onKeyUp, disabled, colorOn, colorOff }: SwitchProps) => {
  useSignals();
  void update?.value;
  const [, forceRender] = useState(0);

  const isChecked = !!form[name];
  const useCustomTrackColor = colorOn !== undefined || colorOff !== undefined;
  const trackStyle: CSSProperties | undefined = useCustomTrackColor
    ? {
        backgroundColor: isChecked ? (colorOn ?? DEFAULT_TRACK_ON) : (colorOff ?? DEFAULT_TRACK_OFF),
      }
    : undefined;
  const trackBgClass = useCustomTrackColor ? "" : isChecked ? "bg-primary-color" : "bg-slate-300";

  const handleClick = () => {
    if (disabled) return;
    const next = !isChecked;
    const synthetic = { target: { name, value: next } };

    if (onKeyUp) {
      onKeyUp(synthetic);
    } else if (form && typeof form === "object" && name) {
      form[name] = next;
    }

    // No mutar `update` (suele ser activeModal): solo forzar re-render local
    forceRender((n) => n + 1);
  };

  return (
    <div className="flex items-center justify-between py-2">
      <button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        style={trackStyle}
        className={` relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${trackBgClass} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300  ${isChecked ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
};
