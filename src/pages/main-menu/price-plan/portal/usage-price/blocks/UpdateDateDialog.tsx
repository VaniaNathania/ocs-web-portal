import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";

interface UpdateDateDialogProps {
  show: boolean;
  onClose: () => void;
  ratePlanId: number;
  priceVersion: any;
  onUpdateSuccess?: () => void; 
  effDate?: string | null;
  expDate?: string | null;
  mappingId: number|null;
  }

const API_URL = apiConfig.service_price_plan;

const UpdateDateDialog: React.FC<UpdateDateDialogProps> = ({
  show,
  onClose,
  ratePlanId,
  priceVersion,
  onUpdateSuccess,
  effDate,
  expDate,
  mappingId
}) => {
  const { PutData } = useCallApi();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    effectiveDate: effDate || "",
    expiredDate: expDate || null,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.effectiveDate) {
      toast.error("Please fill in Effective Date.");
      return;
    }

    // Validasi hanya jika expired date diisi
    if (formData.expiredDate && new Date(formData.effectiveDate) >= new Date(formData.expiredDate)) {
      toast.error("Effective date must be before expired date");
      return;
    }

    setIsLoading(true);
    try {
      const requestData: any = {
        effectiveDate: formData.effectiveDate,
        expiredDate: formData.expiredDate,
        ratePlanId: ratePlanId,
        mappingId: mappingId 
      };

      // Hanya kirim expirationDate jika diisi
      if (formData.expiredDate === "") {
        requestData.expiredDate = null;
      }

      const response = await PutData(
        `${API_URL}/price-version/update/${priceVersion.priceVerId}`,
        requestData
      );

      if (response?.status) {
        toast.success("Date updated successfully");
        onUpdateSuccess?.();
        onClose();
      } else {
        toast.error(response?.message || "Failed to update date");
      }
    } catch (error) {
      toast.error("Failed to update date");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Update Price Version Dates
          </h3>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="effectiveDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Effective Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="effectiveDate"
                value={formData.effectiveDate}
                onChange={(e) =>
                  handleInputChange("effectiveDate", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                
                required
              />
            </div>

            <div>
              <label
                htmlFor="expiredDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Expired Date <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="date"
                id="expiredDate"
                value={formData.expiredDate?? ""}
                onChange={(e) =>
                  handleInputChange("expiredDate", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
                // Required dihapus karena sekarang optional
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if no expiration date needed
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateDateDialog;