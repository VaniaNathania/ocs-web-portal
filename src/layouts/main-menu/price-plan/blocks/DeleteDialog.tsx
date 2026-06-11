import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KeenIcon, useDataGrid } from "@/components";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";
import { useState } from "react";
import usePricePlanListContext from "../hooks/usePricePlanContext";

const API_URL = apiConfig.service_price_plan;

export const DeleteDialog = () => {
  const { showDeleteDialog, handleDeleteDialog, selectedPricePlanId } = usePricePlanListContext();
  const { reload } = useDataGrid();

  const { DeleteData } = useCallApi();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!selectedPricePlanId) return;

    try {
      setLoading(true);

      const res = await DeleteData(`${API_URL}/priceplan/delete/${selectedPricePlanId}`, {});

      if (res?.status === true) {
        toast.success(res?.message || "Deleted successfully");
        handleDeleteDialog(false);
        reload();
      } else {
        toast.error(res?.message || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting price plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showDeleteDialog} onOpenChange={handleDeleteDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-xl font-semibold text-red-600">Delete Price Plan</DialogTitle>

            <DialogDescription className="text-sm text-gray-600">Are you sure you want to delete this Price Plan? This action cannot be undone.</DialogDescription>
          </div>
        </DialogHeader>

        <DialogBody className="flex justify-end gap-3 pt-6">
          <Button variant="outline" onClick={() => handleDeleteDialog(false)} disabled={loading}>
            Cancel
          </Button>

          <Button variant="destructive" onClick={handleDelete} disabled={loading} className="flex items-center gap-2">
            <KeenIcon icon="trash" />
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
