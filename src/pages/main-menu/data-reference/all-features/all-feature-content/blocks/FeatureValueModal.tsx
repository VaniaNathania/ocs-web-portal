import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import AddShowFeatureDialog from "./AddShowFeatureDialog";
import AddFilterFeatureDialog from "./AddFilterFeatureDialog";
import { FormDataSingleChoice } from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/SingleChoiceField";
import { toast } from "sonner";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";

interface FeatureValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormDataSingleChoice) => void;
  offerId: string;
  initialData?: any | null;
  mode: "add" | "edit";
  baseAttrId: number | null;
}

const API_URL_OFFER = apiConfigOffer.offer;

const FeatureValueModal: React.FC<FeatureValueModalProps> = ({
  isOpen,
  onClose,
  onSave,
  offerId,
  initialData,
  mode,
  baseAttrId,
}) => {
  const initialFormData: FormDataSingleChoice = {
    baseAttrId: null,
    attrValueId: null,
    valueMark: null,
    value: null,
    parentAttrValueId: null,
    parentAttrId: null,
    spId: 0,
    attrDriverList: [],
    attrValueLinkageList: [],
    defaultValue: null,
    updateDefaultFlag: false,
  };

  const { PutData, PostData } = useCallApi();

  const [formData, setFormData] =
    useState<FormDataSingleChoice>(initialFormData);
  const [isAddShowFeatureDialogOpen, setIsAddShowFeatureDialogOpen] =
    useState(false);
  const [isAddFilterFeatureDialogOpen, setIsAddFilterFeatureDialogOpen] =
    useState(false);

  useEffect(() => {
    if (isOpen) {
      // console.log("DEBUG baseAttrId props:", baseAttrId);
      // console.log("DEBUG initialData:", initialData);

      setFormData({
        ...initialFormData,
        ...(initialData ?? {}),
        baseAttrId: baseAttrId,
      });
    }
  }, [isOpen, initialData, baseAttrId]);

  const showFeatureText =
    formData?.attrDriverList &&
    formData.attrDriverList.some((adl) => adl.objAttrName)
      ? formData.attrDriverList.map((adl) => `[${adl.objAttrName}]`).join(", ")
      : initialData?.strAttrDriverList || "";

  const showFilterText =
    formData?.attrValueLinkageList &&
    formData.attrValueLinkageList.some((avl) => avl?.id.attrName)
      ? formData.attrValueLinkageList
          .map((avl) => `[${avl.id.attrName}]`)
          .join(", ")
      : initialData?.strAttrValueLinkageList || "";

  const handleInputChange = (
    field: keyof FormDataSingleChoice,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleShowFeature = useCallback((open: boolean) => {
    setIsAddShowFeatureDialogOpen(open);
  }, []);

  const handleFilterFeature = useCallback((open: boolean) => {
    setIsAddFilterFeatureDialogOpen(open);
  }, []);

  const handleAddShowFeature = useCallback((selectedFeatures: any[]) => {
    const newDriverList = selectedFeatures.map((feature) => ({
      attrDriverId: null,
      orgAttrId: null,
      orgAttrValueId: null,
      objAttrId: feature.attrId || feature.baseAttrId,
      objAttrName: feature.attrName,
      spId: 0,
    }));

    // console.log("🚀 [handleAddShowFeature] Payload attrDriverList:", newDriverList);

    setFormData((prev) => ({
      ...prev,
      attrDriverList: newDriverList,
    }));

    setIsAddShowFeatureDialogOpen(false);
  }, []);

  useEffect(() => {
    //  console.log(formData, "FormData");
  }, [formData]);

  const handleAddFilterFeature = useCallback((selectedFeatures: any[]) => {
    const newValueLinkageList = selectedFeatures.map((feature, index) => ({
      id: {
        baseAttrId: feature.attrId || feature.baseAttrId,
        attrValueId: index + 1,
        parentAttrId: null,
        parentAttrValueId: null,
        attrName: feature.attrName,
      },
      spId: 0,
      defaultFlag: null,
    }));

    // console.log("🚀 [handleAddFilterFeature] Payload attrValueLinkageList:", newValueLinkageList);

    setFormData((prev) => ({
      ...prev,
      attrValueLinkageList: newValueLinkageList,
    }));

    setIsAddShowFeatureDialogOpen(false);
  }, []);

  const handleSave = async () => {
    if (!(formData.valueMark ?? "").trim()) {
      toast.error("Value Name is required!");
      return;
    }
    if (!(formData.value ?? "").trim()) {
      toast.error("Value is required!");
      return;
    }
    if (!(formData.defaultValue ?? "").trim()) {
      toast.error("Is Default is required!");
      return;
    }

    try {
      if (mode === "edit") {
        if (formData.attrValueId) {
          const response = await PutData(
            `${API_URL_OFFER}/offer/attr/mod-attr-value`,
            formData,
          );
          if (response?.status) {
            toast.success("Update Feature Successfully!");
            onSave(formData);
            onClose();
          } else {
            toast.error("Failed to update feature");
          }
        }
      } else {
        onSave(formData);
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
      console.error(err);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg p-0">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <DialogTitle className="text-lg font-medium text-gray-800">
              Feature Value
            </DialogTitle>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
            />
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4">
            {/* Value Name */}
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <Label
                htmlFor="valueName"
                className="text-sm text-gray-700 text-right"
              >
                <span className="text-red-500">*</span> Value Name
              </Label>
              <Input
                id="valueName"
                value={formData.valueMark ?? ""}
                onChange={(e) => handleInputChange("valueMark", e.target.value)}
                className="h-9 border-gray-300"
                autoComplete="off"
              />
            </div>

            {/* Value */}
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <Label
                htmlFor="value"
                className="text-sm text-gray-700 text-right"
              >
                <span className="text-red-500">*</span> Value
              </Label>
              <Input
                id="value"
                value={formData.value ?? ""}
                onChange={(e) => handleInputChange("value", e.target.value)}
                className="h-9 border-gray-300"
                autoComplete="off"
              />
            </div>

            {/* Is Default */}
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <Label className="text-sm text-gray-700 text-right">
                <span className="text-red-500">*</span> Is Default
              </Label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="defaultValue"
                    value="Y"
                    checked={formData.defaultValue === "Y"}
                    onChange={(e) =>
                      handleInputChange("defaultValue", e.target.value)
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="defaultValue"
                    value="N"
                    checked={formData.defaultValue === "N"}
                    onChange={(e) =>
                      handleInputChange("defaultValue", e.target.value)
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  No
                </label>
              </div>
            </div>

            {/* Show Features */}
            <div className="grid grid-cols-[120px_1fr] items-start gap-4">
              <Label
                htmlFor="attrDriverList"
                className="text-sm text-gray-700 text-right"
              >
                Show Feature
              </Label>
              <div className="relative">
                <div className="min-h-9 max-h-24 overflow-y-auto border border-gray-300 rounded-md px-3 py-1 flex items-start">
                  <span className="flex-1 text-gray-700 whitespace-normal break-words">
                    {showFeatureText}
                  </span>
                  <div
                    className="cursor-pointer p-1 hover:bg-gray-100 rounded shrink-0"
                    onClick={() => handleShowFeature(true)}
                  >
                    <KeenIcon
                      icon="notepad-edit"
                      className="text-gray-500 w-4 h-4"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Features */}
            <div className="grid grid-cols-[120px_1fr] items-start gap-4">
              <Label
                htmlFor="attrValueLinkageList"
                className="text-sm text-gray-700 text-right"
              >
                Filter Feature
              </Label>
              <div className="relative">
                <div className="min-h-9 max-h-24 overflow-y-auto border border-gray-300 rounded-md px-3 py-1 flex items-start">
                  <span className="flex-1 text-gray-700 whitespace-normal break-words">
                    {showFilterText}
                  </span>
                  <div
                    className="cursor-pointer p-1 hover:bg-gray-100 rounded shrink-0"
                    onClick={() => handleFilterFeature(true)}
                  >
                    <KeenIcon
                      icon="notepad-edit"
                      className="text-gray-500 w-4 h-4"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 h-9 border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="px-6 h-9 bg-blue-600 hover:bg-blue-700 text-white"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs untuk menambah features */}
      <AddShowFeatureDialog
        isOpen={isAddShowFeatureDialogOpen}
        onClose={() => setIsAddShowFeatureDialogOpen(false)}
        data={initialData}
        onAdd={handleAddShowFeature}
        offerId={offerId}
      />

      <AddFilterFeatureDialog
        isOpen={isAddFilterFeatureDialogOpen}
        onClose={() => setIsAddFilterFeatureDialogOpen(false)}
        data={initialData}
        onAdd={handleAddFilterFeature}
        offerId={offerId}
      />
    </>
  );
};

export default FeatureValueModal;
