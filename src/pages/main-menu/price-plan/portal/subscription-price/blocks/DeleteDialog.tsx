import { useCallApi } from "@/hooks";
import {
  DeleteSubscriptionTypeKey,
  useSubscriptionPriceCreateContext,
} from "../hooks";

interface DeleteDialogProps {
  showDeleteConfirm: {
    show: boolean;
    deleteType: DeleteSubscriptionTypeKey | null;
  };
  setShowDeleteConfirm: (value: {
    show: boolean;
    deleteType: DeleteSubscriptionTypeKey | null;
  }) => void;
  onConfirmDelete: (deleteType: DeleteSubscriptionTypeKey) => void;
}

const deleteTypeLabelMap: Record<DeleteSubscriptionTypeKey, string> = {
  event: "Event",
  ratePlan: "Rate Plan",
  priceRating: "Price",
  priceAccumulation: "Accumulation",
  priceBenefit: "Benefit",
  mappingRating: "Mapping Rating",
};

const getDeleteTypeLabel = (key: DeleteSubscriptionTypeKey | null): string => {
  if (!key) return "";
  return deleteTypeLabelMap[key] ?? key;
};

const DeleteDialog = ({
  showDeleteConfirm,
  setShowDeleteConfirm,
  onConfirmDelete,
}: DeleteDialogProps) => {
  const handleCancel = () => {
    setShowDeleteConfirm({ show: false, deleteType: null });
  };

  const handleConfirm = () => {
    if (showDeleteConfirm.deleteType) {
      onConfirmDelete(showDeleteConfirm.deleteType);
    }
  };

  if (!showDeleteConfirm.show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">
          Delete {getDeleteTypeLabel(showDeleteConfirm.deleteType)}
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this{" "}
          {getDeleteTypeLabel(showDeleteConfirm.deleteType)}? This action cannot
          be undone.
        </p>
        <div className="flex justify-end space-x-2">
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
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;
