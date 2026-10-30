import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarPickerProps } from "./types";
import { DAY_NAMES, MONTH_NAMES, from12HourParts, isSameDate, to12HourParts } from "./utils";

export const CalendarPicker = ({
  locale,
  calendarSize,
  viewMonth,
  viewYear,
  dayCells,
  selectedStart,
  selectedEnd,
  previewEnd,
  rangeStep,
  resolvedMode,
  showButtonBar,
  rangeStartBgColor,
  rangeStartTextColor,
  rangeFillBgColor,
  rangeFillTextColor,
  showTime,
  tempTime,
  timeFormat = "12h",
  minDate,
  maxDate,
  className = "",
  style,
  onPreviousMonth,
  onNextMonth,
  onPickDay,
  onHoverRangeDate,
  onToday,
  onClear,
  onTimeChange,
}: CalendarPickerProps) => {
  const calendarSizeClass = calendarSize === "sm" ? "w-[280px] p-2.5" : "w-[320px] p-3";
  const headerTextClass = calendarSize === "sm" ? "text-[.75rem]" : "text-[.9rem]";
  const weekTextClass = calendarSize === "sm" ? "text-[0.65rem]" : "text-[0.8rem]";
  const dayButtonClass = calendarSize === "sm" ? "h-7 w-7 text-[0.6rem]" : "h-8 w-8 text-[0.9rem]";

  const [hh24 = "00", mm = "00"] = (tempTime || "00:00").split(":");
  const parts12 = to12HourParts(Number(hh24) || 0, Number(mm) || 0);

  const isDisabledByMinMax = (date: Date) => {
    const min = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : null;
    const max = maxDate ? new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()) : null;
    if (min && date < min) return true;
    if (max && date > max) return true;
    return false;
  };

  const emit12hTime = (hour12: string, minute: string, period: "AM" | "PM") => {
    const { time24 } = from12HourParts(hour12, minute, period);
    onTimeChange(time24);
  };

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-xl ${calendarSizeClass} ${className}`}
      style={style}
    >
      <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
        <button type="button" onClick={onPreviousMonth} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-2 leading-none">
          <span className={`${headerTextClass} font-semibold text-slate-700`}>{MONTH_NAMES[locale][viewMonth]}</span>
          <span className={`${headerTextClass} font-semibold text-slate-700`}>{viewYear}</span>
        </div>
        <button type="button" onClick={onNextMonth} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAY_NAMES[locale].map((nameDay) => (
          <div key={nameDay} className={`text-center font-semibold text-slate-500 ${weekTextClass}`}>
            {nameDay}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2">
        {dayCells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="h-fit" />;

          const current = new Date(viewYear, viewMonth, day);
          const disabledDay = isDisabledByMinMax(current);
          const rangeEnd = selectedEnd ?? previewEnd;
          const minRange = selectedStart && rangeEnd ? (selectedStart <= rangeEnd ? selectedStart : rangeEnd) : null;
          const maxRange = selectedStart && rangeEnd ? (selectedStart >= rangeEnd ? selectedStart : rangeEnd) : null;
          const isCurrentStart = isSameDate(current, selectedStart);
          const isCurrentEnd = isSameDate(current, rangeEnd);
          const inRange = !!(minRange && maxRange && current >= minRange && current <= maxRange);

          return (
            <button
              key={`day-${day}-${index}`}
              type="button"
              onClick={() => onPickDay(day)}
              onMouseEnter={() => {
                if (resolvedMode === "range" && rangeStep === "end" && selectedStart && !selectedEnd) {
                  onHoverRangeDate(current);
                }
              }}
              disabled={disabledDay}
              className={`mx-auto rounded-full font-medium transition-colors ${dayButtonClass} ${
                disabledDay ? "cursor-not-allowed text-slate-300" : "text-slate-700 hover:bg-slate-100"
              }`}
              style={
                isCurrentStart || isCurrentEnd
                  ? { backgroundColor: rangeStartBgColor, color: rangeStartTextColor }
                  : inRange
                    ? { backgroundColor: rangeFillBgColor, color: rangeFillTextColor }
                    : undefined
              }
            >
              {day}
            </button>
          );
        })}
      </div>

      {showButtonBar && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <button type="button" onClick={onToday} className="text-[.6rem] font-semibold text-emerald-600 hover:underline">
            Hoy
          </button>
          <button type="button" onClick={onClear} className="text-[.6rem] font-semibold text-slate-500 hover:underline">
            Limpiar
          </button>
        </div>
      )}

      {showTime && resolvedMode === "datetime" && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          <span className="text-[11px] font-semibold text-slate-500">Hora</span>
          {timeFormat === "12h" ? (
            <div className="flex items-center gap-2">
              <select
                value={parts12.hour12}
                onChange={(e) => emit12hTime(e.target.value, parts12.minute, parts12.period)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[12px] font-semibold text-slate-700"
              >
                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span className="text-slate-400">:</span>
              <select
                value={parts12.minute}
                onChange={(e) => emit12hTime(parts12.hour12, e.target.value, parts12.period)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[12px] font-semibold text-slate-700"
              >
                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={parts12.period}
                onChange={(e) => emit12hTime(parts12.hour12, parts12.minute, e.target.value as "AM" | "PM")}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[12px] font-semibold text-slate-700"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          ) : (
            <input
              type="time"
              value={tempTime}
              onChange={(event) => onTimeChange(event.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-[12px]"
            />
          )}
        </div>
      )}
    </div>
  );
};
