import React from "react";
import { KeenIcon } from "@/components";

interface DataTimeSelecotrFieldsProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isEditingMode: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");

// Format "2025-08-14T17:05:30" → "2025-08-14 17:05:30"
const formatDisplay = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const toInputValue = (displayValue: string) => displayValue.replace(" ", "T");

const DataTimeSelecotrFields: React.FC<DataTimeSelecotrFieldsProps> = ({ formData, onChange, isEditingMode }) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value; // HTML format: "2025-08-14T17:05:30"
    const formattedValue = formatDisplay(rawValue); // Simpan sebagai "2025-08-14 17:05:30"

    // Trigger onChange seperti biasa
    onChange({
      ...e,
      target: {
        ...e.target,
        name: e.target.name,
        value: formattedValue,
      },
    });
  };

  return (
    <>
      {/* Row 11 - Default Date */}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Default Date:</span>
          {isEditingMode ? (
            <input
              type="datetime-local"
              name="attrRequest.baseAttrDto.defaultValue"
              value={formData.attrRequest.baseAttrDto.defaultValue ? toInputValue(formData.attrRequest.baseAttrDto.defaultValue) : ""}
              onChange={handleDateChange}
              step="1"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="Format: yyyy-mm-dd hh:mm:ss"
              autoComplete="off"
            />
          ) : (
            <span className="text-sm font-medium text-gray-800">{formData.defaultValue || "--"}</span>
          )}
        </div>
      </div>

      {/* Row 13 - Remarks */}
      <div className="grid grid-cols-1 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Remarks:</span>
          {isEditingMode ? (
            <textarea
              name="attrRequest.baseAttrDto.comments"
              value={formData.attrRequest.baseAttrDto.comments || ""}
              onChange={onChange}
              rows={2}
              autoComplete="off"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder=""
            />
          ) : (
            <span className="text-sm font-medium text-gray-800">{formData.comments || "--"}</span>
          )}
        </div>
      </div>
    </>
  );
};

export default DataTimeSelecotrFields;
