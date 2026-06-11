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

const DeleteCycleTypeDialog = () => {
  const {
    handleDeleteDialog,
    showDeleteBasic,
    doGetBillingCycleType,
    selectedBillingCycleType,
    handleBasicRefresh,
    handlerefresh,
  } = useBillingCycleTypeContext();

  const { DeleteData } = useCallApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete single billing cycle
  const doDeleteMono = async (billingCycleId: number) => {
    setIsSubmitting(true);
    try {
      const response = await DeleteData(
        `${API_URL}/billing-cycle/delete/type?billingCycleTypeId=${billingCycleId}`,
        {}
      );
      if (response?.status) {
        toast.success(
          response?.message || "Billing Cycle deleted successfully"
        );
        handleDeleteDialog(false, null);
        // Refresh data setelah delete
        handlerefresh();
      }
    } catch (error) {
      console.error("Error deleting Billing Cycle", error);
      toast.error("Failed to delete Billing Cycle. Please try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = () => {
    if (showDeleteBasic.show === true && showDeleteBasic.id) {
      doDeleteMono(showDeleteBasic.id);
    }
  };

  const handleCancel = () => {
    handleDeleteDialog(false, null);
  };

  return (
    <Dialog
      open={showDeleteBasic.show}
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
                Delete Billing Cycle Type
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                Are you sure you want to delete this billing cycle type? This
                action cannot be undone.
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

export default DeleteCycleTypeDialog;
