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

const DeleteSideBar = () => {
  const {
    showDeleteSideBar,
    handleDeleteSideBar,
    selectedCategoryId,
    selectedCategory,
    refreshCategorySidebar
    // refreshData
  } = useMainProductOfferListContext();

  const { DeleteData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [isDeleting, setIsDeleting] = useState(false); // ✅ ADDED: Loading state
  const { reload } = useDataGrid();

  const doDeleteSideBar = useCallback(async () => {

    if (!selectedCategoryId) {
      toast.error("No category selected");
      return;
    }

    setIsDeleting(true);

    try {
      const deleteUrl = `${API_URL_OFFER}/offer/category/del-offer-catg/${selectedCategoryId}`;

      const response = await DeleteData(deleteUrl, {});

      if (response?.status) {
        setAlert({ show: false, message: "" });
        handleDeleteSideBar(false, null, null);
        toast.success(`Successfully deleted category: ${selectedCategory}`);

        // Refresh category sidebar data
        // console.log("🔄 Refreshing category sidebar after delete...");
        await refreshCategorySidebar();
        
        reload();
        const createActivity = {
          module: "Manage Category Content",
          description: `Delete Category Content => ${selectedCategory} (ID: ${selectedCategoryId})`,
          action: "D",
        };
        doSaveLogActivity(createActivity);
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
    selectedCategoryId,
    selectedCategory,
    DeleteData,
    handleDeleteSideBar,
    reload,
    // refreshData,
  ]);


  return (
    <Dialog
      open={showDeleteSideBar}
      onOpenChange={(open) => !isDeleting && handleDeleteSideBar(open, null)} // ✅ FIXED: Prevent close while deleting
    >
      <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <DialogHeader className="p-0 border-0 block">
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">
              You will delete the category "{selectedCategory || "Unknown"}"
              {selectedCategoryId && ` (ID: ${selectedCategoryId})`}
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
            onClick={() => handleDeleteSideBar(false, null)}
            disabled={isDeleting} // ✅ ADDED: Disable while deleting
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              doDeleteSideBar();
            }}
            disabled={isDeleting || !selectedCategoryId}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSideBar;
