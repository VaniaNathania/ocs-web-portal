import React, { useState } from "react";
import { KeenIcon } from "@/components";
import RegularExpressionDialog from "../all-feature-content/blocks/RegularExpressionDialog";
import { Button } from "@/components/ui/button";

interface TextNumberFieldsProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isEditingMode: boolean;
}

const TextNumberFields: React.FC<TextNumberFieldsProps> = ({ formData, onChange, isEditingMode }) => {
  const [showRegularExpression, setShowRegularExpression] = useState(false);

  const handleShowRegularExpression = () => {
    setShowRegularExpression(true);
  };

  const handleSaveRegularExpression = () => {
    // console.log("KUKURUYUK");
  };
  return (
    <>
      {/* Row 9 - Default Value & Text Editable*/}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Default Value:</span>
          {isEditingMode ? (
            <input
              type="number"
              name="attrRequest.baseAttrDto.defaultValue"
              value={formData.attrRequest.baseAttrDto.defaultValue ?? ""}
              onChange={onChange}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder=""
              min={0}
              step={1}
              autoComplete="off"
            />
          ) : (
            <span className="text-sm font-medium text-gray-800">{formData.attrRequest?.baseAttrDto?.defaultValue ?? "--"}</span>
          )}
        </div>
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">{isEditingMode && <span className="text-red-500">*</span>}Text Editable:</span>
          {isEditingMode ? (
            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.baseAttrDto.textAttrDto.editable" value="Y" checked={formData.attrRequest.baseAttrDto.textAttrDto.editable === "Y"} onChange={onChange} className="mr-1" required />
                Yes
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="attrRequest.baseAttrDto.textAttrDto.editable" value="N" checked={formData.attrRequest.baseAttrDto.textAttrDto.editable === "N"} onChange={onChange} className="mr-1" />
                No
              </label>
            </div>
          ) : (
            <div>{formData.editable === "Y" ? <KeenIcon icon="check-circle" className="text-green-500 text-sm" /> : <KeenIcon icon="cross-circle" className="text-zinc-500 text-sm" />}</div>
          )}
        </div>
      </div>

      {/* Row 10 - Minimum Value & Maximum Value*/}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Minimum Value:</span>
          {isEditingMode ? (
            <input
              type="number"
              name="attrRequest.baseAttrDto.textAttrDto.minValue"
              value={formData.attrRequest.baseAttrDto.textAttrDto.minValue || ""}
              onChange={onChange}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder=""
              min={0}
              step={1}
              autoComplete="off"
            />
          ) : (
            <span className="text-sm font-medium text-gray-800">{formData.minValue || "--"}</span>
          )}
        </div>
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Maximum Value:</span>
          {isEditingMode ? (
            <input
              type="number"
              name="attrRequest.baseAttrDto.textAttrDto.maxValue"
              value={formData.attrRequest.baseAttrDto.textAttrDto.maxValue || ""}
              onChange={onChange}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder=""
              min={0}
              step={1}
              autoComplete="off"
            />
          ) : (
            <span className="text-sm font-medium text-gray-800">{formData.maxValue || "--"}</span>
          )}
        </div>
      </div>

      {/* Row 11 - Error Message & Check Rule*/}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">{isEditingMode && <span className="text-red-500">*</span>}Error Message:</span>
          {isEditingMode ? (
            <input
              type="text"
              name="attrRequest.baseAttrDto.textAttrDto.exceptionMessage"
              value={formData.attrRequest.baseAttrDto.textAttrDto.exceptionMessage || ""}
              onChange={onChange}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder=""
              required
              autoComplete="off"
            />
          ) : (
            <span className="text-sm font-medium text-gray-800">{formData.exceptionMessage || "--"}</span>
          )}
        </div>
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Check Rule:</span>
          {isEditingMode ? (
            <input
              type="text"
              name="attrRequest.baseAttrDto.textAttrDto.ruleScript"
              value={formData.attrRequest.baseAttrDto.textAttrDto.ruleScript || ""}
              onChange={onChange}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder=""
              autoComplete="off"
            />
          ) : (
            <span className="text-sm font-medium text-gray-800">{formData.ruleScript || "--"}</span>
          )}
        </div>
      </div>

      {/* Row 12 - Regular Expression & Data Type */}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Regular Expression:</span>
          {isEditingMode ? (
            <div className="flex flex-row">
              <input
                type="text"
                name="attrRequest.baseAttrDto.textAttrDto.mask"
                value={formData.attrRequest.baseAttrDto.textAttrDto.mask || ""}
                onChange={onChange}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                placeholder=""
                autoComplete="off"
              />
              <Button type="button" variant={"outline"} className="text-blue-700" size={"sm"} onClick={() => handleShowRegularExpression()}>
                Test
              </Button>
            </div>
          ) : (
            <span className="text-sm font-medium text-gray-800">{formData.mask ?? "--"}</span>
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
              value={formData.attrRequest.baseAttrDto.comments ?? ""}
              onChange={onChange}
              rows={2}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder=""
              autoComplete="off"
            />
          ) : (
            <span className="text-sm font-medium text-gray-800">{formData.comments ?? "--"}</span>
          )}
        </div>
      </div>

      <RegularExpressionDialog isOpen={showRegularExpression} onClose={() => setShowRegularExpression(false)} onSave={handleSaveRegularExpression} />
    </>
  );
};

export default TextNumberFields;
