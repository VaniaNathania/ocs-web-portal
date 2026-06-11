import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useZoneMainListContext } from "../hooks/useZoneContext";
import { Alert } from "@/components";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";

const API_URL_REF = apiConfigRef.ref;

const DeleteBatchZoneDetail = () => {
  const { DeleteData } = useCallApi();
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    handleDeleteBatchZoneDetail,
    showDeleteBatchZoneDetail,
    setShowDeleteBatchZoneDetail,
    selectedZonesToDelete,
    onSubmitSuccess,
  } = useZoneMainListContext();

  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const handleDeleteData = useCallback(async () => {
    if (!selectedZonesToDelete || selectedZonesToDelete.length === 0) {
      toast.error("No zones selected for deletion");
      return;
    }

    setIsDeleting(true);
    setAlert({ show: false, message: "" });

    try {
      // Build query string with multiple zoneId parameters
      const zoneIds = selectedZonesToDelete.map(zone => zone.zoneId);
      const queryParams = zoneIds.map(id => `zoneId=${id}`).join('&');
      
      const response = await DeleteData(
        `${API_URL_REF}/api/zone/del-batch-del?${queryParams}`,
        {}
      );

      if (response?.status) {
        toast.success(`Successfully deleted ${selectedZonesToDelete.length} zone(s)`);
        onSubmitSuccess();
        setShowDeleteBatchZoneDetail(false);
        return true;
      } else {
        const errorMessage = response?.message || "Failed to delete zones";
        setAlert({ show: true, message: errorMessage });
        toast.error(errorMessage);
      }
    } catch (error: any) {
      // console.error("💥 Delete error:", error);
      const errorMessage = error?.message || "An error occurred while deleting zones";
      setAlert({ show: true, message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [DeleteData, selectedZonesToDelete, onSubmitSuccess, setShowDeleteBatchZoneDetail]);

  const handleCancel = () => {
    setShowDeleteBatchZoneDetail(false);
    setAlert({ show: false, message: "" });
  };

  return (
    <Dialog open={showDeleteBatchZoneDetail} onOpenChange={handleDeleteBatchZoneDetail}>
      <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <DialogHeader className="p-0 border-0 block">
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">
              You will delete {selectedZonesToDelete?.length || 0} zone(s):
            </span>
          </Alert>
          
          {/* List of zones */}
          {selectedZonesToDelete && selectedZonesToDelete.length > 0 && (
            <div className="mt-3 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
              <ul className="space-y-1">
                {selectedZonesToDelete.map((zone) => (
                  <li key={zone.zoneId} className="text-sm text-gray-700">
                    • {zone.zoneName || `Zone ${zone.zoneId}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {alert.show && (
            <Alert variant="danger" className="mt-3">
              <h3>{alert.message}</h3>
            </Alert>
          )}
        </DialogHeader>
        <DialogFooter className="flex justify-end items-center gap-4 mt-3">
          <Button variant="outline" onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteData}
            disabled={isDeleting || !selectedZonesToDelete || selectedZonesToDelete.length === 0}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBatchZoneDetail;
