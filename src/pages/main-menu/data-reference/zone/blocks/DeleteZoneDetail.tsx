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

const DeleteZoneDetail = () => {
  const { DeleteData } = useCallApi();
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    handleDeleteZoneDetail,
    showDeleteZoneDetail,
    setShowDeleteZoneDetail,
    selectedChildrenSide,
    onSubmitSuccess,
  } = useZoneMainListContext();

  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const handleDeleteData = useCallback(async () => {
    if (!selectedChildrenSide?.zoneId) {
      toast.error("No zone selected for deletion");
      return;
    }

    setIsDeleting(true);
    setAlert({ show: false, message: "" });

    try {
      const response = await DeleteData(`${API_URL_REF}/api/zone/del-zone?zoneId=${selectedChildrenSide.zoneId}`, {});

      if (response?.status) {
        toast.success("Successfully deleted zone detail");
        onSubmitSuccess();
        setShowDeleteZoneDetail(false);
        return true;
      } else {
        const errorMessage = response?.message || "Failed to delete zone detail";
        setAlert({ show: true, message: errorMessage });
        toast.error(errorMessage);
      }
    } catch (error: any) {
      // console.error("💥 Delete error:", error);
      const errorMessage = error?.message || "An error occurred while deleting";
      setAlert({ show: true, message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [DeleteData, selectedChildrenSide, onSubmitSuccess, setShowDeleteZoneDetail]);

  const handleCancel = () => {
    setShowDeleteZoneDetail(false);
    setAlert({ show: false, message: "" });
  };

  return (
    <Dialog open={showDeleteZoneDetail} onOpenChange={handleDeleteZoneDetail}>
      <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <DialogHeader className="p-0 border-0 block">
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">You will delete zone: {selectedChildrenSide?.zoneName || "Unknown"}</span>
          </Alert>
          {alert.show && (
            <Alert variant="danger">
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
            disabled={isDeleting || !selectedChildrenSide?.zoneId}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteZoneDetail;
