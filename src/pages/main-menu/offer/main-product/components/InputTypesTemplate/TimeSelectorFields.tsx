import React from "react";
import { KeenIcon } from "@/components";

interface TimeSelectorFieldsProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isEditingMode: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");

const formatTime = (value: string) => {
  if (!value) return "";
  const parts = value.split(":");
  const hh = parts[0] || "00";
  const mm = parts[1] || "00";
  const ss = parts[2] || "00";
  return `${pad(+hh)}:${pad(+mm)}:${pad(+ss)}`;
};

const TimeSelectorFields: React.FC<TimeSelectorFieldsProps> = ({ formData, onChange, isEditingMode }) => {
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value; // "HH:mm" atau "HH:mm:ss"
    const formattedValue = formatTime(rawValue); // Simpan "HH:mm:ss"

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
      {/* Row 11 - Default Time */}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Default Time:</span>
          {isEditingMode ? (
            <input
              type="time"
              name="attrRequest.baseAttrDto.defaultValue"
              value={formData.attrRequest.baseAttrDto.defaultValue || ""}
              onChange={handleTimeChange}
              step="1" // supaya bisa pilih detik
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="Format: hh:ii:ss"
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
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              autoComplete="off"
            />
          ) : (
            <span className="text-sm font-medium text-gray-800">{formData.comments || "--"}</span>
          )}
        </div>
      </div>
    </>
  );
};

export default TimeSelectorFields;
