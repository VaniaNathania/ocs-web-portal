import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteTriggerTypeKey } from "../hooks";

interface DeleteDialogProps {
  showDeleteConfirm: {
    show: boolean;
    deleteType: DeleteTriggerTypeKey | null;
  };
  setShowDeleteConfirm: (value: {
    show: boolean;
    deleteType: DeleteTriggerTypeKey | null;
  }) => void;
  onConfirmDelete: (
    deleteType: DeleteTriggerTypeKey,
    params?: DeleteParams | null
  ) => void;
  params?: DeleteParams | null;
}

const deleteTypeLabelMap: Record<DeleteTriggerTypeKey, string> = {
  triggerAcm: "Accumulation Trigger",
  triggerBalance: "Balance Trigger",
  acmTriggerBenefit: "Accumulation Trigger Benefit",
  acmTriggerNotif: "Accumulation Trigger Notification",
  acmTriggerEvent: "Accumulation Trigger Event",
  balanceTriggerBenefit: "Balance Trigger Benefit",
  balanceTriggerEvent: "Balance Trigger Event",
  balanceTriggerNotif: "Balance Trigger Notification",
};

const getDeleteTypeLabel = (key: DeleteTriggerTypeKey | null): string => {
  if (!key) return "";
  return deleteTypeLabelMap[key] ?? key;
};

const DeleteDialog = ({
  showDeleteConfirm,
  setShowDeleteConfirm,
  onConfirmDelete,
  params,
}: DeleteDialogProps) => {
  const handleCancel = () => {
    setShowDeleteConfirm({ show: false, deleteType: null });
  };

  const handleConfirm = () => {
    if (showDeleteConfirm.deleteType) {
      onConfirmDelete(showDeleteConfirm.deleteType, params ?? null);
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
            <h1 className="text-lg font-semibold mb-5">
              Delete {getDeleteTypeLabel(showDeleteConfirm.deleteType)}
            </h1>
            <p className="text-sm">
              Are you sure you want to delete this{" "}
              {getDeleteTypeLabel(showDeleteConfirm.deleteType)}? This action
              cannot be undone.
            </p>
          </div>
        </DialogHeader>

        <DialogFooter className="flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
          >
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
