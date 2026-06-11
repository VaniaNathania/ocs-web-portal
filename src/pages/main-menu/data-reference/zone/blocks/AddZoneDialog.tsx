import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeenIcon } from "@/components";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import { useZoneMainListContext } from "../hooks/useZoneContext";

const API_URL_REF = apiConfigRef.ref;

interface ZoneFormData {
  zoneName: string;
  zoneCode: string;
  remarks: string;
}

interface AddZoneDialogProps {
  isOpen: boolean;
  handleDialog: (open: boolean) => void;
}

const AddZoneDialog: React.FC<AddZoneDialogProps> = ({
  isOpen,
  handleDialog,
}) => {
  const { PostData } = useCallApi();

  const { selectedParent, onSubmitSuccess } = useZoneMainListContext();
  const [formData, setFormData] = useState<ZoneFormData>({
    zoneName: "",
    zoneCode: "",
    remarks: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  const resetForm = () => {
    setFormData({
      zoneName: "",
      zoneCode: "",
      remarks: "",
    });
    setErrors({});
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

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

    if (!formData.zoneName.trim()) {
      newErrors.zoneName = "Zone Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!selectedParent) {
        toast.error("Zone Map Required.");
        setIsSubmitting(false);
        return;
      }

      // Get zoneName from form (100% not null from user input)
      const zoneNameValue = formData.zoneName.trim();
      if (!zoneNameValue) {
        toast.error("Zone Name is required.");
        setIsSubmitting(false);

        return;
      }

      // Get zoneMapId from parent (must be a valid number)
      const zoneMapIdValue = selectedParent.zoneMapId;
      if (!zoneMapIdValue) {
        toast.error("Zone Map ID is missing. Please select a zone map from the sidebar.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        zoneId: 0,
        zoneName: zoneNameValue,
        zoneCode: formData.zoneCode.trim(),
        zoneMapId: Number(zoneMapIdValue), // Convert to number
        comments: formData.remarks.trim() || "",
        parentZoneId: null,
        spId: 0,
        value: "",
        effDate: new Date().toISOString().split('T')[0],
      };

      // Log payload for debugging
      // console.log("AddZone - selectedParent:", selectedParent);
      // console.log("AddZone - zoneNameValue:", zoneNameValue);
      // console.log("AddZone - zoneMapIdValue:", zoneMapIdValue, "type:", typeof zoneMapIdValue);
      // console.log("AddZone - Full payload:", JSON.stringify(payload, null, 2));

      const response = await PostData(`${API_URL_REF}/api/zone/add-zone`, payload);

      // console.log("AddZone - Response:", response);

      if (response?.status) {
        toast.success("Zone created successfully");
        handleDialog(false);
        onSubmitSuccess();

      } else {
        toast.error(response?.message || "Failed to create Zone");
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred while creating Zone");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    handleDialog(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialog}>
      <DialogContent className="container-fixed max-w-2xl flex flex-col p-0 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                New Zone
              </DialogTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0 absolute right-6 top-6"
            >
              <KeenIcon icon="cross" className="text-sm" />
            </Button>
          </div>
        </DialogHeader>

        <DialogBody className="scrollable-y p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-[200px_1fr] items-start gap-4">
              <Label className="text-sm text-gray-800">
                Zone Name <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-col gap-1 w-full">
                <Input
                  name="zoneName"
                  className={`w-full ${errors.zoneName 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                    : ""
                  }`}
                  value={formData.zoneName}
                  onChange={handleInputChange}
                  autoComplete="off"
                  placeholder="Enter new Zone Name"
                  disabled={isSubmitting}
                />
                {errors.zoneName && (
                  <span className="text-sm text-red-500 mt-1">{errors.zoneName}</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] items-center gap-4">
              <Label className="text-sm text-gray-800">
                Zone Code
              </Label>
              <div className="flex flex-col gap-1 w-full">
                <Input
                  name="zoneCode"
                  value={formData.zoneCode}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Enter Zone Code"
                  disabled={isSubmitting}
                />
                {errors.zoneCode && (
                  <span className="text-sm text-red-500 mt-1">{errors.zoneCode}</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] items-start gap-4">
              <Label className="text-sm text-gray-800">Remarks</Label>
              <Textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                className="w-full min-h-[100px]"
                placeholder="Enter remarks..."
                disabled={isSubmitting}
              />
            </div>
            
            <DialogFooter className="p-6 border-t border-gray-200 -mx-6 -mb-6">
              <div className="flex justify-end gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="bg-blue-500 hover:bg-blue-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default AddZoneDialog;
