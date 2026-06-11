import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { KeenIcon } from "@/components/keenicons";
import { cn } from "@/utils/cn";

interface DatePickerProps {
  date?: Date | undefined;
  setDate: (date: Date) => void;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  className?: string;
  disabled?: boolean; // Tambahkan disabled prop
}

const DatePicker = ({
  date,
  setDate,
  value,
  onChange,
  className,
  disabled = false, // Default value false
}: DatePickerProps) => {
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && !disabled) {
      setDate(selectedDate);
      if (onChange) {
        onChange({ target: { value: format(selectedDate, "yyyy-MM-dd") } });
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 text-left border rounded-md",
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-50 cursor-pointer",
            className
          )}
          disabled={disabled}
        >
          <span>
            {value || (date ? format(date, "yyyy-MM-dd") : "Select Date")}
          </span>
          <KeenIcon icon="calendar" className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          disabled={disabled} // Pass disabled ke Calendar component
        />
      </PopoverContent>
    </Popover>
  );
};

export { DatePicker };
