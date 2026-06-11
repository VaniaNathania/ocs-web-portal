import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ValidationRegularExpression from "./ValidationRegularExpression.tsx";

interface RegularExpressionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RegularExpressionData) => void;
}

interface RegularExpressionData {
  mask: string | null;
  testText: string | null;
}

const RegularExpressionDialog: React.FC<RegularExpressionDialogProps> = ({ isOpen, onClose, onSave }) => {
  const initialFormData: RegularExpressionData = {
    mask: null,
    testText: null,
  };

  const [formData, setFormData] = useState<RegularExpressionData>(initialFormData);

  const [isValidateOpen, setIsValidateOpen] = useState(false);
  const isNotMatch = formData.mask !== formData.testText;

  const handleInputChange = (field: keyof RegularExpressionData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleValidate = () => {
    setIsValidateOpen(true);
  };

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
    }
  }, [isOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg p-0">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <DialogTitle className="text-lg font-medium text-gray-800">Rule Script</DialogTitle>
            <button onClick={onClose} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600" />
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4">
            {/* Regular Expression */}
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <Label htmlFor="mask" className="text-sm text-gray-700 text-right">
                <span className="text-red-500">*</span> Regular Expression
              </Label>
              <Input id="mask" value={formData.mask ?? ""} onChange={(e) => handleInputChange("mask", e.target.value)} className="h-9 border-gray-300" autoComplete="off" />
            </div>

            {/* Test Text */}
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <Label htmlFor="value" className="text-sm text-gray-700 text-right">
                <span className="text-red-500">*</span> Test Text
              </Label>
              <Input id="testText" value={formData.testText ?? ""} onChange={(e) => handleInputChange("testText", e.target.value)} className="h-9 border-gray-300" autoComplete="off" />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
            <Button variant="outline" onClick={onClose} className="px-6 h-9 border-gray-300 text-gray-700">
              Cancel
            </Button>
            <Button onClick={handleValidate} className="px-6 h-9 bg-blue-600 hover:bg-blue-700 text-white">
              Test
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ValidationRegularExpression isOpen={isValidateOpen} onClose={() => setIsValidateOpen(false)} isNotMatch={isNotMatch} />;
    </>
  );
};

export default RegularExpressionDialog;
