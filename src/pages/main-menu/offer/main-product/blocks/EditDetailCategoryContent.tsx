import React, { useEffect, useState } from "react";
import { X, Edit3 } from "lucide-react";
import FeatureTabContent from "../components/DetailCategoryContent/FeatureTabContent";
import RelationshipTabContent from "../components/DetailCategoryContent/RelationShipTabContent";
import PrivateOfferGroupContent from "../components/DetailCategoryContent/PrivateOfferGroupContent";
import SubscriptionPlanSection from "../components/SubscriptionPlanSection";
import DetailEditMode from "../components/DetailEditMode";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { useDataGrid } from "@/components";
import { useMainProductOfferListContext } from "../hooks";
import { MapDisplayData } from "./utils/MapDisplayData";

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  rowData: any;
}

interface FormData {
  offer: {
    offerType: string;
    offerName: string;
    comments: string;
    offerCode: string;
    effDate: string;
    expDate: string;
    effType: string;
    prodType: string;
    spId: number;
    brandPricePlanId?: string;
  };
  servType: string;
  paidFlag: string;
  lifecycleType: string;
  offerCatgId: string;
  prodType: string;
}

const tabs = [
  { id: "detail", label: "Detail" },
  { id: "feature", label: "Feature" },
  { id: "relationship", label: "Relationship" },
  { id: "private-offer-group", label: "Private Offer Group" },
];

