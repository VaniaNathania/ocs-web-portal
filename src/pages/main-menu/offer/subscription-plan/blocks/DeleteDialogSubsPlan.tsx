import { apiConfigOffer } from "@/config/api.config";
import { useSubscriptionPlanOfferListContext } from "../hooks/useSubscriptionPlanOfferListContext";
import { useCallApi } from "@/hooks";
import { useCallback, useState } from "react";
import { Alert, useDataGrid } from "@/components";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteDialogSubsPlanProps {
  isOpen: boolean;
  onClose: () => void;
  subsPlanId: number | null;
  subsPlanName?: string | null;
  onSuccess: () => void;
}

const API_URL_OFFER = apiConfigOffer.offer;

const DeleteDialogSubsPlan = ({ subsPlanId, onSuccess, isOpen, onClose, subsPlanName }: DeleteDialogSubsPlanProps) => {
  const { refreshSubsPlanSection } = useSubscriptionPlanOfferListContext();
  const { DeleteData } = useCallApi();
  const [loading, setLoading] = useState(false);
  // const { reload } = useDataGrid();

  const doDeleteSubsPlan = useCallback(async () => {
    if (!subsPlanId) {
      toast.error("No Category selected");
      return;
    }

    setLoading(true);

    try {
      const response = await DeleteData(`${API_URL_OFFER}/offer/subs-plan/del-subs-plan/${subsPlanId}`, {});

      if (response?.status) {
        toast.success("Subscription Plan deleted successfully!");
        refreshSubsPlanSection();
        onClose();
      } else {
        toast.error(response?.message || "Failed to delete subscription plan");
      }
    } catch (error: any) {
      console.error("❌ Error delete:", error);
      toast.error(error?.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  }, [DeleteData, subsPlanId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <DialogHeader className="p-0 border-0 block">
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">You will delete the subscription plan"{subsPlanName}</span>
          </Alert>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              doDeleteSubsPlan();
            }}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialogSubsPlan;
