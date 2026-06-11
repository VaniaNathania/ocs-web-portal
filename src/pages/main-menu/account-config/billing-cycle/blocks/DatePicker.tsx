// DatePicker.tsx
import React from "react";
import { Input } from "@/components/ui/input";

interface DatePickerProps {
  selected?: string | null;
  onSelect: (date: string | null) => void;
  disabled?: {
    before?: Date;
  };
}

const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onSelect,
  disabled,
}) => {
  return (
    <Input
      type="date"
      className="mt-1"
      value={selected ? new Date(selected).toISOString().split("T")[0] : ""}
      onChange={(e) => {
        if (e.target.value) {
          // Konversi ke ISO format dengan timestamp
          const date = new Date(e.target.value);
          onSelect(date.toISOString());
        } else {
          onSelect(null);
        }
      }}
      min={
        disabled?.before ? new Date().toISOString().split("T")[0] : undefined
      }
    />
  );
};

export default DatePicker;
