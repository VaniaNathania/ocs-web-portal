import { Alert, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCallback, useState, useEffect } from "react";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";

interface blockProps {
  onSubmitSuccess?: () => void;
  onUpdatingSuccess?: () => void;
}

interface effectiveForm {
  type: "immediately" | "special";
  effectiveDate: string;
  expiryDate: string;
}

const defaultEffectiveForm: effectiveForm = {
  type: "immediately",
  effectiveDate: "",
  expiryDate: "",
};

interface EffectiveTypeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (effectiveType: string, effectiveDate: string, expiryDate: string) => void;
}

const API_URL_OFFER = apiConfigOffer.offer;

// COMPONENT EFFECTIVE TYPE - DI DALAM FILE YANG SAMA
export const EffectiveType: React.FC<EffectiveTypeProps> = ({ isOpen, onClose, onSubmitSuccess }) => {
  const [effectiveForm, setEffectiveForm] = useState<effectiveForm>(defaultEffectiveForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setEffectiveForm(defaultEffectiveForm);
      setErrors({});
    }
  }, [isOpen]);

  // Optimized handlers with useCallback
  const handleTypeChange = useCallback((type: "immediately" | "special") => {
    setEffectiveForm((prev) => ({ ...prev, type }));
  }, []);

  const handleDateChange = useCallback(
    (field: "effectiveDate" | "expiryDate", value: string) => {
      setEffectiveForm((prev) => ({ ...prev, [field]: value }));

      // Clear error if fixing effective date
      if (field === "effectiveDate" && errors.effDate && value) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.effDate;
          return newErrors;
        });
      }
    },
    [errors.effDate]
  );

  const validateEffectiveForm = useCallback((formData: effectiveForm) => {
    const newErrors: Record<string, string> = {};

    if (formData.type === "special" && !formData.effectiveDate) {
      newErrors.effDate = "Effective Date is required";
    } else if (formData.effectiveDate && !/^\d{4}-\d{2}-\d{2}$/.test(formData.effectiveDate)) {
      newErrors.effDate = "Effective Date must be in format YYYY-MM-DD";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const handleConfirm = useCallback(() => {
    const isValid = validateEffectiveForm(effectiveForm);

    if (!isValid) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    if (onSubmitSuccess) {
      onSubmitSuccess(effectiveForm.type, effectiveForm.effectiveDate, effectiveForm.expiryDate);
    }
    onClose();
  }, [effectiveForm, validateEffectiveForm, onSubmitSuccess, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="container-fixed max-w-lg flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-medium">Effective Type</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 space-y-5 flex flex-col">
          <div className="flex items-start gap-4 flex-col">
            <div className="flex flex-col gap-6">
              {/* Radio Buttons */}
              <div className="flex flex-row space-x-4 items-center">
                <label className="text-sm font-medium w-32">
                  <span className="text-red-500">*</span>Effective Type
                </label>
                <div className="flex flex-row items-center gap-1">
                  <div className="p-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="effective_type"
                      checked={effectiveForm.type === "immediately"}
                      onChange={() => handleTypeChange("immediately")}
                      value="immediately"
                    />
                    <span className="ml-2">Immediately</span>
                      </label>
                  </div>

                  <div className="p-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="effective_type"
                      value="special"
                      checked={effectiveForm.type === "special"}
                      onChange={() => handleTypeChange("special")}
                      />
                    <span className="ml-2">Special Date</span>
                      </label>
                  </div>
                </div>
              </div>

              {/* Effective Date - Conditional */}
              {effectiveForm.type === "special" && (
                <div className="flex items-center gap-4 flex-row">
                  <div className="whitespace-nowrap items-center text-sm font-medium w-32 flex flex-row">
                    <label className="text-red-500 mr-1">*</label> Effective Date
                  </div>

                  <div className="flex flex-col w-full">
                    <label
                      className={`flex items-center gap-2 w-full ${
                        errors.effDate ? "border-red-500 border-2 rounded" : ""
                      }`}
                    >
                      <input
                        type="date"
                        placeholder="yyyy-mm-dd"
                        value={effectiveForm.effectiveDate}
                        onChange={(e) => handleDateChange("effectiveDate", e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      />
                    </label>
                    {errors.effDate && <span className="text-red-500 text-xs mt-1">{errors.effDate}</span>}
                  </div>
                </div>
              )}

              {/* Expiry Date */}
              <div className="flex items-center gap-4 flex-row">
                <label className="whitespace-nowrap items-center text-sm font-medium w-32 flex flex-row">
                  Expiry Date
                </label>
                <input
                  type="date"
                  placeholder="yyyy-mm-dd"
                  value={effectiveForm.expiryDate}
                  onChange={(e) => handleDateChange("expiryDate", e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end items-center gap-4 mt-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// BLOCK SALES CATEGORY SIDE - MAIN COMPONENT
const BlockSalesCategorySide = ({ onSubmitSuccess, onUpdatingSuccess }: blockProps) => {
  const { GetData, PostData, DeleteData, PutData } = useCallApi();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  // ADD DATA
  const validateForm = (formData: any) => {
    const newErrors: Record<string, string> = {};
    // console.log(formData);

    // Validasi Category Name
    if (!formData.offerCatg.offerCatgName || formData.offerCatg.offerCatgName.trim() === "") {
      newErrors.offerCatgName = "Category Name is required";
    }

    // Validasi Effective Date
    if (!formData.offerCatg.effDate) {
      newErrors.effDate = "Effective Date is required";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.offerCatg.effDate)) {
      newErrors.effDate = "Effective Date must be in format YYYY-MM-DD";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(
    async (formData: any) => {
      // console.log(formData);
      if (!validateForm(formData)) {
        toast.error("Please fill in all required fields");
        return false;
      }

      setIsSubmitting(true);
      setErrors({});
      setAlert({ show: false, message: "" });

      try {
        const response = await PostData(`${API_URL_OFFER}/offer/category/add-offer-catg`, formData);

        if (response?.status) {
          toast.success("Category created successfully!");
          if (onSubmitSuccess) onSubmitSuccess();
          return true;
        } else {
          const errorMessage = response?.message || "Failed to create category. Please try again.";
          toast.error(errorMessage);
          setAlert({
            show: true,
            message: errorMessage,
          });
          return false;
        }
      } catch (error: any) {
        const errorMessage = error?.message || "Something went wrong. Please try again.";
        console.error("❌ Error creating category:", error);
        toast.error(errorMessage);
        setAlert({ show: true, message: errorMessage });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [PostData, onSubmitSuccess]
  );

  //UPDATE DATA
  const handleEdit = useCallback(
    async (formData: any) => {
      if (!validateForm(formData)) {
        toast.error("Please fill in all required fields");
        return false;
      }

      setIsUpdating(true);
      setErrors({});
      setAlert({ show: false, message: "" });

      try {
        const response = await PutData(`${API_URL_OFFER}/offer/category/mod-offer-catg`, formData);

        if (response?.status) {
          toast.success("Category update successfully!");
          if (onUpdatingSuccess) onUpdatingSuccess();
          return true;
        } else {
          const errorMessage = response?.message || "Failed to update category. Please try again.";
          toast.error(errorMessage);
          setAlert({
            show: true,
            message: errorMessage,
          });
          return false;
        }
      } catch (error: any) {
        const errorMessage = error?.message || "Something went wrong. Please try again.";
        console.error("❌ Error creating category:", error);
        toast.error(errorMessage);
        setAlert({ show: true, message: errorMessage });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [PutData, onUpdatingSuccess]
  );

  // DELETE DATA
  const deleteData = useCallback(
    async (offerCatgId: string) => {
      if (!offerCatgId) {
        toast.error("No category selected");
        return false;
      }

      setIsDeleting(true);

      try {
        const response = await DeleteData(`${API_URL_OFFER}/offer/category/del-offer-catg/${offerCatgId}`, {});

        if (response?.status) {
          setAlert({ show: false, message: "" });
          toast.success("Successfully deleted category");
          return true;
        } else {
          const errorMessage = response?.message || "Failed to delete category";
          setAlert({ show: true, message: errorMessage });
          toast.error(errorMessage);
        }
      } catch (error: any) {
        console.error("💥 Delete error:", error);
        const errorMessage = error?.message || "An error occurred while deleting";
        setAlert({ show: true, message: errorMessage });
        toast.error(errorMessage);
      } finally {
        setIsDeleting(false);
      }
    },
    [DeleteData]
  );

  const renderDeleteDialog = (isOpen: boolean, onClose: () => void, offerCatgId?: string, onSuccess?: () => void) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <DialogHeader className="p-0 border-0 block">
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">You will delete the category</span>
          </Alert>
        </DialogHeader>
        <DialogFooter className="flex justify-end items-center gap-4 mt-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={async () => {
              if (offerCatgId) {
                const success = await deleteData(offerCatgId);
                if (success) {
                  onClose();
                  if (onSuccess) onSuccess();
                }
              }
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return {
    handleSubmit,
    handleEdit,
    renderDeleteDialog,
    isSubmitting,
    isDeleting,
    errors,
    clearErrors: () => setErrors({}),
    deleteData,
  };
};

export default BlockSalesCategorySide;