import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";

interface DeleteBatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedBatch: any;
}

const API_URL_OFFER = apiConfigOffer.offer;

const DeleteBatchDialog: React.FC<DeleteBatchDialogProps> = ({ isOpen, onClose, onSuccess, selectedBatch }) => {
  const { DeleteData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const baseAttrId = selectedBatch?.baseAttrId;
  const attrValueId = selectedBatch?.attrValueId;
  const valueMark = selectedBatch?.valueMark;

  const doDeleteDialog = useCallback(async () => {
    if (selectedBatch?.isNew || !selectedBatch?.attrValueId) {
      toast.success("Success");
      onSuccess?.();
      onClose?.();
      return;
    }

    try {
      const response = await DeleteData(`${API_URL_OFFER}/offer/attr/del-attr-value`, {
        baseAttrId: baseAttrId,
        attrValueId: attrValueId,
      });

      if (response?.status) {
        setAlert({ show: false, message: "" });
        toast.success(`Successfully deleted feature: ${valueMark}`);

        onSuccess?.();

        onClose?.();
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
    }
  }, [selectedBatch, DeleteData, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">You will delete This feature value! This action cannot be undone.</span>
          </Alert>
        </DialogHeader>

        <DialogFooter className="flex justify-end items-center gap-4 mt-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              doDeleteDialog();
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBatchDialog;
