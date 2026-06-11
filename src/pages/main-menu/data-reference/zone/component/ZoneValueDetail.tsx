import { Input } from "@/components/ui/input";
import { useZoneMainListContext } from "../hooks/useZoneContext";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ZoneValue } from "../hooks/ZoneContext";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";

export const initialStateZoneDetailValue: ZoneValue = {
  zoneId: 0,
  value: "",
  effDate: "",
  expDate: "",
  comments: "",
  seq: 0,
  operType: "",
};

const API_URL_REF = apiConfigRef.ref;

const ZoneValueDetail = () => {
  const { PostData, PutData, DeleteData } = useCallApi();
  const {
    selectedItem,
    onSubmitSuccess,
    valueDetail,
    setValueDetail,
    selectedChildrenSide,
    refreshTrigger,
    setShowDeleteZoneValueDetail,
  } = useZoneMainListContext();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [formData, setFormData] = useState<ZoneValue>(initialStateZoneDetailValue);

  const validateFormValue = () => {
    const requiredFieldsValue = [
      { key: "value", label: "Zone Value" },
      { key: "effDate", label: "Effective Date" },
    ];

    const newErrors: Record<string, string> = {};
    let isValid = true;

    requiredFieldsValue.forEach(({ key, label }) => {
      const value = formData[key as keyof typeof formData];
      const isEmpty = value === null || value === undefined || (typeof value === "string" && value.trim() === "");

      if (isEmpty) {
        newErrors[key] = `${label} is required`;
        isValid = false;
        toast.error(`${label} is required`, { id: key });
      } else {
        toast.dismiss(key);
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmitValue = useCallback(
    async (nextMode: "view" | "add" = "view") => {
      if (!validateFormValue()) {
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        let response;

        if (valueDetail === "add") {
          const zoneId = selectedChildrenSide?.zoneId;
          if (!zoneId) {
            toast.error("No zone selected. Please select a zone first.");
            setIsSubmitting(false);
            return;
          }
          const payload = {
            ...formData,
            zoneId: zoneId,
          };
          response = await PostData(`${API_URL_REF}/api/zone/add-zone-value`, payload);
        } else if (valueDetail === "edit") {
          const payloadEdit = {
            ...formData,
            isZoneValueChange: true,
          };
          response = await PutData(`${API_URL_REF}/api/zone/mod-zone-value`, payloadEdit);
        }

        if (response?.status) {
          const successMessage =
            valueDetail === "add"
              ? "Zone value detail created successfully!"
              : "Zone value detail updated successfully!";
          toast.success(successMessage);
          onSubmitSuccess();
          setValueDetail(nextMode);
          // Preserve zoneId when resetting for "add" mode
          setFormData({
            ...initialStateZoneDetailValue,
            zoneId: selectedChildrenSide?.zoneId || 0,
          });
        } else {
          const errorMessage = valueDetail === "add"
            ? "Could not create zone value. Please try again."
            : "Could not update zone value. Please try again.";
          toast.error(errorMessage);
          setAlert({ show: true, message: errorMessage });
          return false;
        }
      } catch (error: any) {
        const errorMessage = "Something went wrong while saving the zone value. Please try again.";
      // console.error(`❌ Error ${valueDetail === "add" ? "creating" : "updating"} zone:`, error);
        toast.error(errorMessage);
        setAlert({ show: true, message: errorMessage });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, valueDetail, validateFormValue, PostData, PutData, selectedChildrenSide, onSubmitSuccess, setValueDetail]
  );

  const handleCancelValue = () => {
    setValueDetail("view");
    if (selectedItem) {
      setFormData({
        zoneId: selectedItem.zoneId ?? 0,
        value: selectedItem.value ?? "",
        effDate: selectedItem.effDate ?? "",
        expDate: selectedItem.expDate ?? "",
        comments: selectedItem.comments ?? "",
        seq: selectedItem.seq ?? 0,
      });
    } else {
      setFormData(initialStateZoneDetailValue);
    }
    setErrors({});
    setAlert({ show: false, message: "" });
  };

  const handleEdit = () => {
    if (!selectedChildrenSide?.zoneId) {
      toast.error("No zone selected for editing");
      return;
    }
    setValueDetail("edit");
    setErrors({});
  };

  const handleSubmitAndNew = useCallback(async () => {
    await handleSubmitValue("add");
  }, [handleSubmitValue]);

  useEffect(() => {
    if (valueDetail === "add") {
      setFormData({
        ...initialStateZoneDetailValue,
        zoneId: selectedChildrenSide?.zoneId || 0,
      });
      return;
    }

    if (valueDetail === "edit" && selectedItem) {
    // console.log(selectedItem, selectedChildrenSide, "ini");

      const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        return d.toISOString().split("T")[0];
      };

      setFormData({
        zoneId: selectedItem.zoneId || 0,
        value: selectedItem.value || "",
        effDate: formatDate(selectedItem.effDate),
        expDate: formatDate(selectedItem.expDate),
        comments: selectedItem.comments || "",
        seq: selectedItem.seq || 0,
      });
      return;
    }

    if (valueDetail === "view" && selectedItem) {

      const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        return d.toISOString().split("T")[0];
      };

      setFormData({
        zoneId: selectedItem.zoneId ?? 0,
        value: selectedItem.value ?? "",
        effDate: formatDate(selectedItem.effDate),
        expDate: formatDate(selectedItem.expDate),
        comments: selectedItem.comments ?? "",
        seq: selectedItem.seq ?? 0,
      });
    } else if (valueDetail === "view" && !selectedItem) {
      setFormData(initialStateZoneDetailValue);
    }
  }, [selectedChildrenSide, valueDetail, selectedItem, refreshTrigger]);
  useEffect(() => {
    if (valueDetail !== "view") {
      setValueDetail("view");
    }
  }, [selectedChildrenSide]);

  const isFormMode = valueDetail === "add" || valueDetail === "edit";
  const isViewMode = valueDetail === "view";

  return (
    <div className="h-auto w-full lg:w-1/2 px-2">
      <div className="relative border-[1px] shadow-md h-full pb-5 p-3">
        <div className="flex items-center justify-between pb-4 flex-wrap gap-2">
          <h2 className="text-sm font-bold">
            {valueDetail === "add" && "Add Zone Detail Value"}
            {valueDetail === "edit" && "Edit Zone Detail Value"}
            {valueDetail === "view" && "Zone Detail Value"}
          </h2>
          {/*  {isViewMode && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="default" className="h-8 text-sm" onClick={handleEdit}>
                Edit
              </Button>
              <Button variant="outline" className="h-8 text-sm" onClick={() => setShowDeleteZoneValueDetail(true)}>
                Delete
              </Button>
            </div>
          )} */}
        </div>

        {isFormMode ? (
          <div className="flex flex-col gap-3 pb-3">
            {/* Zone Value Field */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-2">
              <label className="text-[12px] w-full lg:w-28 shrink-0 pt-2">

                <span className="text-red-500">*</span>Zone Value
              </label>
              <div className="flex flex-col gap-1 w-full">
                <Input
                  type="text"
                  className={`w-full h-8 text-[12px] ${errors.value 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500" 

                    : ""
                  }`}
                  placeholder="Input Zone Value"
                  value={formData.value}
                  onChange={(e) => {
                    setFormData({ ...formData, value: e.target.value });

                    if (errors.value) {
                      setErrors({ ...errors, value: "" });
                    }
                  }}
                />
                {errors.value && (
                  <p className="text-xs text-red-500 mt-1">{errors.value}</p>
                )}
              </div>
            </div>

            {/* Date Fields */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col lg:flex-row lg:items-start gap-2">
                <label className="text-[12px] w-full lg:w-28 shrink-0 pt-2">
                  <span className="text-red-500">*</span>Effective Date
                </label>
                <div className="flex flex-col gap-1 w-full">
                  <input
                    type="date"
                    className={`flex-1 h-8 text-[12px] border border-gray-300 rounded-sm p-2 ${errors.effDate 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                      : ""
                    }`}
                    value={formData.effDate}
                    onChange={(e) => {
                      setFormData({ ...formData, effDate: e.target.value });
                      if (errors.effDate) {
                        setErrors({ ...errors, effDate: "" });
                      }
                    }}
                  />
                  {errors.effDate && (
                    <p className="text-xs text-red-500 mt-1">{errors.effDate}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                <label className="text-[12px] w-full lg:w-28 shrink-0">Expiry Date</label>
                <input
                  type="date"
                  className="flex-1 h-8 text-[12px] border border-gray-300 rounded-sm p-2"
                  value={formData.expDate}
                  onChange={(e) => {
                    setFormData({ ...formData, expDate: e.target.value });  
                    if (errors.expDate) {
                      setErrors({ ...errors, expDate: "" });
                    }
                  }}
                />
                {errors.expDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.expDate}</p>
                )}
              </div>
            </div>

            {/* Remarks Field */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-2">
              <label className="text-[12px] w-full lg:w-28 shrink-0">Remarks</label>
              <Input
                type="text"
                value={formData.comments}
                placeholder="Input remarks"
                onChange={(e) => {
                  setFormData({ ...formData, comments: e.target.value });
                  // Optional: Clear error if it exists (not required field)
                  setErrors({ ...errors, comments: "" });
                }}
                className="w-full text-[12px] h-8 border border-gray-300 rounded-sm p-2"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 flex-wrap">
              <Button variant="default" className="h-8 text-[12px]" onClick={() => handleSubmitValue("view")}>
                Submit
              </Button>
              {valueDetail === "add" && (
                <Button variant="outline" className="h-8 text-[12px]" onClick={handleSubmitAndNew}>
                  Submit and New
                </Button>
              )}
              <Button variant="outline" className="h-8 text-[12px]" onClick={handleCancelValue}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-3">
            {/* Zone Value Field - View Mode */}
            {/* MODIFIED: Only show selectedItem values if it belongs to the current zone */}
            {selectedItem && selectedItem.zoneId === selectedChildrenSide?.zoneId ? (
              <>
                <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                  <label className="text-[12px] w-full lg:w-28 shrink-0">
                    <span className="text-red-500">*</span>Zone Value
                  </label>
                  <Input
                    type="text"
                    className="w-full h-8 text-[12px]"
                    placeholder="Zone Value"
                    value={selectedItem?.value ?? ""}
                    disabled
                  />
                </div>

                {/* Date Fields - View Mode */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                    <label className="text-[12px] w-full lg:w-28 shrink-0">
                      <span className="text-red-500">*</span>Effective Date
                    </label>
                    <Input
                      type="date"
                      className="flex-1 h-8 text-[12px] border border-gray-300 rounded-sm p-2"
                      value={selectedItem?.effDate ? new Date(selectedItem.effDate).toISOString().split("T")[0] : ""}
                      disabled
                    />
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                    <label className="text-[12px] w-full lg:w-28 shrink-0">Expiry Date</label>
                    <Input
                      type="date"
                      className="flex-1 h-8 border border-gray-300 rounded-sm text-[12px] p-2"
                      value={selectedItem?.expDate ? new Date(selectedItem.expDate).toISOString().split("T")[0] : ""}
                      disabled
                    />
                  </div>
                </div>

                {/* Remarks Field - View Mode */}
                <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                  <label className="text-[12px] w-full lg:w-28 shrink-0">Remarks</label>
                  <Input
                    type="text"
                    className="w-full h-8 text-[12px]"
                    placeholder="Remarks"
                    value={selectedItem?.comments ?? ""}
                    disabled
                  />
                </div>
              </>
            ) : (
              // MODIFIED: Show empty fields when selectedItem doesn't belong to current zone or doesn't exist
              <>
                <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                  <label className="text-[12px] w-full lg:w-28 shrink-0">
                    <span className="text-red-500">*</span>Zone Value
                  </label>
                  <Input
                    type="text"
                    className="w-full h-8 text-[12px]"
                    placeholder="Zone Value"
                    value=""
                    disabled
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                    <label className="text-[12px] w-full lg:w-28 shrink-0">
                      <span className="text-red-500">*</span>Effective Date
                    </label>
                    <Input
                      type="date"
                      className="flex-1 h-8 text-[12px] border border-gray-300 rounded-sm p-2"
                      value=""
                      disabled
                    />
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                    <label className="text-[12px] w-full lg:w-28 shrink-0">Expiry Date</label>
                    <Input
                      type="date"
                      className="flex-1 h-8 border border-gray-300 rounded-sm text-[12px] p-2"
                      value=""
                      disabled
                    />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                  <label className="text-[12px] w-full lg:w-28 shrink-0">Remarks</label>
                  <Input
                    type="text"
                    className="w-full h-8 text-[12px]"
                    placeholder="Remarks"
                    value=""
                    disabled
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


export default ZoneValueDetail;
