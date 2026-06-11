import { useState } from "react";
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

interface DateRangePickerProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

const DatePicker = ({ date, setDate }: any) => {
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
          {date?.to ? (
            <>{format(date.to, "LLL dd, y")}</>
          ) : (
            <span>Pick a date</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          initialFocus
          mode="single"
          defaultMonth={date?.to}
          selected={date?.to}
          onSelect={(value) => setDate({ from: value, to: value })}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  );
};

export { DatePicker };
