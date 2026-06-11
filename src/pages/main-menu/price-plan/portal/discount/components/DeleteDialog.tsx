import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type DeleteConfirm = {
  show: boolean;
  selectedDelete: number | null;
};

interface DeleteDialogProps {
  showDeleteConfirm: DeleteConfirm;
  setShowDeleteConfirm: ({ show, selectedDelete }: DeleteConfirm) => void;
  doDeleteDiscount: (discountId: number) => void;
  isSubmitting?: boolean;
}

const DeleteDialog = ({
  showDeleteConfirm,
  setShowDeleteConfirm,
  doDeleteDiscount,
  isSubmitting,
}: DeleteDialogProps) => {
  const handleCancel = () => {
    if (isSubmitting) return;
    setShowDeleteConfirm({
      show: false,
      selectedDelete: null,
    });
  };

  const handleConfirm = () => {
    const { selectedDelete } = showDeleteConfirm;

    // Simple validation - parent will handle the rest
    if (selectedDelete) {
      doDeleteDiscount(selectedDelete);
    }
  };

  if (!showDeleteConfirm.show) {
    return null;
  }

  return (
    <Dialog
      open={showDeleteConfirm.show}
      onOpenChange={(open) => !open && handleCancel()}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex flex-col p-5 px-5">
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
            <h1 className="mb-5 text-lg font-semibold">Delete Discount</h1>
            <p className="text-sm">
              Are you sure want to delete this discount price? This action
              cannot be undone.
            </p>
          </div>
        </DialogHeader>

        <DialogFooter className="flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowDeleteConfirm({
                show: true,
                selectedDelete: showDeleteConfirm.selectedDelete,
              });
              handleConfirm();
            }}
            className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