const API_URL_OFFER = apiConfigOffer.offer;

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({ isOpen, onClose, category, rowData }) => {
  const [activeTab, setActiveTab] = useState("detail");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailContent, setDetailContent] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { reload } = useDataGrid();
  const { refreshCategorySidebar } = useMainProductOfferListContext();
  const [isDataReady, setIsDataReady] = useState(false);

  // Form data dan validation states
  const [formData, setFormData] = useState<FormData>({
    offer: {
      offerType: "2",
      offerName: "",
      comments: "",
      offerCode: "",
      effDate: "",
      expDate: "",
      effType: "",
      prodType: "",
      spId: 0,
      brandPricePlanId: "",
    },
    servType: "",
    paidFlag: "",
    lifecycleType: "",
    offerCatgId: "",
    prodType: "",
  });

  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedEffType, setSelectedEffType] = useState<string[]>([]);
  const [effTypeOpen, setEffTypeOpen] = useState(false);

  // Service type dan lifecycle type data
  const [serviceType, setServiceType] = useState<any[]>([]);
  const [lifecycleType, setLifecycleType] = useState<any[]>([]);

  const { GetData, PutData } = useCallApi();
  const { setRefreshOfferListSidebar, selectedCategoryId, isEditingMode, setIsEditingMode } = useMainProductOfferListContext();

  // Function untuk fetch detail content
  const fetchDetailCategoryContent = async (offerId: string) => {
    if (!offerId) {
      console.error("OfferId is required");
      return;
    }

    setLoading(true);
    setError(null);

    const params = {
      indepProdSpecId: offerId,
      spId: 0,
    };

    try {
      const response = await GetData(`${API_URL_OFFER}/offer/indep/qry-indep-prod-spec-by-offer-id`, params);

      if (response?.status && response?.data) {
        let dataObject;
        if (Array.isArray(response.data)) {
          dataObject = response.data[0] || {};
        } else {
          dataObject = response.data;
        }

        setDetailContent(dataObject);

        let effTypeArray: string[] = [];
        if (dataObject.effType) {
          effTypeArray = dataObject.effType.split("|");
        }
        setSelectedEffType(effTypeArray);

        const newFormData: FormData = {
          offer: {
            offerType: dataObject.offerType || "2",
            offerName: dataObject.offerName || "",
            comments: dataObject.comments || "",
            offerCode: dataObject.offerCode || "",
            effDate: dataObject.effDate || "",
            expDate: dataObject.expDate || "",
            effType: dataObject.effType || "",
            prodType: dataObject.prodType || "",
            spId: dataObject.spId || 0,
            brandPricePlanId: dataObject.brandPricePlanId || "",
          },
          servType: dataObject.servType ? String(dataObject.servType) : "",
          paidFlag: dataObject.paidFlag || "",
          lifecycleType: dataObject.lifecycleType != null ? String(dataObject.lifecycleType) : "",
          offerCatgId: dataObject.offerCatgId || "",
          prodType: dataObject.prodType || "",
        };

        setFormData(newFormData);
        setOriginalFormData(JSON.parse(JSON.stringify(newFormData)));

        return dataObject;
      } else {
        throw new Error("Data tidak ditemukan");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal fetch detail content";
      console.error("❌ Error fetching detail:", err);
      setError(errorMessage);
      toast.error(`Gagal memuat detail: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Function untuk fetch service type
  const fetchServiceType = async () => {
    try {
      const response = await GetData(`${API_URL_OFFER}/servType/qryServType`, {
        search: "",
        page: 1,
        size: 100,
        sortBy: "SERV_TYPE_NAME",
        catgType: "M",
        sortDirection: "asc",
      });
      if (response?.data) {
        setServiceType(response?.data);
      }
    } catch (error) {
      toast.error("Error GET Service Type data");
    }
  };

  // Function untuk fetch lifecycle type
  const fetchLifecycleType = async (spId: number) => {
    try {
      const response = await GetData(`${API_URL_OFFER}/offer/common/qry-lifecycle-type`, {
        lifecycleType: "",
        spId: spId,
      });
      if (response?.data) {
        setLifecycleType(response?.data);
      }
    } catch (error) {
      toast.error("Error GET Lifecycle Type data");
    }
  };

  // Toggle edit mode
  const handleEditClick = () => {
    setIsEditingMode(true);
    setErrors({});
  };

  const handleCancelEdit = () => {
    setIsEditingMode(false);
    // Reset form data ke original
    if (originalFormData) {
      setFormData(JSON.parse(JSON.stringify(originalFormData)));
      setSelectedEffType(originalFormData.offer.effType?.split("|") || []);
    }
    setErrors({});
  };

  // Form validation
  const validateForm = () => {
    const requiredFields = [
      { key: "offer.offerName", label: "Product Name", getValue: () => formData.offer.offerName },
      { key: "offer.offerCode", label: "Code", getValue: () => formData.offer.offerCode },
      { key: "offer.effDate", label: "Effective Date", getValue: () => formData.offer.effDate },
      { key: "servType", label: "Service Type", getValue: () => formData.servType },
      { key: "paidFlag", label: "Paid Flag", getValue: () => formData.paidFlag },
    ];

    const newErrors: Record<string, string> = {};
    let isValid = true;

    requiredFields.forEach(({ key, label, getValue }) => {
      const value = getValue();
      const isEmpty = value === "" || value === null || value === undefined;

      if (isEmpty) {
        newErrors[key] = `${label} is required`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const targetId = rowData?.offerId || rowData?.id;
    if (!targetId) {
      toast.error("ID tidak ditemukan, tidak bisa melakukan update");
      return;
    }

    const effTypeForAPI = selectedEffType.join("|");

    const payloadToSend = {
      offer: {
        offerId: Number(targetId),
        offerType: formData.offer.offerType,
        offerName: formData.offer.offerName,
        comments: formData.offer.comments,
        offerCode: formData.offer.offerCode,
        effDate: formData.offer.effDate,
        expDate: formData.offer.expDate,
        effType: effTypeForAPI,
        spId: formData.offer.spId,
        prodType: formData.offer.prodType,
      },
      indepProdSpecId: Number(targetId),
      servType: Number(formData.servType),
      paidFlag: formData.paidFlag,
      lifecycleType: formData.lifecycleType ? Number(formData.lifecycleType) : null,
      prodType: formData.prodType,
    };

    setIsSubmitting(true);

    try {
      const response = await PutData(`${API_URL_OFFER}/offer/indep/mod-indep-prod-spec`, payloadToSend);

      if (response?.status) {
        toast.success("Main Product successfully updated!");

        // Update detail content dengan data terbaru
        setDetailContent({ ...detailContent, ...payloadToSend.offer, paidFlag: payloadToSend.paidFlag, lifecycleType: payloadToSend.lifecycleType, servType: payloadToSend.servType });
        setOriginalFormData(JSON.parse(JSON.stringify(formData)));

        setIsEditingMode(false);

        await refreshCategorySidebar();

        reload();

        setRefreshOfferListSidebar(selectedCategoryId);
      } else {
        const errorMessage = response?.message || "Failed to update Related Product";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev };

      if (field.startsWith("offer.")) {
        const offerField = field.replace("offer.", "") as keyof FormData["offer"];
        newData.offer = { ...prev.offer, [offerField]: value };
      } else {
        (newData as any)[field] = value;
      }

      return newData;
    });

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Effect untuk fetch data saat modal dibuka
  useEffect(() => {
    if (isOpen && (rowData?.offerId || rowData?.id)) {
      const targetId = rowData?.offerId || rowData?.id;

      setIsDataReady(false); // Reset saat mulai fetch

      const loadAllData = async () => {
        try {
          await fetchServiceType();
          const detailData = await fetchDetailCategoryContent(targetId);

          if (detailData?.spId !== undefined) {
            await fetchLifecycleType(detailData.spId);
          } else {
            await fetchLifecycleType(0);
          }

          setIsDataReady(true); // Data sudah siap semua
        } catch (error) {
          await fetchLifecycleType(0);
          setIsDataReady(true);
        }
      };

      loadAllData();
    }
  }, [isOpen, rowData]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();

        if (isEditingMode) {
          handleCancelEdit();
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown, true);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, isEditingMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">{category.charAt(0)}</div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg">{detailContent?.offerName || rowData?.offerName || "-"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn btn-sm btn-icon btn-light">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === "detail" && (
            <div>
              {!isDataReady ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading...</div>
                </div>
              ) : isEditingMode ? (
                <DetailEditMode
                  formData={formData}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  serviceType={serviceType}
                  lifecycleType={lifecycleType}
                  selectedEffType={selectedEffType}
                  effTypeOpen={effTypeOpen}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  onCancel={handleCancelEdit}
                  setSelectedEffType={setSelectedEffType}
                  setEffTypeOpen={setEffTypeOpen}
                  rowData={rowData}
                />
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Product Name */}
                      <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                        <label className="w-40 text-sm font-medium text-gray-700">Main Product Name</label>
                        <span className="text-sm font-medium text-gray-700">:</span>
                        <span className="text-sm text-gray-900">{detailContent?.offerName || rowData?.offerName || "-"}</span>
                      </div>

                      {/* Product Code */}
                      <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                        <label className="w-40 text-sm font-medium text-gray-700">Main Product Code</label>
                        <span className="text-sm font-medium text-gray-700">:</span>
                        <span className="text-sm text-gray-900">{detailContent?.offerCode || rowData?.offerCode || "-"}</span>
                      </div>

                      {/* Service Type */}
                      <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                        <label className="w-40 text-sm font-medium text-gray-700">Service Type</label>
                        <span className="text-sm font-medium text-gray-700">:</span>
                        <span className="text-sm text-gray-900">{serviceType.find((item) => item.servType === detailContent?.servType)?.servTypeName || "-"}</span>
                      </div>

                      {/* Lifecycle Type */}
                      <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                        <label className="w-40 text-sm font-medium text-gray-700">Lifecycle Type</label>
                        <span className="text-sm font-medium text-gray-700">:</span>
                        <span className="text-sm text-gray-900">{lifecycleType.find((item) => item.lifecycleType === detailContent?.lifecycleType)?.lifecycleTypeName || "-"}</span>
                      </div>

                      {/* Comments */}
                      <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                        <label className="w-40 text-sm font-medium text-gray-700">Comments</label>
                        <span className="text-sm font-medium text-gray-700">:</span>
                        <span className="text-sm text-gray-900">{detailContent?.comments || rowData?.comments || "-"}</span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Effective Date */}
                      <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                        <label className="w-40 text-sm font-medium text-gray-700">Effective Date</label>
                        <span className="text-sm font-medium text-gray-700">:</span>
                        <span className="text-sm text-gray-900">{detailContent?.effDate || rowData?.effDate || "-"}</span>
                      </div>

                      {/* Expired Date */}
                      <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                        <label className="w-40 text-sm font-medium text-gray-700">Expired Date</label>
                        <span className="text-sm font-medium text-gray-700">:</span>
                        <span className="text-sm text-gray-900">{detailContent?.expDate || rowData?.expDate || "-"}</span>
                      </div>

                      {/* Effective Type */}
                      <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                        <label className="w-40 text-sm font-medium text-gray-700">Effective Type</label>
                        <span className="text-sm font-medium text-gray-700">:</span>
                        <span className="text-sm text-gray-900">{MapDisplayData(detailContent).effectiveTypeDisplay || "-"}</span>
                      </div>

                      {/* Paid Flag */}
                      <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                        <label className="w-40 text-sm font-medium text-gray-700">Paid Flag</label>
                        <span className="text-sm font-medium text-gray-700">:</span>
                        <span className="text-sm text-gray-900">{MapDisplayData(detailContent).paidFlagDisplay || "-"}</span>
                      </div>

                      {/* Brand Price Plan */}
                      <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                        <label className="w-40 text-sm font-medium text-gray-700">Brand Price Plan</label>
                        <span className="text-sm font-medium text-gray-700">:</span>
                        <span className="text-sm text-gray-900">{detailContent?.brandPricePlanId || rowData?.brandPricePlanId || "-"}</span>
                      </div>

                      {/* Product Line */}
                      <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                        <label className="w-40 text-sm font-medium text-gray-700">Product Line</label>
                        <span className="text-sm font-medium text-gray-700">:</span>
                        <span className="text-sm text-gray-900">{MapDisplayData(detailContent).productLineDisplay || "-"}</span>
                      </div>

                      {/* Edit Button */}
                      <div className="flex justify-end gap-2 pt-4">
                        <button
                          type="button"
                          onClick={handleEditClick}
                          className="px-4 py-2 text-sm font-normal text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Subscription Plan Section */}
              <SubscriptionPlanSection rowData={rowData} />
            </div>
          )}

          {/* Tab lainnya */}
          {activeTab === "feature" && <FeatureTabContent category={category} rowData={detailContent || rowData} />}

          {activeTab === "relationship" && <RelationshipTabContent rowData={detailContent || rowData} allowedRelationTypes={["Exchangeable"]}/>}

          {activeTab === "private-offer-group" && <PrivateOfferGroupContent rowData={rowData} />}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-400 text-lg mb-2">Error Loading Data</div>
                <div className="text-red-500 text-sm mb-4">{error}</div>
                <button
                  onClick={() => {
                    const targetId = rowData?.offerId || rowData?.id;
                    if (targetId) {
                      fetchDetailCategoryContent(targetId);
                    }
                  }}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook to manage edit modal
export const useEditModalHandlers = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentData, setCurrentData] = useState<any>(null);

  const handleEditOpen = (category: string, rowData: any) => {
    setCurrentData(rowData);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setCurrentData(null);
  };

  const handleEditSave = (updatedData: any, onUpdateCallback?: (data: any) => void) => {
    setCurrentData(updatedData);
    setIsEditModalOpen(false);

    if (onUpdateCallback) {
      onUpdateCallback(updatedData);
    }
  };

  return {
    isEditModalOpen,
    currentData,
    handleEditOpen,
    handleEditClose,
    handleEditSave,
  };
};

export default CategoryDetailModal;
