import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AddSalesConditionProps {
  onClose: () => void;
  isOpen: boolean;
  areaId: number;
  offerId: number;
  onSuccess: () => void;
  submitType?: "area" | "channel" | "catg";
  existingSelectedIds?: number[];
}

interface SalesAreaDetailProps {
  areaId: number;
  parentId: number;
  areaName: string;
  comments: string;
  areaCode: string;
}

interface SalesChannelDetailProps {
  contactChannelId: number;
  contactChannelName: string;
  channelType: string;
  channelTypeName: string;
  comments: string | null;
  spId: number;
}

interface SalesCatgDetailProps {
  catgId: number;
  catgName: string;
  catgType: string;
  comments: string;
  createdDate: string;
  catgDeffType: string;
}

type DetailDataType = SalesAreaDetailProps | SalesChannelDetailProps | SalesCatgDetailProps;

const API_URL_OFFER = apiConfigOffer.offer;

const AddSalesCondition: React.FC<AddSalesConditionProps> = ({
  isOpen,
  onClose,
  areaId,
  offerId,
  onSuccess,
  submitType = "area",
  existingSelectedIds = [],
}) => {
  const { GetData, PostData } = useCallApi();
  const [detailData, setDetailData] = useState<DetailDataType[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<number[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<number[]>([]);
  const [selectedCatg, setSelectedCatg] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Function to set pre-selected items based on submitType
  const setPreSelectedItems = () => {
    if (existingSelectedIds.length > 0) {
      switch (submitType) {
        case "area":
          setSelectedAreas(existingSelectedIds);
          break;
        case "channel":
          setSelectedChannel(existingSelectedIds);
          break;
        case "catg":
          setSelectedCatg(existingSelectedIds);
          break;
      }
    }
  };

  // Function to fetch different types of data based on submitType
  const fetchDetailData = async (targetId: number) => {
    try {
      setLoading(true);
      let response;
      let endpoint = "";
      let params = {};

      switch (submitType) {
        case "area":
          endpoint = `${API_URL_OFFER}/offer/common/qry-area-detail`;
          params = {
            areaId: null,
            parentId: null,
            spId: 0,
          };
          break;
        case "channel":
          endpoint = `${API_URL_OFFER}/offer/common/qry-contact-channel-list`;
          params = {
            contactChannelId: null,
            contactChannelName: "",
            channelType: "",
            channelTypeName: "",
            comments: "",
          };
          break;
        case "catg":
          endpoint = `${API_URL_OFFER}/offer/common/qry-catg-list`;
          params = {
            catgType: "C",
            spId: "",
          };
          break;
        default:
          throw new Error(`Unknown submitType: ${submitType}`);
      }

      response = await GetData(endpoint, params);

      if (!response?.status) {
        console.error("❌ API returned non-success status:", response?.status);
        throw new Error(response?.message || `Failed to fetch ${submitType} data`);
      }

      let responseData = [];
      if (response?.data) {
        responseData = Array.isArray(response?.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        responseData = response;
      } else {
        console.warn("⚠️ No data in response");
        responseData = [];
      }

      // Validate data based on submitType
      const validatedData = responseData.filter((item: any) => {
        let isValid = false;
        switch (submitType) {
          case "area":
            isValid = item && typeof item.areaName === "string" && typeof item.areaCode === "string";
            break;
          case "channel":
            isValid = item && typeof item.contactChannelName === "string" && typeof item.contactChannelId === "number";
            break;
          case "catg":
            isValid = item && typeof item.catgName === "string" && typeof item.catgId === "number";
            break;
        }

        if (!isValid) {
          console.warn(`⚠️ Invalid ${submitType} data`);
        }
        return isValid;
      });

      setDetailData(validatedData);
    } catch (error: any) {
      console.error(`❌ Error fetching ${submitType} data:`, error);
      console.error("❌ Error stack:", error.stack);
      toast.error(`Error loading ${submitType} data: ${error.message}`);
      setDetailData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (itemId: number, isChecked: boolean) => {
    if (isChecked) {
      if (submitType === "area") {
        setSelectedAreas((prev) => [...prev, itemId]);
      } else if (submitType === "channel") {
        setSelectedChannel((prev) => [...prev, itemId]);
      } else {
        setSelectedCatg((prev) => [...prev, itemId]);
      }
    } else {
      if (submitType === "area") {
        setSelectedAreas((prev) => prev.filter((id) => id !== itemId));
      } else if (submitType === "channel") {
        setSelectedChannel((prev) => prev.filter((id) => id !== itemId));
      } else {
        setSelectedCatg((prev) => prev.filter((id) => id !== itemId));
      }
    }
  };

  const handleSubmitSalesArea = async () => {
    if (selectedAreas.length === 0) {
      toast.error("Please select at least one area");
      return;
    }

    if (!offerId || offerId < 0) {
      toast.error("Invalid Offer ID");
      return;
    }

    try {
      setSubmitting(true);

      // Filter out existing items untuk menghindari duplikasi
      const newSelectedAreas = selectedAreas.filter((id) => !existingSelectedIds.includes(id));

      if (newSelectedAreas.length === 0) {
        toast.info("No new areas to add");
        onClose();
        return;
      }

      const requestBody = newSelectedAreas.map((selectedAreaId) => ({
        offerId: offerId,
        areaId: selectedAreaId,
        spId: 0,
        excludeFlag: "",
      }));

      const response = await PostData(`${API_URL_OFFER}/offer/apply/add-offer-apply-area-batch`, requestBody);

      if (response?.status) {
        toast.success(`${newSelectedAreas.length} sales area conditions added successfully!`);
        setSelectedAreas([]);

        if (onSuccess) {
          onSuccess();
        } else {
          console.warn("⚠️ onSuccess callback is not provided!");
        }

        onClose();
      } else {
        console.error("❌ API returned non-success status");
        throw new Error(response?.message || "Failed to add sales conditions");
      }
    } catch (error: any) {
      console.error("❌ Error adding sales conditions:", error);
      toast.error(`Error adding sales conditions: ${error.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitChannel = async () => {
    if (selectedChannel.length === 0) {
      toast.error("Please select at least one contact channel");
      return;
    }

    if (!offerId || offerId < 0) {
      toast.error("Invalid offer id");
      return;
    }

    try {
      setSubmitting(true);

      // Filter out existing items
      const newSelectedChannel = selectedChannel.filter((id) => !existingSelectedIds.includes(id));

      if (newSelectedChannel.length === 0) {
        toast.info("No new channels to add");
        onClose();
        return;
      }

      const requestBody = newSelectedChannel.map((selectedChannelId) => ({
        offerId: offerId,
        contactChannelId: selectedChannelId,
        spId: 0,
        excludeFlag: "",
      }));

      const response = await PostData(`${API_URL_OFFER}/offer/apply/add-offer-apply-channel-batch`, requestBody);

      if (response?.status) {
        toast.success(`${newSelectedChannel.length} sales channels added successfully!`);
        setSelectedChannel([]);

        if (onSuccess) {
          onSuccess();
        } else {
          console.warn("⚠️ onSuccess callback is not provided!");
        }

        onClose();
      } else {
        console.error("❌ API returned non-success status");
        throw new Error(response?.message || "Failed to add sales channel");
      }
    } catch (error: any) {
      console.error("❌ Error adding sales channel:", error);
      toast.error(`Error adding sales channel: ${error.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCategory = async () => {
    if (selectedCatg.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    if (!offerId || offerId < 0) {
      toast.error("Invalid offer id");
      return;
    }

    try {
      setSubmitting(true);

      // Filter out existing items
      const newSelectedCatg = selectedCatg.filter((id) => !existingSelectedIds.includes(id));

      if (newSelectedCatg.length === 0) {
        toast.info("No new categories to add");
        onClose();
        return;
      }

      const requestBody = newSelectedCatg.map((selectedCatgId) => ({
        offerId: offerId,
        catgId: selectedCatgId,
        spId: 0,
        excludeFlag: "",
      }));

      const response = await PostData(`${API_URL_OFFER}/offer/apply/add-offer-apply-catg-batch`, requestBody);

      if (response?.status) {
        toast.success(`${newSelectedCatg.length} sales categories added successfully!`);
        setSelectedCatg([]);

        if (onSuccess) {
          onSuccess();
        } else {
          console.warn("⚠️ onSuccess callback is not provided!");
        }

        onClose();
      } else {
        console.error("❌ API returned non-success status");
        throw new Error(response?.message || "Failed to add sales category");
      }
    } catch (error: any) {
      console.error("❌ Error adding sales category:", error);
      toast.error(`Error adding sales category: ${error.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Function to submit based on submitType
  const handleSubmit = () => {
    if (submitType === "area") {
      handleSubmitSalesArea();
    } else if (submitType === "channel") {
      handleSubmitChannel();
    } else {
      handleSubmitCategory();
    }
  };

  useEffect(() => {
    let targetId = areaId;

    if (!targetId || targetId <= 0) {
      targetId = 1;
    }

    if (isOpen) {
      fetchDetailData(targetId);
      // Reset states first
      setSelectedAreas([]);
      setSelectedChannel([]);
      setSelectedCatg([]);

      // Then set pre-selected items after a brief delay to ensure states are reset
      setTimeout(() => {
        setPreSelectedItems();
      }, 100);
    }
  }, [areaId, isOpen, submitType, existingSelectedIds]);

  const closePopup = () => {
    setSelectedAreas([]);
    setSelectedChannel([]);
    setSelectedCatg([]);
    onClose();
  };

  // Validation based on submitType
  const isFormValid = () => {
    if (submitType === "area") {
      return selectedAreas.length > 0 && offerId && offerId > 0;
    } else if (submitType === "channel") {
      return selectedChannel.length > 0 && offerId && offerId > 0;
    } else {
      return selectedCatg.length > 0 && offerId && offerId > 0;
    }
  };

  // Get selected count based on submitType
  const getSelectedCount = () => {
    if (submitType === "area") {
      return selectedAreas.length;
    } else if (submitType === "channel") {
      return selectedChannel.length;
    } else {
      return selectedCatg.length;
    }
  };

  // Get new items count (excluding existing ones)
  const getNewItemsCount = () => {
    const selectedIds = getSelectedIds();
    return selectedIds.filter((id) => !existingSelectedIds.includes(id)).length;
  };

  // Get selected IDs based on submitType
  const getSelectedIds = (): number[] => {
    if (submitType === "area") {
      return selectedAreas;
    } else if (submitType === "channel") {
      return selectedChannel;
    } else {
      return selectedCatg;
    }
  };

  // Get title based on submitType
  const getDialogTitle = () => {
    if (submitType === "area") {
      return "Add Sales Area Condition";
    } else if (submitType === "channel") {
      return "Add Sales Contact Channel Condition";
    } else {
      return "Add Sales Category Condition";
    }
  };

  // Check if item is selected based on submitType
  const isItemSelected = (itemId: number) => {
    if (submitType === "area") {
      return selectedAreas.includes(itemId);
    } else if (submitType === "channel") {
      return selectedChannel.includes(itemId);
    } else {
      return selectedCatg.includes(itemId);
    }
  };

  // Check if item is existing (already in the list)
  const isItemExisting = (itemId: number) => {
    return existingSelectedIds.includes(itemId);
  };

  // Get item ID based on submitType
  const getItemId = (item: DetailDataType): number => {
    if (submitType === "area") {
      return (item as SalesAreaDetailProps).areaId;
    } else if (submitType === "channel") {
      return (item as SalesChannelDetailProps).contactChannelId;
    } else {
      return (item as SalesCatgDetailProps).catgId;
    }
  };

  // Get item name based on submitType
  const getItemName = (item: DetailDataType): string => {
    if (submitType === "area") {
      return (item as SalesAreaDetailProps).areaName;
    } else if (submitType === "channel") {
      return (item as SalesChannelDetailProps).contactChannelName;
    } else {
      return (item as SalesCatgDetailProps).catgName;
    }
  };

  const isProcessing = loading || submitting;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closePopup();
      }}
    >
      <DialogContent className="w-[600px] max-w-2xl p-4 flex flex-col">
        {/* Header */}
        <DialogHeader className="flex justify-between items-center border-b px-4 py-3">
          <DialogTitle className="text-sm font-semibold text-gray-800">{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto py-2 min-h-[300px] max-h-[300px]">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2">Loading {submitType} data...</span>
            </div>
          )}

          {!loading && detailData.length === 0 && (
            <div className="text-center text-gray-500 py-8">No {submitType} data found</div>
          )}

          {!loading && detailData.length > 0 && (
            <div className="space-y-2">
              {detailData.map((item, index) => {
                const itemId = getItemId(item);
                const itemName = getItemName(item);
                const isExisting = isItemExisting(itemId);

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 text-sm font-medium rounded`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={isItemSelected(itemId)}
                      onChange={(e) => handleCheckboxChange(itemId, e.target.checked)}
                      disabled={submitting}
                    />
                    <div className="flex-1 flex items-center gap-2">
                      <span>{itemName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fixed footer */}
        <DialogFooter className="px-6 border-t mt-2">
          <div className="flex w-full justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closePopup}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isProcessing || !isFormValid()}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>Save ({getSelectedCount()})</>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSalesCondition;
