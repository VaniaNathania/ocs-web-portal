import React from "react";
import { KeenIcon } from "@/components";

interface DateSelectorFieldsProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isEditingMode: boolean;
}

const DateSelectorFields: React.FC<DateSelectorFieldsProps> = ({ formData, onChange, isEditingMode }) => {
  return (
    <>
      {/* Row 11 - Default Date */}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Default Date:</span>
          {isEditingMode ? (
            <input
              type="date"
              name="attrRequest.baseAttrDto.defaultDate"
              value={formData.attrRequest.baseAttrDto.defaultDate || ""}
              onChange={onChange}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder=""
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
              name="attrRequest.baseAttrDto.textAttreDto.comments" 
              value={formData.attrRequest.baseAttrDto.textAttrDto.comments || ""} 
              onChange={onChange} 
              rows={2} 
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" 
              placeholder="" 
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

export default DateSelectorFields;