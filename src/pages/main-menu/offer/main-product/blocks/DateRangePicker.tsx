import { useCallback, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { KeenIcon } from "@/components/keenicons";
import { cn } from "@/utils/cn";
import moment from "moment";
import { toast } from "sonner";

interface DateRangePickerProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

function getDateRangeLength(startDate: Date, endDate: Date) {
  const start = moment(startDate);
  const end = moment(endDate);

  return end.diff(start, "days") + 1;
}

const DateRangePicker = ({ date, setDate }: DateRangePickerProps) => {
  const handleSelectDate = useCallback(
    (date: DateRange | undefined) => {
      if (date && date.from && date.to) {
        const dateRange = getDateRangeLength(date.from, date.to);
        // if (dateRange > 14 && interval == 'day') {
        //   toast.error('Maximal days of range is 14 days');
        // } else {
        //   setDate(date);
        // }
        setDate(date);
      } else {
        setDate(date);
      }
    },
    [setDate]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          id="date"
          className={cn(
            "btn btn-sm btn-light data-[state=open]:bg-light-active",
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
          onSelect={handleSelectDate}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};

export { DateRangePicker };
