import React, { useState } from "react";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";
import { KeenIcon } from "@/components";

const API_URL = apiConfig.service_price_plan;

interface DeletePriceDialogProps {
  show: boolean;
  onClose: () => void;
  priceId: number | null;
  priceVersionId: number | null;
  reType: string | null;
  onDeleteSuccess?: () => void;
}

const DeletePriceDialog: React.FC<DeletePriceDialogProps> = ({
  show,
  onClose,
  priceId,
  priceVersionId,
  reType,
  onDeleteSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { DeleteData } = useCallApi();
  
  
const handleDelete = async () => {
  // if (!priceId || !priceVersionId || !reType) {
  //   toast.error("Missing required parameters for deletion");
  //   return;
  // }

  setIsDeleting(true);

  try {
    const response = await DeleteData(
      `${API_URL}/price/delete?priceId=${priceId}&priceVerId=${priceVersionId}&reType=${1}`,
      {}
    );

    if (response?.status) {
      toast.success("Price deleted successfully");
      onDeleteSuccess?.();
      onClose();
    } else {
      toast.error(response?.message || "Failed to delete price");
    }
  } catch (error) {
    console.error("Error deleting price:", error);
    toast.error("An error occurred while deleting the price");
  } finally {
    setIsDeleting(false);
  }
};


  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Delete Price</h3>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <KeenIcon icon="cross" className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <KeenIcon icon="trash" className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-900 font-medium">Are you sure you want to delete this price?</p>
              <p className="text-gray-500 text-sm mt-1">This action cannot be undone.</p>
            </div>
          </div>

          {priceId && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Price ID:</span> {priceId}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <KeenIcon icon="trash" className="w-4 h-4" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePriceDialog;