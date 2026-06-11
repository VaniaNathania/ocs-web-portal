import React, { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useFeatureHooks } from "@/pages/main-menu/offer/subscription-plan/hooks/useFeatureHooks";

interface FeatureDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedFeature: any;
}

const API_URL_OFFER = apiConfigOffer.offer;

const FeatureDeleteDialog: React.FC<FeatureDeleteDialogProps> = ({ isOpen, onClose, onSuccess, selectedFeature }) => {
  const { DeleteData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const { setIsSubmiting } = useFeatureHooks();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const doDeleteDialog = useCallback(async () => {
    const attrId = selectedFeature.attrId;
    if (!attrId) return;
    setIsLoading(true);

    try {
      const response = await DeleteData(`${API_URL_OFFER}/offer/attr/del-attr/${attrId}`, {
        attrId: attrId,
      });

      if (response?.status) {
        setAlert({ show: false, message: "" });
        toast.success(`Successfully deleted feature: ${selectedFeature.attrName}`);

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
      setIsLoading(false);
    }
  }, [selectedFeature, DeleteData, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">You will delete This feature! This action cannot be undone.</span>
          </Alert>
        </DialogHeader>

        <DialogFooter className="flex justify-end items-center gap-4 mt-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={() => {
              doDeleteDialog();
            }}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeatureDeleteDialog;
