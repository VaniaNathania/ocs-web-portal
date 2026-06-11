import { apiConfig, apiConfigOffer } from "@/config/api.config";
import { useMainProductOfferListContext } from "../hooks";
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

const API_URL_OFFER = apiConfigOffer.offer;

const DeleteDialog = () => {
  const {
    showDeleteDialog,
    handleDeleteDialog,
    selectedCategory,
    refreshCategorySidebar,
    setRefreshOfferListSidebar,
    selectedCategoryId,
  } = useMainProductOfferListContext();

  const { DeleteData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const { reload } = useDataGrid();

  const doDeleteSideBar = useCallback(async () => {
    if (!selectedCategory) {
      toast.error("No category selected");
      return;
    }

    setIsDeleting(true);

    try {
      const deleteUrl = `${API_URL_OFFER}/offer/indep/del-indep-prod-spec/${selectedCategory}`;

      const response = await DeleteData(deleteUrl, {}) ?? { status: true, message: "Deleted (fallback 204)" };

      if (response?.status) {
        setAlert({ show: false, message: "" });
        handleDeleteDialog(false, null);
        toast.success(`Successfully deleted category: ${selectedCategory}`);
        await refreshCategorySidebar();
 
         reload();

         setRefreshOfferListSidebar(selectedCategoryId);

        const createActivity = {
          module: "Manage Category Content",
          description: `Delete Category Content => ${selectedCategory} (ID: ${selectedCategory})`,
          action: "D",
        };
        doSaveLogActivity(createActivity);
        // console.log('api response',response);
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
      setIsDeleting(false);
    }
  }, [
    selectedCategory,
    selectedCategory,
    DeleteData,
    handleDeleteDialog,
    reload, // ✅ SIMPLE: Hanya reload dependency
  ]);

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
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <DialogHeader className="p-0 border-0 block">
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">
              You will delete the category "{selectedCategory || "Unknown"}"
              {selectedCategory && ` (ID: ${selectedCategory})`}
            </span>
          </Alert>
          {alert.show && (
            <Alert variant="danger">
              <h3>{alert.message}</h3>
            </Alert>
          )}
        </DialogHeader>
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
            onClick={() => {
              doDeleteSideBar();
            }}
            disabled={isDeleting || !selectedCategory}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
