import React, { useState } from "react";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";

const API_URL = apiConfig.service_price_plan;

interface DeleteRatePlanProps {
  show: boolean;
  onClose: () => void;
  ratePlanId: number | null;
  onDeleteSuccess?: () => void;
}

const DeleteRatePlan: React.FC<DeleteRatePlanProps> = ({
  show,
  onClose,
  ratePlanId,
  onDeleteSuccess,
}) => {
  const { DeleteData } = useCallApi();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!ratePlanId) {
      toast.error("Invalid rate plan data");
      return;
    }

    setIsLoading(true);
    try {
      const response = await DeleteData(
        `${API_URL}/rate-plan/delete/${ratePlanId}`,
        {}
      );

      if (response?.status) {
        toast.success(response.message || "Rate plan deleted successfully");
        onDeleteSuccess?.();
        onClose();
        
      } else {
        toast.error(response?.message || "Failed to delete rate plan");
      }
    } catch (error) {
      console.error("Error deleting rate plan:", error);
      toast.error("Failed to delete rate plan");
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Delete Rate Plan</h2>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this rate plan? This action cannot
          be undone and will also delete all associated price versions.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className={`px-4 py-2 rounded text-white text-sm transition-colors ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRatePlan;