import React, { useState } from "react";
import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import RegularExpressionDialog from "../all-feature-content/blocks/RegularExpressionDialog";

interface AttachmentFieldsProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isEditingMode: boolean;
}

const AttachmentFields: React.FC<AttachmentFieldsProps> = ({ formData, onChange, isEditingMode }) => {
  const [showRegularExpression, setShowRegularExpression] = useState(false);

  const handleShowRegularExpression = () => {
    setShowRegularExpression(true);
  };

  const handleSaveRegularExpression = () => {
    // console.log("KUKURUYUK");
  };
  return (
    <>
      {/* Row 11 - Regular Expression */}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Default Date:</span>
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
            <span className="text-sm font-medium text-gray-800">{formData.defaultDate || "--"}</span>
          )}
        </div>
      </div>

      {/* Row 13 - Remarks */}
      <div className="grid grid-cols-1 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Remarks:</span>
          {isEditingMode ? (
            <textarea
              name="attrRequest.baseAttrDto.textAttrDto.comments"
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

      <RegularExpressionDialog isOpen={showRegularExpression} onClose={() => setShowRegularExpression(false)} onSave={handleSaveRegularExpression} />
    </>
  );
};

export default AttachmentFields;
