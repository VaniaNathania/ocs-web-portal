import { useState } from "react";
import { Controller, Control, FieldError, FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface DateTimePickerFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: keyof T;
  label: string;
  error?: FieldError;
  disabled?: boolean;
  yearRange?: { start: number; end: number };
}

function formatToYMDHMS(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function DateTimePickerField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  disabled = false,
  yearRange = { start: 1900, end: 2100 },
}: DateTimePickerFieldProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <Label>
        {label}
        <span className="text-red-500">*</span>
      </Label>
      <Controller
        control={control}
        name={name as any}
        render={({ field }) => {
          const currentDate = field.value
            ? new Date(field.value.replace(" ", "T"))
            : undefined;

          const [open, setOpen] = useState(false);
          const [viewYear, setViewYear] = useState(
            currentDate ? currentDate.getFullYear() : new Date().getFullYear()
          );
          const [viewMonth, setViewMonth] = useState(
            currentDate ? currentDate.getMonth() : new Date().getMonth()
          );
          const [time, setTime] = useState(
            currentDate ? currentDate.toTimeString().slice(0, 8) : "00:00:00"
          );

          const years = [];
          for (let y = yearRange.end; y >= yearRange.start; y--) {
            years.push(y);
          }

          const handleDateClick = (day: number) => {
            const [h, m, s] = time.split(":").map(Number);
            const newDate = new Date(viewYear, viewMonth, day, h, m, s);
            field.onChange(formatToYMDHMS(newDate));
            setOpen(false);
          };

          const daysInMonth = getDaysInMonth(viewYear, viewMonth);
          const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
          const days = [];

          for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} />);
          }

          for (let day = 1; day <= daysInMonth; day++) {
            const isSelected =
              currentDate &&
              currentDate.getDate() === day &&
              currentDate.getMonth() === viewMonth &&
              currentDate.getFullYear() === viewYear;

            days.push(
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`h-8 w-8 text-sm rounded-md hover:bg-gray-100 ${
                  isSelected ? "bg-blue-500 text-white hover:bg-blue-600" : ""
                }`}
                disabled={disabled}
              >
                {day}
              </button>
            );
          }

          return (
            <div className="flex gap-2 flex-wrap">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-40 justify-between font-normal"
                    disabled={disabled}
                  >
                    {currentDate
                      ? currentDate.toLocaleDateString()
                      : "Select date"}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        if (viewMonth === 0) {
                          setViewMonth(11);
                          setViewYear(viewYear - 1);
                        } else {
                          setViewMonth(viewMonth - 1);
                        }
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex gap-1">
                      <Select
                        value={viewMonth.toString()}
                        onValueChange={(val) => setViewMonth(Number(val))}
                      >
                        <SelectTrigger className="h-7 w-20 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((month, idx) => (
                            <SelectItem key={idx} value={idx.toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={viewYear.toString()}
                        onValueChange={(val) => setViewYear(Number(val))}
                      >
                        <SelectTrigger className="h-7 w-20 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        if (viewMonth === 11) {
                          setViewMonth(0);
                          setViewYear(viewYear + 1);
                        } else {
                          setViewMonth(viewMonth + 1);
                        }
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div key={day} className="text-gray-500 font-medium">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">{days}</div>
                </PopoverContent>
              </Popover>

              <Input
                type="time"
                step="1"
                className="w-32"
                value={time}
                onChange={(e) => {
                  const val = e.target.value;
                  setTime(val);
                  if (currentDate) {
                    const [h, m, s] = val.split(":").map(Number);
                    const newDate = new Date(currentDate);
                    newDate.setHours(h, m, s);
                    field.onChange(formatToYMDHMS(newDate));
                  }
                }}
                disabled={disabled}
              />
            </div>
          );
        }}
      />
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
