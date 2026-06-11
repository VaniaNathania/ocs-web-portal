import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import AddZoneDialog from "../blocks/AddZoneDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import DeleteDialog from "../blocks/DeleteDialog";
import { useZoneMainListContext } from "../hooks/useZoneContext";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const API_URL_REF = apiConfigRef.ref;

const ZONE_MAP_TYPES = [
  { id: "1", label: "Countries Code" },
  { id: "2", label: "VAS Code" },
  { id: "3", label: "Handset Code" },
  { id: "4", label: "GL Type Code" },
];

interface ZoneMapContentProps {
  selectedZoneMapName?: string;
}

type FormMode = "view" | "add" | "edit";

const ZoneMapContent: React.FC<ZoneMapContentProps> = ({ selectedZoneMapName = "America - Africa MCC" }) => {

  const { selectedParent, onSubmitSuccess, menuPrivAccess } = useZoneMainListContext();

  const { PostData, PutData } = useCallApi();

  const [showAddZoneDialog, setShowAddZoneDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [mode, setMode] = useState<FormMode>("view");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    zoneMapName: selectedZoneMapName,
    zoneMapType: "",
    zoneMapCode: "",
    remarks: "",
    matchMode: "exact",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Map API zoneMapType to form zoneMapType
  const getZoneMapTypeFromApi = (type: string | number): string => {
    if (!type) return "";
    return String(type);
  };

  // Map API matchMode to form matchMode
  const getMatchModeFromApi = (mode: string): string => {
    const modeMap: Record<string, string> = {
      "E": "exact",
      "P": "prefix",
      "R": "range",
      "SP": "splitPrefix",
      "IPV4": "ipv4Range",
      "IPV6": "ipv6Range",
      "S2": "split2Values",
      "S3": "split3Values",
    };
    return modeMap[mode] || "exact";
  };


  const getMatchModeForApi = (mode: string): string => {
    const modeMap: Record<string, string> = {
      "exact": "E",
      "prefix": "P",
      "range": "R",
      "splitPrefix": "SP",
      "ipv4Range": "IPV4",
      "ipv6Range": "IPV6",
      "split2Values": "S2",
      "split3Values": "S3",
    };
    return modeMap[mode] || "E";
  };

  const getZoneMapTypeForApi = (type: string): string => {
    return type || "0";
  };

  useEffect(() => {
    if (selectedParent && mode === "view") {
      setFormData({
        zoneMapName: selectedParent.zoneMapName || "",
        zoneMapType: getZoneMapTypeFromApi(selectedParent.zoneMapType),
        zoneMapCode: selectedParent.stdCode || "",
        remarks: selectedParent.comments || "",
        matchMode: getMatchModeFromApi(selectedParent.matchMode || "E"),
      });
      setMode("view");
    }
  }, [selectedParent]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.zoneMapName.trim()) {
      newErrors.zoneMapName = "Zone Map Name is required";
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      zoneMapType: value,
    }));
  };

  const handleMatchModeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      matchMode: value,
    }));
  };

  const handleEditClick = () => {
    setMode("edit");
  };

  const handleAddNew = () => {
    setMode("add");
    setFormData({
      zoneMapName: "",
      zoneMapType: "",
      zoneMapCode: "",
      remarks: "",
      matchMode: "exact",
    });
    setErrors({});
  };

  const handleCancelEdit = () => {
    if (mode === "add") {
      setMode("view");
      setFormData({
        zoneMapName: selectedZoneMapName,
        zoneMapType: "",
        zoneMapCode: "",
        remarks: "",
        matchMode: "exact",
      });
    } else if (selectedParent) {
      setFormData({
        zoneMapName: selectedParent.zoneMapName || "",
        zoneMapType: getZoneMapTypeFromApi(selectedParent.zoneMapType),
        zoneMapCode: selectedParent.stdCode || "",
        remarks: selectedParent.comments || "",
        matchMode: getMatchModeFromApi(selectedParent.matchMode || "E"),
      });
    }
    setMode("view");
    setErrors({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);

    try {
      const matchModeValue = getMatchModeForApi(formData.matchMode);
      const zoneMapTypeValue = getZoneMapTypeForApi(formData.zoneMapType);

      const zoneMapTypeId = Number(zoneMapTypeValue);

      if (mode === "add") {
        const payload: any = {
          zoneMapId: 0,
          zoneMapName: formData.zoneMapName.trim(),
          stdCode: formData.zoneMapCode.trim() || "",
          matchMode: matchModeValue,
          comments: formData.remarks.trim() || "",
          spId: 0,
          glTypeId: 0,
          state: "A",
        };

        if (zoneMapTypeId > 0) {
          payload.zoneMapType = zoneMapTypeId;
        }

        const response = await PostData(`${API_URL_REF}/api/zone/add-zone-map`, payload);

        if (response?.status) {
          toast.success("Zone map created successfully");
          setMode("view");
          onSubmitSuccess();
        } else {
          toast.error("Could not create zone map. Please try again.");
        }
      } else {
        if (!selectedParent) {
          toast.error("No zone map selected");
          return;
        }

        const payload: any = {
          zoneMapId: Number(selectedParent.zoneMapId),
          zoneMapName: formData.zoneMapName.trim(),
          stdCode: formData.zoneMapCode.trim() || "",
          matchMode: matchModeValue,
          comments: formData.remarks.trim() || "",
          spId: 0,
          glTypeId: 0,
          state: selectedParent.state || "A",
        };

        if (zoneMapTypeId > 0) {
          payload.zoneMapType = zoneMapTypeId;
        }

        const response = await PutData(`${API_URL_REF}/api/zone/mod-zone-map`, payload);

        if (response?.status) {
          toast.success("Zone map updated successfully");
          setMode("view");
          onSubmitSuccess();
        } else {
          toast.error("Could not update zone map. Please try again.");
        }
      }
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${mode === "add" ? "create" : "update"} zone map`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const matchModes = [
    { value: "exact", label: "Exact Match" },
    { value: "prefix", label: "Prefix" },
    { value: "range", label: "Range Match" },
    { value: "splitPrefix", label: "Split Prefix Match" },
    { value: "ipv4Range", label: "IPV4 Range Match" },
    { value: "ipv6Range", label: "IPV6 Range Match" },
    { value: "split2Values", label: "Split to 2 Values Exact Match" },
    { value: "split3Values", label: "Split to 3 Values Exact Match" },
  ];


  const handleDeleteSuccess = () => {
    // console.log("Zone map deleted");
  };

  const isFormMode = mode === "add" || mode === "edit";

  return (
    <div className="flex flex-col h-full flex-1 gap-3 overflow-y-auto">
      <div className="border-[1px] shadow-md h-full relative p-6 overflow-auto rounded-lg">
        <div className="text-xl font-semibold ">
          {mode === "add" && "Add Zone Map"}
          {mode === "edit" && "Edit Zone Map"}
          {mode === "view" && "Zone Map"}
        </div>
        <div className="p-10">
          <div className="space-y-6">
            <div className="grid grid-cols-[200px_1fr] items-start gap-4">
              <Label className="text-sm text-gray-800">
                Zone Map Name
                <span className="text-red-500"> *</span>
              </Label>
              <div className="flex flex-col gap-1 w-full">
                <Input
                  name="zoneMapName"
                  value={formData.zoneMapName}
                  onChange={handleInputChange}
                  disabled={!isFormMode}
                  className={`w-full h-8 text-[12px] ${errors.zoneMapName
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {errors.zoneMapName && (
                  <p className="text-sm text-red-500 mt-1">{errors.zoneMapName}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] items-center gap-4">
              <Label className="text-sm text-gray-800">Zone Map Type</Label>
              <Select value={formData.zoneMapType} onValueChange={handleSelectChange} disabled={!isFormMode}>
                <SelectTrigger className={`w-full`}>
                  <SelectValue placeholder="---Please Select---" />
                </SelectTrigger>
                <SelectContent>
                  {ZONE_MAP_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-[200px_1fr] items-center gap-4">
              <Label className="text-sm text-gray-800">Zone Map Code</Label>
              <Input name="zoneMapCode" value={formData.zoneMapCode} placeholder="Enter zone map code" onChange={handleInputChange} className="w-full" disabled={!isFormMode} />
            </div>
            <div className="grid grid-cols-[200px_1fr] items-start gap-4">
              <Label className="text-sm text-gray-800">Remarks</Label>
              <Textarea name="remarks" value={formData.remarks} onChange={handleInputChange}
                className="w-full min-h-[100px]" placeholder="Enter remarks..." disabled={!isFormMode} />
            </div>
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-gray-800">Match mode
                <span className="text-red-500"> *</span>
              </Label>
              <div className="grid grid-cols-2 gap-4 justify-items-start">
                {matchModes.map((mode) => (
                  <label key={mode.value} className="flex items-center gap-2 text-sm cursor-pointer w-fit">
                    <input
                      type="radio"
                      name="matchMode"
                      value={mode.value}
                      checked={formData.matchMode === mode.value}
                      onChange={(e) => handleMatchModeChange(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      disabled={!isFormMode} />
                    <span className="text-gray-700">{mode.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t">
            {mode === "view" && (
              <>
              <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
                <Button variant="default" className="bg-blue-500 hover:bg-blue-600" onClick={handleAddNew}>
                  New Zone Map
                </Button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
                <Button variant="outline" className="border-gray-300" onClick={() => setShowAddZoneDialog(true)}>
                  New Zone
                </Button>
              </AccessWrapper>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-300">
                      Action
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteConfirmDialog(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      Delete Zone Map
                    </DropdownMenuItem>
                    </AccessWrapper>
                    <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
                    <DropdownMenuItem
                      onClick={handleEditClick}
                      className=""
                    >
                      Edit Zone Map
                    </DropdownMenuItem>
                    </AccessWrapper>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {isFormMode && (
              <>
                <Button
                  variant="outline"
                  className="border-gray-300"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>

          <div className="mt-8 pt-6 border-t">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Note:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. Prefix: Searches for the value in the zone map that best matches the prefix of value.</p>
              <p>
                2. Split Prefix Match: Searches for the value in the zone map that best matches the prefix of
                value which has been split.
              </p>
              <p>3. Exact Match: Only searches for the value in the zone map that exactly matches the event.</p>
              <p>
                4. Range Match: Searches for the value in the zone map that is between the initial value and
                expiry value.
              </p>
            </div>
          </div>

          <AddZoneDialog isOpen={showAddZoneDialog} handleDialog={setShowAddZoneDialog} />

          <DeleteDialog
            isOpen={showDeleteConfirmDialog}
            onClose={() => setShowDeleteConfirmDialog(false)}
            zoneMapName={formData.zoneMapName}
            zoneMapId={selectedParent?.zoneMapId}
            onDeleteSuccess={handleDeleteSuccess}
          />
        </div>
      </div>
    </div>
  );
};


export default ZoneMapContent;
