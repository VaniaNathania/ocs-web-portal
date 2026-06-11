import { useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { KeenIcon } from "@/components/keenicons";
import { cn } from "@/utils/cn";

interface DateRangePickerProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

const DateRangePicker = ({ date, setDate }: DateRangePickerProps) => {
  useEffect(() => {
    if (!date) {
      const today = new Date();
      const last30Days = subDays(today, 30);
      setDate({ from: last30Days, to: today });
    }
  }, [date, setDate]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          id="date"
          className={cn(
            "btn btn-sm btn-light data-[state=open]:bg-light-active w-full",
            !date && "text-gray-400"
          )}
        >
          <KeenIcon icon="calendar" className="me-0.5" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};

export { DateRangePicker };
