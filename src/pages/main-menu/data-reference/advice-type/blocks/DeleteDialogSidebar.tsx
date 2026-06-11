import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";
import { Alert } from "@/components";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";

const API_URL_REF = apiConfigRef.ref;

const ERROR_MESSAGE_MAP: Record<string, string> = {
  "S-CNT-30002": "Sub-category children cannot be deleted because this category has data.",
};

const DeleteDialogSidebar = () => {
  const { DeleteData } = useCallApi();
  const { showDeleteSideBar, setShowDeleteSidebar, selectedSubChildrenSide, selectedChildrenSide, setSelectedSubChildrenSide, fetchingListContent, reloadSubChildren } = useAdviceTypeContext();
  const [isDeleting, setIsDeleting] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const handleDeleteSidebar = useCallback(async () => {
    if (!selectedSubChildrenSide?.adviceTypeSortId) {
      toast.error("No category selected for deletion");
      return;
    }

    setIsDeleting(true);
    setAlert({ show: false, message: "" });

    // console.log("before call api:", {
    //   selectedSubChildrenSide,
    // });

    try {
      const response = await DeleteData(`${API_URL_REF}/api/advice-type/del-advice-type-sort/${selectedSubChildrenSide?.adviceTypeSortId}`, {
        adviceTypeSortId: selectedSubChildrenSide?.adviceTypeSortId,
      });

      // console.log("ini response :", response);

      if (response?.status) {
        toast.success("Successfully deleted category");
        setShowDeleteSidebar(false);
        await fetchingListContent();

        const currentChildValue = selectedChildrenSide?.value || selectedSubChildrenSide?.adviceCatg;

        if (currentChildValue) {
          await reloadSubChildren(currentChildValue);
        }

        setSelectedSubChildrenSide(null);
        return true;
      } else {
        const errorMessage = response?.message?.includes("S-CNT-30002") ? ERROR_MESSAGE_MAP["S-CNT-30002"] : "Failed to delete category";
        setAlert({ show: true, message: errorMessage });
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("❌ Delete error:", error);
      const errorMessage = error?.message || "An error occured while deleting";
      setAlert({ show: true, message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [DeleteData, selectedSubChildrenSide, setShowDeleteSidebar, reloadSubChildren]);

  return (
    <Dialog open={showDeleteSideBar} onOpenChange={setShowDeleteSidebar}>
      <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <DialogHeader className="p-0 border-0 block">
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">You will delete "{selectedSubChildrenSide?.adviceTypeSortName}"</span>
          </Alert>
          {/* {alert.show && (
            <Alert variant="danger">
              <h3>{alert.message}</h3>
            </Alert>
          )} */}
        </DialogHeader>
        <DialogFooter className="flex justify-end items-center gap-4 mt-3">
          <Button variant="outline" onClick={() => setShowDeleteSidebar(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteSidebar} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialogSidebar;
