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
import { Alert } from "@/components";
import { Button } from "@/components/ui/button";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { useRoleList } from "../hook/useRolesList";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

const DeleteDialog = () => {
  const { showDeleteDialog, handleDeleteDialog, selectedRow } = useRoleLayout();
  const { fetchRoles, roles } = useRoleList();

  const { DeleteData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const doDeleteSideBar = useCallback(async () => {
    if (!selectedRow?.roleId) {
      toast.error("No category selected");
      return;
    }

    setIsDeleting(true);

    try {
      const deleteUrl = `${API_ROLE}/api/roles/prod/roles/${selectedRow.roleId}`;

      const response = (await DeleteData(deleteUrl, {})) ?? {
        status: true,
        message: "Deleted (fallback 204)",
      };

      handleDeleteDialog(false, null);
      if (response?.status) {
        setAlert({ show: false, message: "" });
        if (response.message.includes("Fail"))
          return toast.error(response.message);
        return toast.success(
          `Successfully deleted Role: ${selectedRow.roleName}`,
        );

        // const createActivity = {
        //   module: "Manage Role Management",
        //   description: `Delete Role => ${selectedRow.roleName} (ID: ${selectedRow.roleId})`,
        //   action: "D",
        // };
        // doSaveLogActivity(createActivity);
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
      handleDeleteDialog(false, roles[0]);

      toast.error(errorMessage);
    } finally {
      fetchRoles();

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
            You will delete the role "{selectedRow?.roleName || "Unknown"}"
            {selectedRow?.roleId && ` (ID: ${selectedRow.roleId})`}
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
            disabled={isDeleting || !selectedRow?.roleId}
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
