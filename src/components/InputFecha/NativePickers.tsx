import type { NativePickersProps } from "./types";
import { getNativeDateTimeValue, getNativeDateValue, isRealDate } from "./utils";

export const NativePickers = ({
  resolvedMode,
  inputValue,
  rangeStart,
  rangeEnd,
  rangeStartPickerRef,
  rangeEndPickerRef,
  datePickerRef,
  dateTimePickerRef,
  onDateChange,
  onDateTimeChange,
  onRangeStartChange,
  onRangeEndChange,
}: NativePickersProps) => {
  return (
    <>
      <input
        ref={datePickerRef}
        type="date"
        tabIndex={-1}
        className="absolute opacity-0 pointer-events-none"
        value={getNativeDateValue(inputValue.split(" ")[0] || "")}
        onChange={(event) => {
          if (resolvedMode !== "date") return;

          const value = event.target.value;

          if (!value) {
            onDateChange("");
            return;
          }

          const [yyyy, mm, dd] = value.split("-");

          onDateChange(`${dd}/${mm}/${yyyy}`);
        }}
      />

      <input
        ref={dateTimePickerRef}
        type="datetime-local"
        tabIndex={-1}
        className="absolute opacity-0 pointer-events-none"
        value={getNativeDateTimeValue(inputValue)}
        onChange={(event) => {
          if (resolvedMode !== "datetime") return;

          const value = event.target.value;

          if (!value) {
            onDateTimeChange("");
            return;
          }

          const [datePart, timePart] = value.split("T");

          const [yyyy, mm, dd] = datePart.split("-");

          onDateTimeChange(`${dd}/${mm}/${yyyy} ${timePart.slice(0, 5)}`);
        }}
      />

      <input
        ref={rangeStartPickerRef}
        type="date"
        tabIndex={-1}
        className="absolute opacity-0 pointer-events-none"
        value={getNativeDateValue(rangeStart)}
        onChange={(event) => {
          if (resolvedMode !== "range") return;

          const value = event.target.value;

          if (!value) return;

          const [yyyy, mm, dd] = value.split("-");

          onRangeStartChange(`${dd}/${mm}/${yyyy}`);
        }}
      />

      <input
        ref={rangeEndPickerRef}
        type="date"
        tabIndex={-1}
        className="absolute opacity-0 pointer-events-none"
        min={isRealDate(rangeStart) ? getNativeDateValue(rangeStart) : undefined}
        value={getNativeDateValue(rangeEnd)}
        onChange={(event) => {
          if (resolvedMode !== "range") return;

          const value = event.target.value;

          if (!value) return;

          const [yyyy, mm, dd] = value.split("-");

          onRangeEndChange(`${dd}/${mm}/${yyyy}`);
        }}
      />
    </>
  );
};
