import React, { useState } from "react";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";

const API_URL = apiConfig.service_price_plan;

interface DeleteMappingProps {
  show: boolean;
  onClose: () => void;
  mappingId: number | null;
  onDeleteSuccess?: () => void;
}

const DeleteMapping: React.FC<DeleteMappingProps> = ({
  show,
  onClose,
  mappingId,
  onDeleteSuccess,
}) => {
  const { DeleteData } = useCallApi();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!mappingId) {
      toast.error("No mapping selected for deletion");
      return;
    }

    setIsLoading(true);
    try {
      const response = await DeleteData(
        `${API_URL}/mapping/${mappingId}`,
        {}
      );

      if (response?.status) {
        toast.success("Mapping deleted successfully!");
        
        // Tutup dialog dulu
        onClose();
        
        // Kemudian refresh mapping list
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } else {
        toast.error(response?.message || "Failed to delete mapping");
      }
    } catch (error: any) {
      console.error("Error deleting mapping:", error);
      toast.error("Failed to delete mapping");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Delete Mapping</h2>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this mapping? This action cannot
          be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            {isLoading ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMapping;