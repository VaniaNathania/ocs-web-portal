import { DataGridColumnHeader, DataGridProvider, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useZoneMainListContext } from "../hooks/useZoneContext";
import ZoneValue from "./ZoneValue";
import ZoneValueDetail from "./ZoneValueDetail";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { zoneDetail } from "../hooks/ZoneContext";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const API_URL_REF = apiConfigRef.ref;

export const initialStateZoneDetail: zoneDetail = {
  zoneId: 0,
  zoneName: "",
  zoneCode: "",
  zoneMapId: 0,
  spId: 0,
  value: "",
  effDate: "",
  comments: "",
};

type FormMode = "view" | "add" | "edit";

const ZoneDetail = () => {
  const { PostData, PutData } = useCallApi();
  const { selectedChildrenSide, onSubmitSuccess, handleDeleteZoneDetail, menuPrivAccess } = useZoneMainListContext();
  const [mode, setMode] = useState<FormMode>("view");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [formData, setFormData] = useState<zoneDetail>(initialStateZoneDetail);

  useEffect(() => {
    if (selectedChildrenSide) {
      setFormData({
        zoneId: selectedChildrenSide.zoneId || 0,
        zoneName: selectedChildrenSide.zoneName || "",
        zoneCode: selectedChildrenSide.zoneCode || "",
        zoneMapId: selectedChildrenSide.zoneMapId || 0,
        spId: selectedChildrenSide.spId || 0,
        value: selectedChildrenSide.value || "",
        effDate: selectedChildrenSide.effDate || "",
        comments: selectedChildrenSide.comments || "",
      });
    }
  }, [selectedChildrenSide]);

  useEffect(() => {
    if (mode !== "view") {
      setMode("view");
    }
  }, [selectedChildrenSide]);

  const validateForm = () => {
    const requiredFields = [{ key: "zoneName", label: "Zone Name" }];

    const newErrors: Record<string, string> = {};
    let isValid = true;

    requiredFields.forEach(({ key, label }) => {
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

    setError(newErrors);
    return isValid;
  };

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError({});

    try {
      let response;

      if (mode === "add") {
        // Add new zone
        const payload = {
          ...formData,
          zoneMapId: selectedChildrenSide?.zoneMapId || formData.zoneMapId,
        };
        response = await PostData(`${API_URL_REF}/api/zone/add-zone`, payload);
      } else if (mode === "edit") {
        // Edit existing zone
        response = await PutData(`${API_URL_REF}/api/zone/mod-zone`, formData);
      }

      if (response?.status) {
        const successMessage =
          mode === "add" ? "Zone detail created successfully!" : "Zone detail updated successfully!";
        toast.success(successMessage);
        onSubmitSuccess();
        setMode("view");
      } else {
        const errorMessage =
          response?.message || `Failed to ${mode === "add" ? "create" : "update"} zone detail. Please try again.`;
        toast.error(errorMessage);
        setAlert({
          show: true,
          message: errorMessage,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Something went wrong. Please try again.";
      // console.error(`❌ Error ${mode === "add" ? "creating" : "updating"} zone:`, error);
      toast.error(errorMessage);
      setAlert({ show: true, message: errorMessage });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, mode, validateForm, PostData, PutData, selectedChildrenSide, onSubmitSuccess]);

  const handleCancel = () => {
    setMode("view");
    if (selectedChildrenSide) {
      setFormData({
        zoneId: selectedChildrenSide.zoneId || 0,
        zoneName: selectedChildrenSide.zoneName || "",
        zoneCode: selectedChildrenSide.zoneCode || "",
        zoneMapId: selectedChildrenSide.zoneMapId || 0,
        spId: selectedChildrenSide.spId || 0,
        value: selectedChildrenSide.value || "",
        effDate: selectedChildrenSide.effDate || "",
        comments: selectedChildrenSide.comments || "",
      });
    } else {
      setFormData(initialStateZoneDetail);
    }
    setError({});
    setAlert({ show: false, message: "" });
  };

  const handleAddNew = () => {
    setMode("add");
    setFormData({
      ...initialStateZoneDetail,
      zoneMapId: selectedChildrenSide?.zoneMapId || 0,
    });
    setError({});
  };

  const handleEdit = () => {
    if (!selectedChildrenSide?.zoneId) {
      toast.error("No zone selected for editing");
      return;
    }
    setMode("edit");
    setError({});
  };

  const isFormMode = mode === "add" || mode === "edit";
  const isViewMode = mode === "view";

  return (
    <div className="flex flex-col h-full flex-1 gap-3 overflow-y-auto">
      <div className="flex flex-col lg:flex-row">
        <div className="px-2 h-auto w-full lg:w-1/2">
          <div className="border-[1px] shadow-md h-full relative p-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
              <h2 className="text-sm font-bold">
                {mode === "add" && "Add Zone"}
                {mode === "edit" && "Edit Zone"}
                {mode === "view" && "Zone Detail"}
              </h2>
              {isViewMode && (
                <div className="flex items-center gap-2 flex-wrap">
                  <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
                  <Button variant="default" className="h-8 w-full sm:w-[100px] text-sm" onClick={handleAddNew}>
                    New Data
                  </Button>
                  </AccessWrapper>

                  <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
                  <Button
                    variant="outline"
                    className="w-full sm:w-[100px] text-sm h-8"
                    onClick={handleEdit}
                    disabled={!selectedChildrenSide?.zoneId}
                  >
                    Edit Data
                  </Button>
                  </AccessWrapper>

                <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
                  <Button
                    variant="outline"
                    className="w-full sm:w-[100px] text-sm h-8"
                    onClick={() => handleDeleteZoneDetail(true)}
                    disabled={!selectedChildrenSide?.zoneId}
                  >
                    Delete Data
                  </Button>
                </AccessWrapper>
                </div>
              )}
            </div>

            {/* Form - untuk Add dan Edit */}
            {isFormMode ? (
              <>
                <div className="flex flex-col gap-3 pb-3">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-2">
                    <label className="text-[12px] w-full lg:w-32 shrink-0 pt-2">
                      <span className="text-red-500">*</span>
                      Zone Name
                    </label>
                    <div className="flex flex-col gap-1 w-full">
                      <Input
                        type="text"
                        className={`h-8 text-[12px] w-full ${error.zoneName 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                          : ""
                        }`}
                        placeholder="Input Zone Name"
                        value={formData.zoneName}
                        onChange={(e) => {
                          setFormData({ ...formData, zoneName: e.target.value });
                          if (error.zoneName) {
                            setError({ ...error, zoneName: "" });
                          }
                        }}
                      />
                      {error.zoneName && (
                        <p className="text-xs text-red-500 mt-1">{error.zoneName}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                    <label className="text-[12px] w-full lg:w-32 shrink-0">Zone Code</label>
                    <Input
                      type="text"
                      className="text-[12px] h-8 w-full"
                      placeholder="Input Zone Code"
                      value={formData.zoneCode}
                      onChange={(e) => {
                        setFormData({ ...formData, zoneCode: e.target.value });
                        if (error.zoneCode) {
                          setError({ ...error, zoneCode: "" });
                        }
                      }}
                    />
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                    <label className="text-[12px] w-full lg:w-32 shrink-0">Remarks</label>
                    <Input
                      type="text"
                      className="text-[12px] h-8 w-full"
                      placeholder="Input Remarks"
                      value={formData.comments}
                      onChange={(e) => {
                        setFormData({ ...formData, comments: e.target.value });
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 flex-wrap">
                  <Button
                    variant="default"
                    className="text-sm h-8 w-full sm:w-auto"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    className="text-sm h-8 w-full sm:w-auto"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              // View Mode - Read Only
              <div className="flex flex-col gap-3">
                <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                  <label className="text-[12px] w-full lg:w-32 shrink-0">
                    <span className="text-red-500">*</span>Zone Name
                  </label>
                  <Input
                    type="text"
                    value={formData.zoneName || ""}
                    className="text-[12px] h-8 w-full"
                    placeholder="Zone Name"
                    disabled
                  />
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                  <label className="text-[12px] w-full lg:w-32 shrink-0">Zone Code</label>
                  <Input
                    type="text"
                    value={formData.zoneCode || ""}
                    className="text-[12px] h-8 w-full"
                    placeholder="Zone Code"
                    disabled
                  />
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                  <label className="text-[12px] w-full lg:w-32 shrink-0">Remarks</label>
                  <Input
                    type="text"
                    value={formData.comments || ""}
                    className="text-[12px] h-8 w-full"
                    placeholder="Remarks"
                    disabled
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <ZoneValueDetail />
      </div>
      <ZoneValue />
    </div>
  );
};

export default ZoneDetail;
