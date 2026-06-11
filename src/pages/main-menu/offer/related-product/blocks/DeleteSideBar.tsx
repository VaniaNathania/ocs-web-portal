import { apiConfig, apiConfigOffer } from "@/config/api.config";
import { useRelatedProductOfferListContext } from "../hooks/useRelatedProductOfferListContext";
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
    refreshCategorySideBar,
    categorySideBar,
    setSelectedCategoryId,
    setSelectedCategory,
    handleCategoryClick,
    setShowDetailView
  } = useRelatedProductOfferListContext();

  const { DeleteData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
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
        toast.success(`Successfully deleted category`);
        
        // Refresh category sidebar terlebih dahulu
        await refreshCategorySideBar();

        // Tunggu sebentar agar data categorySideBar ter-update
        setTimeout(() => {
          // Cek apakah masih ada data di categorySideBar
          if (categorySideBar && categorySideBar.length > 0) {
            // Ambil data parent pertama
            const firstCategory = categorySideBar[0];
            const firstCategoryId = firstCategory.offerCatgId.toString();
            const firstCategoryName = firstCategory.offerCatgName;

            // Set kategori pertama sebagai active
            setSelectedCategoryId(firstCategoryId);
            setSelectedCategory(firstCategoryName);
            
            // Panggil handleCategoryClick untuk membuka kategori pertama
            handleCategoryClick(firstCategoryId, firstCategoryName);
            
            // Reset detail view
            setShowDetailView(false);
          } else {
            // Jika tidak ada data, reset semua
            setSelectedCategoryId(null);
            setSelectedCategory(null);
            setShowDetailView(false);
          }

          // Force reload DataGrid
          reload();
        }, 200);

        // Optional: Log activity
        // const createActivity = {
        //   module: "Manage Category Content",
        //   description: `Delete Category Content => ${selectedCategory} (ID: ${selectedCategoryId})`,
        //   action: "D",
        // };
        // doSaveLogActivity(createActivity);
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
    refreshCategorySideBar,
    categorySideBar,
    setSelectedCategoryId,
    setSelectedCategory,
    handleCategoryClick,
    setShowDetailView,
    reload,
  ]);

  return (
    <Dialog open={showDeleteSideBar} onOpenChange={(open) => !isDeleting && handleDeleteSideBar(open, null)}>
      <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <DialogHeader className="p-0 border-0 block">
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">You will delete the category "{selectedCategory || "Unknown"}"</span>
          </Alert>
          {alert.show && (
            <Alert variant="danger">
              <h3>{alert.message}</h3>
            </Alert>
          )}
        </DialogHeader>
        <DialogFooter className="flex justify-end items-center gap-4 mt-3">
          <Button variant="outline" onClick={() => handleDeleteSideBar(false, null)} disabled={isDeleting}>
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