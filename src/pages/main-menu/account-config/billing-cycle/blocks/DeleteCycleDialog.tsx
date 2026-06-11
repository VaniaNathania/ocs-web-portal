import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCallApi } from "@/hooks";
import { useState } from "react";
import { toast } from "sonner";
import useBillingCycleTypeContext from "../hooks/useBillingCycleTypeContext";
import { apiConfig } from "@/config/api.config";
import { AlertTriangle } from "lucide-react";

const API_URL = apiConfig.service_price_plan;

const DeleteCycleDialog = () => {
  const {
    handleCycleDelete,
    showDeleteConfirm,
    doGetBillingCycleType,
    selectedBillingCycleType,
    handleBasicRefresh,
  } = useBillingCycleTypeContext();

  const { DeleteData } = useCallApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete single billing cycle
  const doDeleteMono = async (billingCycleId: number) => {
    setIsSubmitting(true);
    try {
      const response = await DeleteData(
        `${API_URL}/billing-cycle/delete-single?billingCycleId=${billingCycleId}`,
        {}
      );
      if (response?.status) {
        toast.success(
          response?.message || "Billing Cycle deleted successfully"
        );
        handleCycleDelete(false, null, null, "mono");
        handleBasicRefresh();
      }
    } catch (error) {
      console.error("Error deleting Billing Cycle", error);
      toast.error("Failed to delete Billing Cycle. Please try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete all billing cycles in a type
  const doDeleteMulti = async () => {
    setIsSubmitting(true);
    try {
      const response = await DeleteData(
        `${API_URL}/billing-cycle/delete?billingCycleTypeId=${selectedBillingCycleType?.billingCycleTypeId}`,
        {}
      );
      if (response?.status) {
        toast.success(
          response?.message || "All Billing Cycles deleted successfully"
        );
        handleCycleDelete(false, null, null, "multi");
        // Refresh data setelah delete
        handleBasicRefresh();
      }
    } catch (error) {
      console.error("Error deleting Billing Cycles", error);
      toast.error("Failed to delete Billing Cycles. Please try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = () => {
    if (showDeleteConfirm.mode === "mono" && showDeleteConfirm.basicId) {
      doDeleteMono(showDeleteConfirm.basicId);
    } else if (showDeleteConfirm.mode === "multi" && showDeleteConfirm.typeId) {
      doDeleteMulti();
    }
  };

  const handleCancel = () => {
    handleCycleDelete(false, null, null, "mono");
  };

  return (
    <Dialog
      open={showDeleteConfirm.show}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          handleCancel();
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
            </div>
            <div className="flex-1 space-y-1">
              <DialogTitle className="text-lg">
                {showDeleteConfirm.mode === "mono"
                  ? "Delete Billing Cycle"
                  : "Delete All Billing Cycles"}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {showDeleteConfirm.mode === "mono"
                  ? "Are you sure you want to delete this billing cycle? This action cannot be undone."
                  : "Are you sure you want to delete all billing cycles in this type? This action cannot be undone."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="pt-4 gap-3 sm:gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Deleting...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCycleDialog;
