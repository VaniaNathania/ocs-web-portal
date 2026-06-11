import { apiConfigOffer, apiConfigRole } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { Alert, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { usePortalList } from "../hook/usePortalList";
import { usePortalLayout } from "@/layouts/main-menu/portal-management";

const API_URL = apiConfigRole.role;

const DeleteDialog = () => {
  const { showDeleteDialog, handleDeleteDialog, selectedRow } =
    usePortalLayout();
  const { fetchRows } = usePortalList();

  const { DeleteData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const doDeleteSideBar = useCallback(async () => {
    if (!selectedRow?.portalId) {
      toast.error("No category selected");
      return;
    }

    setIsDeleting(true);

    try {
      const deleteUrl = `${API_URL}/api/portals/del-portal/${selectedRow.portalId}`;

      const response = (await DeleteData(deleteUrl, {})) ?? {
        status: true,
        message: "Deleted (fallback 204)",
      };

      handleDeleteDialog(false, null);
      if (response?.status) {
        setAlert({ show: false, message: "" });
        toast.success(`Successfully deleted Role: ${selectedRow.portalName}`);
      } else {
        const errorMessage =
          `Delete error: ${response?.message}` || "Failed to delete category";
        setAlert({ show: true, message: errorMessage });
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("💥 Delete error:", error);
      const errorMessage =
        `Delete error: ${error?.message}` || "An error occurred while deleting";
      setAlert({ show: true, message: errorMessage });
      handleDeleteDialog(false, null);

      toast.error(errorMessage);
    } finally {
      fetchRows();

      setIsDeleting(false);
    }
  }, [selectedRow, DeleteData, handleDeleteDialog]);

  useEffect(() => {
    if (!showDeleteDialog) {
      setAlert({ show: false, message: "" });
    }
  }, [showDeleteDialog]);

  return (
    <Dialog
      open={showDeleteDialog}
      onOpenChange={(open) => !isDeleting && handleDeleteDialog(open, null)}
    >
      <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-0 border-0 block">
          <DialogTitle className="text-xl">Delete Confirmation</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>

        <Alert variant="warning">
          <h3 className="text-lg">Are you sure?</h3>
          <span className="text-sm">
            You will delete the role "{selectedRow?.portalName || "Unknown"}"
            {selectedRow?.portalId && ` (ID: ${selectedRow.portalId})`}
          </span>
        </Alert>

        {alert.show && (
          <Alert variant="danger">
            <h3>{alert.message}</h3>
          </Alert>
        )}

        <DialogFooter className="flex justify-end items-center gap-4 mt-3">
          <Button
            variant="outline"
            onClick={() => handleDeleteDialog(false, null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={doDeleteSideBar}
            disabled={isDeleting || !selectedRow?.portalId}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
      {alert.show && (
        <Alert variant="danger">
          <h3>{alert.message}</h3>
        </Alert>
      )}
    </Dialog>
  );
};

export default DeleteDialog;
