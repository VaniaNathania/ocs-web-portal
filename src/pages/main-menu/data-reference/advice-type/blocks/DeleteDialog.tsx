import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";
import { Alert } from "@/components";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { adviceTypeContentProps, initialPropsAdviceTypeContent } from "../hooks/AdviceTypeContext";
import { toast } from "sonner";

const API_URL_REF = apiConfigRef.ref;

const DeleteDialog = () => {
  const { DeleteData } = useCallApi();
  const {
    showDeleteDialog,
    setShowDeleteDialog,
    fetchingListContent,
    selectedContent,
    setShowDetailContent,
    setIsAddingData,
    setSelectedContent,
    setFormData,
  } = useAdviceTypeContext();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    setIsAddingData(true);
    try {
      const response = await DeleteData(
        `${API_URL_REF}/api/advice-type/del-advice-type/${selectedContent?.adviceType}/${selectedContent?.adviceCatg}`,
        {}
      );

      if (response?.status) {
        toast.success("Successfully deleted advice type");
        setShowDetailContent(false);
        setShowDeleteDialog(false);

        setSelectedContent(null);
        setFormData(initialPropsAdviceTypeContent);

        await fetchingListContent();
        setIsAddingData(false);
      } else {
        const errorMessage = response?.message || "Failed to delete advice type";
        toast.error(errorMessage);
        setIsAddingData(false);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
      setIsAddingData(false);
    } finally {
      setIsDeleting(false);
    }
  }, [DeleteData, selectedContent, fetchingListContent, setShowDetailContent, setShowDeleteDialog, setIsAddingData]);

  return (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <DialogHeader className="p-0 border-0 block">
          <Alert variant="warning">
            <h3 className="text-lg font-semibold">Are you sure?</h3>
            <span className="text-sm">You will delete the advice type "{selectedContent?.adviceTypeName}"</span>
          </Alert>
        </DialogHeader>
        <DialogFooter className="flex justify-end items-center gap-4 mt-3">
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
