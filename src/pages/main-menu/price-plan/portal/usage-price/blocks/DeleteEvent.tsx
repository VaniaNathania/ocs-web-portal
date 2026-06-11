import React, { useState } from "react";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";

const API_URL = apiConfig.service_price_plan;

interface DeleteEventProps {
  show: boolean;
  onClose: () => void;
  eventToDelete: {
    offerVerId: number | null;
    eventId: number | null;
  };
  onDeleteSuccess?: () => void;
}

const DeleteEvent: React.FC<DeleteEventProps> = ({
  show,
  onClose,
  eventToDelete,
  onDeleteSuccess,
}) => {
  const { DeleteData } = useCallApi();
  const [isLoading, setIsLoading] = useState(false);
  const {  dataPricePlan, dataPricePlanDetail, selectedOfferVerId  } = usePortalData();
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await DeleteData(
        `${API_URL}/event/delete?offerVerId=${selectedOfferVerId}&usageEventId=${eventToDelete.eventId}`,
        {}
      );

      if (response?.status) {
        toast.success("Event deleted successfully!");

        // Tutup dialog dulu
        onClose();

        // Kemudian refresh event list
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } else {
        toast.error(response?.message || "Failed to delete event");
      }
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
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
        <h2 className="text-lg font-semibold mb-4">Delete Event</h2>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this event? This action cannot be
          undone.
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

export default DeleteEvent;
