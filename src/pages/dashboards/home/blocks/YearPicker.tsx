import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { get5LastYear } from '@/utils/Date';

interface YearPickerProps {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}

// Komponen YearPicker
const YearPicker = ({ selectedYear, setSelectedYear }: YearPickerProps) => {
  const selectYear = get5LastYear();

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  return (
    <div className="flex gap-3">
      <Select value={selectedYear} onValueChange={handleYearChange}>
        <SelectTrigger size="sm" className="w-28">
          <SelectValue placeholder="Pilih Tahun" />
        </SelectTrigger>
        <SelectContent>
          {selectYear.length > 0 ? (
            selectYear.map((year, index) => (
              <SelectItem key={index} value={year}>
                {year}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-data" disabled>
              No data available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export { YearPicker };
