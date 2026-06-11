import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import useAccountBalanceContext from "../../account-balanceType/hooks/useAccountBalanceContext";
import useAccountItemContext from "../hooks/useAccountItemContext";
import { KeenIcon, useDataGrid } from "@/components";
import { useEffect, useState } from "react";
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

const API_URL = apiConfig.service_price_plan;

const DeleteDialog = () => {
  const { PostData, DeleteData } = useCallApi();
  const {
    handleDeleteDialog,
    selectedDelete,
    showDeleteConfirm,
  } = useAccountItemContext();
  const { reload } = useDataGrid();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    handleDeleteDialog(false, null, "accountItem");
  };

  const handleSubmit = async () => {
    if (!selectedDelete) {
      toast.error("No item selected for deletion");
      return;
    }

    setIsSubmitting(true);
    try {
      await doDeleteAccountItem();
    } finally {
      setIsSubmitting(false);
    }
  };

  const doDeleteAccountItem = async () => {
    try {
      const response = await DeleteData(`${API_URL}/account-item-type/delete?acctItemTypeId=${selectedDelete}`, {

      });
      
      if (response?.status) {
        toast.success("Account Item Type deleted successfully");
        handleDeleteDialog(false, null, "accountItem");
        reload();
      } else {
        toast.error(response?.message || "Failed to delete Account Item Type");
      }
    } catch (error) {
      console.error("Error deleting account item:", error);
      toast.error("Failed to delete Account Item Type");
    }
  };

  return (
    <Dialog
      open={showDeleteConfirm.show}
      onOpenChange={(open) => {
        if (!open) {
          handleDeleteDialog(false, null, "accountItem");
        }
      }}
    >
     <DialogContent className="container-fixed max-w-[1080px] flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-5 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex items-center justify-between flex-wrap grow">
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                Add Account Item Type
              </h1>
              <div className="flex items-center gap-2 text-sm font-normal text-gray-700"></div>
            </div>
            <div
              className="cursor-pointer hover:opacity-100 opacity-50"
              onClick={() => {
                handleDeleteDialog(false, null, "accountItem");
              }}
            >
              <KeenIcon icon="cross" className="text-1.5xl" />
            </div>
          </div>
        </DialogHeader>
        
        <DialogBody className="px-5 pb-5">
          <div className="space-y-4">
            {/* Warning Message */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <KeenIcon
                  icon="warning-2"
                  className="text-red-500 text-lg mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Are you sure you want to delete this Account Item Type?
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    This action cannot be undone and will permanently remove the account item type from the system.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </div>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;