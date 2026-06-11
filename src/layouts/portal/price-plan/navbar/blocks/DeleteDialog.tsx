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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert } from "@mui/material";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteDialogProps {
  show: boolean;
  onClose: () => void;
  offerId?: string | number;
  selectedOfferVerId: number | null;
  setSelectedOfferVerId: React.Dispatch<React.SetStateAction<number | null>>;
  onDeleteSuccess?: () => void;
}

const API_URL = apiConfig.service_price_plan;

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  show,
  onClose,
  onDeleteSuccess,
  offerId,
  selectedOfferVerId,
  setSelectedOfferVerId,
}) => {
  const { GetData, PostData, PutData, DeleteData } = useCallApi();
  const [isDeleting, setIsDeleting] = useState(false);

  const doDelete = async () => {
    if (!selectedOfferVerId) {
      toast.error("No version selected for deletion");
      return;
    }

    setIsDeleting(true);
    try {
      // Using the selectedOfferVerId for deletion instead of offerId
      const response = await DeleteData(
        `${API_URL}/priceplan/version/delete/${selectedOfferVerId}`,
        {}
      );

      if (response?.status) {
        toast.success("Version deleted successfully");
        onDeleteSuccess?.(); // Call the success callback to refresh data
        onClose();
        setIsDeleting(false);
        setSelectedOfferVerId(null);
      } else {
        toast.error(response?.message || "Failed to delete version");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting version");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="container-fixed max-w-md z-[1000] flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogHeader className="block p-0 border-0">
          <DialogTitle className="text-lg">Delete Version</DialogTitle>
          <DialogDescription className="text-sm">
            Are you sure you want to delete Version {selectedOfferVerId}?
          </DialogDescription>
          <Alert severity="warning" className="mt-3">
            <div>
              <h3 className="text-lg font-semibold">Are you sure?</h3>
              <span className="text-sm">
                You will delete Version {selectedOfferVerId}. This action cannot
                be undone!
              </span>
            </div>
          </Alert>
        </DialogHeader>
        <DialogFooter className="flex items-center justify-end gap-4 mt-4">
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={doDelete}
            disabled={isDeleting || !selectedOfferVerId}
          >
            {isDeleting ? (
              <>
                <KeenIcon icon="loading" className="mr-2 animate-spin" />
                Deleting...
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

export { DeleteDialog };
