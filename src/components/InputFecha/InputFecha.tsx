import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useSignalEffect } from "@preact/signals-react";
import { Calendar, CalendarRange, Clock } from "lucide-react";
import type { InputFechaProps, InputFechaModo } from "./types";
import {
  DATE_SEGMENTS,
  DATE_SEGMENT_LENGTHS,
  displayDateTimeToIso,
  formatDate,
  formatDateTime12h,
  formatDateTime24h,
  getDisplayValue,
  getDaysInMonth,
  getRangeParts,
  isRealDate,
  isRealDateTime,
  isRealDateTime12h,
  isoToDisplayDateTime,
  maskDate,
  maskDateTime,
  onlyDigits,
  parseDisplayDateTime,
  toDateObject,
} from "./utils";
import { NativePickers } from "./NativePickers";
import { CalendarPicker } from "./CalendarPicker";

export const InputFecha = ({
  name,
  label,
  placeholder,
  form,
  value,
  onChange,
  onKeyUp,
  update,
  disabled,
  selectionMode = "single",
  showTime = false,
  readOnlyInput = false,
  hideOnRangeSelection = true,
  showButtonBar = true,
  minDate,
  maxDate,
  locale = "es",
  calendarSize = "sm",
  rangeStartBgColor = "#ff1f68",
  rangeStartTextColor = "#ffffff",
  rangeFillBgColor = "#ffe4ec",
  rangeFillTextColor = "#9f1239",
  mode = "date",
  enableRangePicker = false,
  allowPicker = true,
  showIcon = true,
  pickerVariant = "custom",
  timeFormat = "12h",
  valueFormat = "display",
  usePortal = true,
  className = "",
  classNameInput = "",
  style,
  styleContainer = "",
  iconClassName = "",
  top = false,
}: InputFechaProps) => {
  const isRangeMode = selectionMode === "range" || enableRangePicker || mode === "range";
  const isDateTimeMode = showTime || mode === "datetime";
  const resolvedMode: InputFechaModo = isRangeMode ? "range" : isDateTimeMode ? "datetime" : "date";
  const resolvedPlaceholder =
    placeholder ??
    (resolvedMode === "datetime"
      ? timeFormat === "12h"
        ? "dd/mm/aaaa hh:mm AM"
        : "dd/mm/aaaa hh:mm"
      : "dd/mm/aaaa");

  const [inputValue, setInputValue] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [rangeStep, setRangeStep] = useState<"start" | "end">("start");
  const [hoverRangeDate, setHoverRangeDate] = useState<Date | null>(null);
  const [tempTime, setTempTime] = useState("00:00");
  const [pickerStyle, setPickerStyle] = useState<CSSProperties>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLInputElement>(null);
  const dateTimePickerRef = useRef<HTMLInputElement>(null);
  const rangeStartPickerRef = useRef<HTMLInputElement>(null);
  const rangeEndPickerRef = useRef<HTMLInputElement>(null);
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const rangeParts = getRangeParts(inputValue);

  const toDisplayValue = (raw: string) => {
    if (!raw) return "";
    if (resolvedMode !== "datetime") return raw;
    if (valueFormat === "iso") return isoToDisplayDateTime(raw, timeFormat === "12h");
    if (isRealDateTime12h(raw) || isRealDateTime(raw)) return raw;
    return isoToDisplayDateTime(raw, timeFormat === "12h") || raw;
  };

  const toStorageValue = (display: string) => {
    if (!display) return "";
    if (resolvedMode === "datetime" && valueFormat === "iso") {
      return displayDateTimeToIso(display);
    }
    return display;
  };

  const iconNode = useMemo(() => {
    if (resolvedMode === "range") return <CalendarRange size={17} className="text-gray-300" strokeWidth={1.8} />;
    if (resolvedMode === "datetime") return <Clock size={17} className="text-gray-300" strokeWidth={1.8} />;
    return <Calendar size={17} className="text-gray-300" strokeWidth={1.8} />;
  }, [resolvedMode]);

  const emitChange = (nextDisplay: string) => {
    const stored = toStorageValue(nextDisplay);
    const event = { target: { name, value: stored } };
    onChange?.(event);
    onKeyUp?.(event);
  };

  const normalizeByMode = (raw: string) => {
    if (resolvedMode === "datetime") {
      if (timeFormat === "12h") {
        // permite tipear fecha libremente; AM/PM se ajusta en picker
        return raw;
      }
      return maskDateTime(raw);
    }
    if (resolvedMode === "range") {
      const normalized = raw.replace(/\s{2,}/g, " ");
      const [left = "", right = ""] = normalized.split(" - ");
      const leftMask = maskDate(left);
      const rightMask = maskDate(right);
      if (!normalized.includes(" - ")) return leftMask;
      return `${leftMask} - ${rightMask}`;
    }
    return maskDate(raw);
  };

  const handleManualChange = (raw: string) => {
    if (readOnlyInput) return;
    const normalized = normalizeByMode(raw);
    setInputValue(normalized);
    emitChange(normalized);
  };

  const handleChangeUpdate = () => {
    const externalValue = form?.[name] ?? value ?? "";
    const display = toDisplayValue(String(externalValue ?? ""));
    setInputValue(display);
    if (resolvedMode === "datetime") {
      const parsed = parseDisplayDateTime(display) ?? parseDisplayDateTime(String(externalValue ?? ""));
      if (parsed) {
        setTempTime(
          `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`
        );
      }
    }
  };

  useEffect(() => {
    handleChangeUpdate();
  }, [name, value, form?.[name], timeFormat, valueFormat, resolvedMode]);

  useSignalEffect(() => {
    if (update) handleChangeUpdate();
  });

  const updatePickerPosition = () => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = calendarSize === "sm" ? 280 : 320;
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = top || spaceBelow < 340;
    setPickerStyle({
      position: "fixed",
      top: placeAbove ? undefined : rect.bottom + 8,
      bottom: placeAbove ? window.innerHeight - rect.top + 8 : undefined,
      left,
      zIndex: 9999,
    });
  };

  useEffect(() => {
    if (!isPickerOpen) return;
    updatePickerPosition();
    const onReposition = () => updatePickerPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [isPickerOpen, top, calendarSize]);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      if (pickerRef.current?.contains(target)) return;
      setIsPickerOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const handleValidateOnBlur = () => {
    if (resolvedMode === "date") {
      if (!inputValue) {
        setIsInvalid(false);
        return;
      }
      const valid = isRealDate(inputValue);
      setIsInvalid(!valid);
      if (!valid) {
        setInputValue("");
        emitChange("");
      }
      return;
    }
    if (resolvedMode === "datetime") {
      if (!inputValue) {
        setIsInvalid(false);
        return;
      }
      const valid =
        timeFormat === "12h"
          ? isRealDateTime12h(inputValue) || !!parseDisplayDateTime(inputValue)
          : isRealDateTime(inputValue);
      setIsInvalid(!valid);
      if (!valid) {
        setInputValue("");
        emitChange("");
      } else {
        const parsed = parseDisplayDateTime(inputValue);
        if (parsed) {
          const normalized =
            timeFormat === "12h" ? formatDateTime12h(parsed) : formatDateTime24h(parsed);
          setInputValue(normalized);
          emitChange(normalized);
        }
      }
      return;
    }
    if (!inputValue) {
      setIsInvalid(false);
      return;
    }
    const { start, end } = getRangeParts(inputValue);
    const valid = isRealDate(start) && isRealDate(end);
    setIsInvalid(!valid);
    if (!valid) {
      setInputValue("");
      emitChange("");
    }
  };

  const syncViewToInput = () => {
    const source = resolvedMode === "range" ? rangeParts.start : inputValue.split(" ")[0];
    const selected = toDateObject(source) ?? parseDisplayDateTime(inputValue);
    const base = selected ?? new Date();
    setViewMonth(base.getMonth());
    setViewYear(base.getFullYear());
  };

  const openPicker = () => {
    if (disabled) return;
    if (pickerVariant === "native") {
      const triggerPicker = (ref: React.RefObject<HTMLInputElement | null>) => {
        if (!ref.current) return;
        if (typeof ref.current.showPicker === "function") ref.current.showPicker();
        else ref.current.click();
      };
      if (resolvedMode === "date") triggerPicker(datePickerRef);
      if (resolvedMode === "datetime") triggerPicker(dateTimePickerRef);
      if (resolvedMode === "range") triggerPicker(rangeStartPickerRef);
      return;
    }
    syncViewToInput();
    if (resolvedMode === "range") {
      setRangeStep("start");
      setHoverRangeDate(null);
    }
    if (resolvedMode === "datetime") {
      const parsed = parseDisplayDateTime(inputValue);
      if (parsed) {
        setTempTime(
          `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`
        );
      } else {
        const now = new Date();
        setTempTime(
          `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
        );
      }
    }
    setIsPickerOpen(true);
    requestAnimationFrame(updatePickerPosition);
  };

  const changeMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((prev) => prev - 1);
      } else setViewMonth((prev) => prev - 1);
      return;
    }
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else setViewMonth((prev) => prev + 1);
  };

  const isDisabledByMinMax = (date: Date) => {
    const min = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : null;
    const max = maxDate ? new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()) : null;
    if (min && date < min) return true;
    if (max && date > max) return true;
    return false;
  };

  const formatDateTimeOutput = (date: Date, time24: string) => {
    const [hh, mm] = time24.split(":").map(Number);
    const next = new Date(date);
    next.setHours(hh || 0, mm || 0, 0, 0);
    return timeFormat === "12h" ? formatDateTime12h(next) : formatDateTime24h(next);
  };

  const handlePickDay = (day: number) => {
    const selectedDate = new Date(viewYear, viewMonth, day);
    if (isDisabledByMinMax(selectedDate)) return;
    const formatted = formatDate(selectedDate);
    if (resolvedMode === "date") {
      setInputValue(formatted);
      setIsInvalid(false);
      emitChange(formatted);
      setIsPickerOpen(false);
      return;
    }
    if (resolvedMode === "datetime") {
      const output = formatDateTimeOutput(selectedDate, tempTime);
      setInputValue(output);
      setIsInvalid(false);
      emitChange(output);
      return;
    }
    const { start, end } = rangeParts;
    if (rangeStep === "start") {
      const next = `${formatted} - ${end}`;
      setInputValue(next);
      setIsInvalid(false);
      emitChange(next);
      setRangeStep("end");
      setHoverRangeDate(null);
      return;
    }
    const startDate = toDateObject(start);
    let finalStart = startDate;
    let finalEnd = selectedDate;
    if (startDate && selectedDate < startDate) {
      finalStart = selectedDate;
      finalEnd = startDate;
    }
    const next = `${formatDate(finalStart ?? selectedDate)} - ${formatDate(finalEnd)}`;
    setInputValue(next);
    setIsInvalid(false);
    emitChange(next);
    if (hideOnRangeSelection) setIsPickerOpen(false);
    setRangeStep("start");
    setHoverRangeDate(null);
  };

  const handleClearValue = () => {
    setInputValue("");
    setIsInvalid(false);
    setRangeStep("start");
    setHoverRangeDate(null);
    emitChange("");
  };

  const handleTodayValue = () => {
    const today = new Date();
    if (isDisabledByMinMax(new Date(today.getFullYear(), today.getMonth(), today.getDate()))) return;
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    if (resolvedMode === "range") {
      const formatted = formatDate(today);
      const next = `${formatted} - ${formatted}`;
      setInputValue(next);
      emitChange(next);
      setIsPickerOpen(false);
      return;
    }
    if (resolvedMode === "datetime") {
      const hh = String(today.getHours()).padStart(2, "0");
      const mm = String(today.getMinutes()).padStart(2, "0");
      setTempTime(`${hh}:${mm}`);
      const next = timeFormat === "12h" ? formatDateTime12h(today) : formatDateTime24h(today);
      setInputValue(next);
      emitChange(next);
      return;
    }
    const formatted = formatDate(today);
    setInputValue(formatted);
    emitChange(formatted);
    setIsPickerOpen(false);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const dayCells = useMemo(
    () =>
      Array.from({ length: 42 }, (_, index) => {
        const day = index - firstDay + 1;
        if (day < 1 || day > daysInMonth) return null;
        return day;
      }),
    [firstDay, daysInMonth]
  );

  const selectedStart =
    toDateObject(resolvedMode === "range" ? rangeParts.start : inputValue.split(" ")[0]) ??
    parseDisplayDateTime(inputValue);
  const selectedEnd = resolvedMode === "range" ? toDateObject(rangeParts.end) : null;
  const previewEnd = resolvedMode === "range" && rangeStep === "end" && !selectedEnd ? hoverRangeDate : null;
  const labelText = (label ?? "").trim();
  const hasLabel = labelText.length > 0;
  const displayValue = resolvedMode === "date" ? getDisplayValue(inputValue) : inputValue;

  const selectDateSegmentAtCursor = (cursorPosition: number) => {
    if (resolvedMode !== "date" || readOnlyInput || disabled) return;
    const target = inputRef.current;
    if (!target) return;
    const segment =
      DATE_SEGMENTS.find(({ start, end }) => cursorPosition >= start && cursorPosition <= end) ?? DATE_SEGMENTS[0];
    target.setSelectionRange(segment.start, segment.end);
  };

  const getDateSegmentIndex = (cursorPosition: number) => {
    const index = DATE_SEGMENTS.findIndex(({ start, end }) => cursorPosition >= start && cursorPosition <= end);
    return index >= 0 ? index : 0;
  };

  const getDateSegments = (valueToRead: string) =>
    DATE_SEGMENTS.map(({ start, end }, index) =>
      onlyDigits(valueToRead.slice(start, end)).slice(0, DATE_SEGMENT_LENGTHS[index])
    );

  const focusDateSegmentByIndex = (segmentIndex: number, selectAll = true) => {
    const target = inputRef.current;
    if (!target) return;
    const safeIndex = Math.min(Math.max(segmentIndex, 0), DATE_SEGMENTS.length - 1);
    const segment = DATE_SEGMENTS[safeIndex];
    target.setSelectionRange(selectAll ? segment.start : segment.start, selectAll ? segment.end : segment.start);
  };

  const handleDateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (resolvedMode !== "date" || readOnlyInput || disabled) return;
    const target = event.currentTarget;
    const selectionStart = target.selectionStart ?? 0;
    const selectionEnd = target.selectionEnd ?? selectionStart;
    const segmentIndex = getDateSegmentIndex(selectionStart);
    const segment = DATE_SEGMENTS[segmentIndex];
    const maxLength = DATE_SEGMENT_LENGTHS[segmentIndex];
    const isWholeSegmentSelected = selectionStart === segment.start && selectionEnd === segment.end;

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      const segments = getDateSegments(displayValue);
      const current = isWholeSegmentSelected ? "" : segments[segmentIndex];
      const nextSegmentValue = `${current}${event.key}`.slice(0, maxLength);
      segments[segmentIndex] = nextSegmentValue;
      const nextValue = maskDate(segments.join(""));
      setInputValue(nextValue);
      setIsInvalid(false);
      emitChange(nextValue);
      requestAnimationFrame(() => {
        if (nextSegmentValue.length >= maxLength && segmentIndex < DATE_SEGMENTS.length - 1) {
          focusDateSegmentByIndex(segmentIndex + 1, true);
        } else {
          const cursor = segment.start + nextSegmentValue.length;
          target.setSelectionRange(cursor, cursor);
        }
      });
      return;
    }
    if (event.key === "Backspace") {
      event.preventDefault();
      const segments = getDateSegments(displayValue);
      const current = segments[segmentIndex];
      segments[segmentIndex] = isWholeSegmentSelected ? "" : current.slice(0, -1);
      const nextValue = maskDate(segments.join(""));
      setInputValue(nextValue);
      setIsInvalid(false);
      emitChange(nextValue);
      requestAnimationFrame(() => focusDateSegmentByIndex(segmentIndex, true));
      return;
    }
    if (event.key === "/" || event.key === "." || event.key === "-") {
      event.preventDefault();
      requestAnimationFrame(() => focusDateSegmentByIndex(segmentIndex + 1, true));
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      requestAnimationFrame(() => focusDateSegmentByIndex(segmentIndex - 1, true));
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      requestAnimationFrame(() => focusDateSegmentByIndex(segmentIndex + 1, true));
    }
  };

  const handleNativeDateChange = (next: string) => {
    setInputValue(next);
    setIsInvalid(false);
    emitChange(next);
  };
  const handleNativeDateTimeChange = (next: string) => {
    setInputValue(next);
    setIsInvalid(false);
    emitChange(next);
  };
  const handleNativeRangeStartChange = (start: string) => {
    const next = `${start}${rangeParts.end ? ` - ${rangeParts.end}` : " - "}`;
    setInputValue(next);
    setIsInvalid(false);
    emitChange(next);
  };
  const handleNativeRangeEndChange = (end: string) => {
    const next = `${rangeParts.start} - ${end}`;
    setInputValue(next);
    setIsInvalid(false);
    emitChange(next);
  };

  const calendarNode =
    allowPicker && pickerVariant === "custom" && isPickerOpen ? (
      <div ref={pickerRef} style={usePortal ? pickerStyle : undefined} className={usePortal ? "" : `absolute left-0 z-50 ${top ? "-top-72" : ""}`}>
        <CalendarPicker
          locale={locale}
          calendarSize={calendarSize}
          viewMonth={viewMonth}
          viewYear={viewYear}
          dayCells={dayCells}
          selectedStart={selectedStart}
          selectedEnd={selectedEnd}
          previewEnd={previewEnd}
          rangeStep={rangeStep}
          resolvedMode={resolvedMode}
          showButtonBar={showButtonBar}
          hideOnRangeSelection={hideOnRangeSelection}
          rangeStartBgColor={rangeStartBgColor}
          rangeStartTextColor={rangeStartTextColor}
          rangeFillBgColor={rangeFillBgColor}
          rangeFillTextColor={rangeFillTextColor}
          showTime={showTime || resolvedMode === "datetime"}
          tempTime={tempTime}
          timeFormat={timeFormat}
          minDate={minDate}
          maxDate={maxDate}
          onPreviousMonth={() => changeMonth("prev")}
          onNextMonth={() => changeMonth("next")}
          onPickDay={handlePickDay}
          onHoverRangeDate={setHoverRangeDate}
          onToday={handleTodayValue}
          onClear={handleClearValue}
          onTimeChange={(newTime) => {
            setTempTime(newTime);
            const dateOnly = inputValue.split(" ")[0];
            const baseDate = toDateObject(dateOnly) ?? new Date(viewYear, viewMonth, selectedStart?.getDate() ?? new Date().getDate());
            if (baseDate) {
              const next = formatDateTimeOutput(baseDate, newTime);
              setInputValue(next);
              emitChange(next);
            }
          }}
        />
      </div>
    ) : null;

  return (
    <div className={`${styleContainer} relative`} ref={wrapperRef}>
      <div className={className} style={style}>
        {hasLabel && (
          <label className="mt-3.5 flex items-center pb-1.5 text-[11px] font-extrabold uppercase text-text-color">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <div className={`pointer-events-none absolute inset-y-0 left-5 flex items-center ${iconClassName}`}>{iconNode}</div>
          <input
            id={name}
            ref={inputRef}
            type="text"
            name={name}
            value={displayValue}
            disabled={disabled}
            onChange={(event) => handleManualChange(event.target.value)}
            onKeyDown={handleDateKeyDown}
            onFocus={() => {
              if (resolvedMode !== "date" || readOnlyInput || disabled) return;
              const firstSlot = displayValue.search(/[dma]/);
              const fallbackSegment = DATE_SEGMENTS[0];
              const targetPosition = firstSlot >= 0 ? firstSlot : fallbackSegment.start;
              requestAnimationFrame(() => selectDateSegmentAtCursor(targetPosition));
            }}
            onClick={(event) => {
              if (resolvedMode !== "date" || readOnlyInput || disabled) return;
              const position = event.currentTarget.selectionStart ?? 0;
              requestAnimationFrame(() => selectDateSegmentAtCursor(position));
            }}
            onBlur={handleValidateOnBlur}
            placeholder={resolvedPlaceholder}
            autoComplete="off"
            readOnly={readOnlyInput}
            className={`${disabled ? "cursor-not-allowed bg-[#ebeff4]" : ""} ${
              isInvalid ? "border-red-500" : "border-slate-100"
            } w-full! appearance-none rounded-2xl border bg-slate-50 px-2 py-2.5 pl-14 pr-10 text-[14px] leading-tight text-text-color transition-all placeholder:text-[13px] placeholder:font-medium placeholder:tracking-wide placeholder:text-slate-300 focus:border-[#6DACCB]/50 focus:border-input-primary-color focus:ring-2 focus:ring-[#6DACCB]/10 focus:outline-none ${classNameInput}`}
          />
          {allowPicker && showIcon && (
            <button
              type="button"
              onClick={openPicker}
              disabled={disabled}
              className="absolute inset-y-0 right-3 flex items-center text-slate-300 transition-colors hover:text-slate-500 disabled:opacity-50"
            >
              <Calendar size={17} />
            </button>
          )}
        </div>

        {usePortal && calendarNode ? createPortal(calendarNode, document.body) : calendarNode}

        {allowPicker && pickerVariant === "native" && (
          <NativePickers
            resolvedMode={resolvedMode}
            inputValue={inputValue}
            rangeStart={rangeParts.start}
            rangeEnd={rangeParts.end}
            rangeStartPickerRef={rangeStartPickerRef}
            rangeEndPickerRef={rangeEndPickerRef}
            datePickerRef={datePickerRef}
            dateTimePickerRef={dateTimePickerRef}
            onDateChange={handleNativeDateChange}
            onDateTimeChange={handleNativeDateTimeChange}
            onRangeStartChange={handleNativeRangeStartChange}
            onRangeEndChange={handleNativeRangeEndChange}
          />
        )}
      </div>
    </div>
  );
};
