import React, { useState, useEffect } from "react";
import { KeenIcon } from "@/components/keenicons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";

interface VersionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VersionFormData) => void;
  mode: "create" | "edit";
  initialData?: VersionFormData;
  isLoading?: boolean;
  offerId?: string | number; // Added offerId prop
}

// Update interface atau import dari VersionDialog
interface VersionFormData {
  offerVerId?: number;
  effDate: string;
  expDate: string | null;
  sourceFrom: string;
  oldPricePlanId: number | null;
  prefix: string | null;
  postfix: string | null;
  isCopyOfferAttr: string;
}

interface CopyFromItem {
  pricePlanId: number;
  pricePlanName: string;
  effDate: string;
}

const API_URL = apiConfig.service_price_plan;

const VersionDialog: React.FC<VersionDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  isLoading = false,
  offerId,
}) => {
  const { GetData, PostData, PutData } = useCallApi();
  const [copyFrom, setCopyFrom] = useState<CopyFromItem[]>([]);
  const [formData, setFormData] = useState<VersionFormData>({
    effDate: initialData?.expDate || "",
    expDate: null,
    sourceFrom: "1",
    oldPricePlanId: null,
    prefix: null,
    postfix: null,
    isCopyOfferAttr: "N",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCopyFrom = async () => {
    if (!isOpen) return;


  };

  useEffect(() => {
    fetchCopyFrom();
  }, [isOpen, GetData]);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData(initialData);
      } else if (mode === "create" && initialData) {
        // Reset form for create mode
        setFormData({
          effDate: initialData?.expDate || "",
          expDate: null,
          sourceFrom: "1",
          oldPricePlanId: null,
          prefix: "",
          postfix: "",
          isCopyOfferAttr: "N",
        });
      } else {
        // Reset form for create mode
        setFormData({
          effDate: initialData?.expDate || "",
          expDate: null,
          sourceFrom: "1",
          oldPricePlanId: null,
          prefix: "",
          postfix: "",
          isCopyOfferAttr: "N",
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, initialData]);

  const handleInputChange = (
    field: keyof VersionFormData,
    value: string | number | null
  ) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // If effDate is being changed and expDate exists, validate expDate
      if (field === "effDate" && newData.expDate) {
        const effDate = new Date(value as string);
        const expDate = new Date(newData.expDate);
        if (expDate < effDate) {
          // Clear expDate if it's not valid anymore
          newData.expDate = null;
        }
      }

      return newData;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.effDate) {
      newErrors.effDate = "Effective date is required";
    }

    if (formData.expDate && formData.effDate) {
      const effDate = new Date(formData.effDate);
      const expDate = new Date(formData.expDate);
      if (expDate < effDate) {
        newErrors.expDate = "Expiration date cannot be before effective date";
      }
    }

    if (formData.sourceFrom === "0" && !formData.oldPricePlanId) {
      newErrors.oldPricePlanId = "Please select a copy from option";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const doCreateVersion = async () => {
    try {
      const response = await PostData(
        `${API_URL}/priceplan/version/add/${offerId}`,
        formData
      );
      if (response?.status) {
        onSubmit(formData);
        toast.success("Version created successfully");
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Error creating version");
    }
  };

  const doUpdateVersion = async () => {
    try {
      // Exclude offerVerId from the request body for update
      const { offerVerId, ...updateData } = formData;

      const response = await PutData(
        `${API_URL}/priceplan/version/edit/${offerId}/${formData.offerVerId}`,
        updateData
      );
      if (response?.status) {
        onSubmit(formData);
        toast.success("Version updated successfully");
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Error updating version");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      if (mode === "create") {
        await doCreateVersion();
      } else {
        await doUpdateVersion();
      }
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Calculate minimum date for expiration date (same day as effective date is allowed)
  const getMinExpDate = (): string => {
    if (!formData.effDate) return "";

    return formData.effDate; // Same date is allowed
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === "create" ? "Create New Version" : "Edit Version"}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <KeenIcon icon="cross" className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === "edit" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Version ID
              </label>
              <input
                type="text"
                value={formData.offerVerId || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effective Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.effDate}
              onChange={(e) => handleInputChange("effDate", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.effDate ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading}
            />
            {errors.effDate && (
              <p className="text-red-500 text-xs mt-1">{errors.effDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date
            </label>
            <input
              type="date"
              value={formData.expDate || ""}
              min={getMinExpDate()}
              onChange={(e) =>
                handleInputChange("expDate", e.target.value || null)
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.expDate ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading || !formData.effDate}
              title={
                !formData.effDate ? "Please select effective date first" : ""
              }
            />
            {errors.expDate && (
              <p className="text-red-500 text-xs mt-1">{errors.expDate}</p>
            )}
            {!formData.effDate && (
              <p className="text-gray-500 text-xs mt-1">
                Select effective date first to enable expiration date
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Source From
            </label>

            <div
              className="
                flex h-10 w-full items-center rounded-md border
                border-input bg-muted px-3 text-sm text-gray-700
              "
            >
              Share From
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {mode === "create" ? "Create" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { VersionDialog, type VersionFormData };
