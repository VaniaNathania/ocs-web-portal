import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert } from "@/components";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";

interface DeleteVersionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: any | null;
}

const API_URL_OFFER = apiConfigOffer.offer;

const DeleteVersionDialog: React.FC<DeleteVersionDialogProps> = ({ isOpen, onClose, data, onSuccess }) => {
  const { DeleteData } = useCallApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const { reload } = useDataGrid();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const offerVerId = data?.offerVerId;

  const doDeleteDialog = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const response = await DeleteData(`${API_URL_OFFER}/offer/subs-plan/del-subs-plan-ver/${offerVerId}`, {
        offerVerId: offerVerId,
      });

      if (response?.status) {
        setAlert({ show: false, message: "" });
        toast.success(`Successfully deleted version`);

        onSuccess?.();

        onClose?.();
      } else {
        const errorMessage = response?.message || "Failed to delete version";
        setAlert({ show: true, message: errorMessage });
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("💥 Delete error:", error);
      const errorMessage = error?.message || "An error occurred while deleting";
      setAlert({ show: true, message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [data, DeleteData, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">You will delete this version! This action cannot be undone.</span>
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteVersionDialog;
