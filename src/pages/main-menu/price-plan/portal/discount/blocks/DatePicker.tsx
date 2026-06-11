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
  date?: Date;
  setDate: (date: Date) => void;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  className?: string; // Tambahkan className sebagai props
}

const DatePicker = ({
  date = new Date(),
  setDate,
  value,
  onChange,
  className,
}: DatePickerProps) => {
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
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
            "btn btn-sm btn-light data-[state=open]:bg-light-active w-full",
            !date && "text-gray-400",
            className // Terapkan className di sini
          )}
        >
          <KeenIcon icon="calendar" className="me-0.5 mb-0.5 text-info" />
          {value || (date ? format(date, "yyyy-MM-dd") : "Pilih Tanggal")}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          defaultMonth={date}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  );
};

export { DatePicker };
