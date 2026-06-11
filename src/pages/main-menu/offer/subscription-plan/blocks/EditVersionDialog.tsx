import React, { useState, useEffect, useRef, useCallback } from "react";
import { apiConfigOffer } from "@/config/api.config";
import { useSubscriptionPlanOfferListContext } from "../hooks/useSubscriptionPlanOfferListContext";
import { useCallApi } from "@/hooks";
import { getAuth } from "@/auth";
import { toast } from "sonner";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormData } from "./AddVersionDialog";
import { useOfferLayout } from "@/layouts/main-menu/offer";

interface EditVersionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  data: any | null;
}

const API_URL_OFFER = apiConfigOffer.offer;

const EditVersionDialog: React.FC<EditVersionDialogProps> = ({
  isOpen,
  onClose,
  data,
  onSuccess,
}) => {
  const initialStateAddDialog: FormData = {
    effDate: null,
    expDate: null,
    offerVerId: data.offerVerId,
    offerId: data.offerId,
    seq: 1,
    spId: 0,
  };
  const [formData, setFormData] = useState<FormData>(initialStateAddDialog);
  const parentRef = useRef<any | null>(null);

  const {
    showEditVersionDialogSubsPlan,
    handleEditVersionDialogSubsPlan,
    versions,
  } = useSubscriptionPlanOfferListContext();
  const { PutData } = useCallApi();
  const parsedUser = getAuth()?.user;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const { selectedSubSubPlan } = useOfferLayout();

  const resetForm = () => {
    setFormData(initialStateAddDialog);
    setErrors({});
    setAlert({ show: false, message: "" });
  };

  useEffect(() => {
    if (showEditVersionDialogSubsPlan && versions?.length === 1) {
      //  console.log("DETAIL DATA SELECTED VERSION: ", data);
    } else {
      //  console.log("DETAIL DATA SELECTED VERSION > 1: ", data);
    }
  }, [showEditVersionDialogSubsPlan, data, versions]);

  useEffect(() => {
    if (showEditVersionDialogSubsPlan === false) {
      resetForm();
    }
  }, [showEditVersionDialogSubsPlan]);

  useEffect(() => {
    //  console.log("EDIT FORM DATA: ", formData);
  }, []);

  useEffect(() => {
    if (data) {
      setFormData({
        effDate: data.effDate ?? null,
        expDate: data.expDate ?? null,
        offerVerId: data.offerVerId ?? null,
        offerId: data.offerId ?? null,
        seq: 1,
        spId: 0,
      });
    } else {
      setFormData(initialStateAddDialog);
    }
  }, [data]);

  const handleInputChange = (field: string, value: string | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const requiredFields = [{ key: "effDate", label: "Effective Date" }];

    const newErrors: Record<string, string> = {};
    let isValid = true;

    setAlert({ show: false, message: "" });

    requiredFields.forEach(({ key, label }) => {
      const value = formData[key as keyof FormData];

      const isEmpty = value === "" || value === null || value === undefined;

      if (isEmpty) {
        newErrors[key] = `${label} is required`;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (!isValid) {
      const firstError = Object.values(newErrors)[0];
      setAlert({
        show: true,
        message: firstError || "Please fill in all required fields",
      });
    }

    return isValid;
  };

  const handleCancel = () => {
    handleEditVersionDialogSubsPlan(false);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setAlert({ show: false, message: "" });

      try {
        //  console.log("🚀 Update formdata MOD:", formData);

        const response = await PutData(
          `${API_URL_OFFER}/offer/subs-plan/mod-subs-plan-ver`,
          formData,
        );

        //  console.log("📦 API Response:", response);

        if (response?.status) {
          resetForm();
          toast.success("Update version successfully!");

          onSuccess?.();
          //  console.log("DATA: ", response.data);

          onClose();
          //  console.log("✅ Update version successfully");
        } else {
          const errorMessage =
            response?.message || "Failed to update version. Please try again.";
          toast.error(errorMessage);
          setAlert({
            show: true,
            message: errorMessage,
          });
          console.error("❌ API returned error:", response);
        }
      } catch (error: any) {
        const errorMessage =
          error?.message || "Something went wrong. Please try again.";
        console.error("❌ Error update version:", error);
        toast.error(errorMessage);
        setAlert({
          show: true,
          message: errorMessage,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, handleEditVersionDialogSubsPlan, PutData, parsedUser],
  );

  return (
    <Dialog
      open={showEditVersionDialogSubsPlan}
      onOpenChange={handleEditVersionDialogSubsPlan}
    >
      <DialogContent className="max-w-2xl w-full p-3 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg">Edit Version</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <DialogBody className="max-h-[75vh] overflow-y-auto">
          {alert.show && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{alert.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="p-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Version Date */}
                <div>
                  {/* Label untuk keduanya */}
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version Date <span className="text-red-500">*</span>
                  </label>

                  {/* Dua input sejajar */}
                  <div className="flex gap-2">
                    {/* Effective Date */}
                    <div className="w-1/2">
                      <input
                        type="date"
                        value={formData.effDate || ""}
                        onChange={(e) =>
                          handleInputChange("effDate", e.target.value || null)
                        }
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors["offer.effDate"] ? "border-red-500" : "border-gray-300"}`}
                        disabled={isSubmitting}
                      />
                      {errors["offer.effDate"] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors["effDate"]}
                        </p>
                      )}
                    </div>

                    <label className="mt-2">-</label>

                    {/* Expired Date */}
                    <div className="w-1/2">
                      <input
                        type="date"
                        value={formData.expDate || ""}
                        onChange={(e) =>
                          handleInputChange("expDate", e.target.value || null)
                        }
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors["expDate"] ? "border-red-500" : "border-gray-300"}`}
                        disabled={isSubmitting}
                      />
                      {errors["offer.expDate"] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors["expDate"]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "OK"}
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default EditVersionDialog;
