import React, { useState, useEffect, useContext, useCallback } from "react";
import { ArrowLeft, X } from "lucide-react";
import DetailEditMode from "./DetailEditMode";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useSubscriptionPlanOfferListContext } from "../hooks/useSubscriptionPlanOfferListContext";
import OfferStatusManage from "./OfferStatusManage";
import SubsPlanSubscriptionPlanSection from "./SubsPlanSubscriptionPlanSection";
import { MapDisplayData } from "../blocks/utils/MapDisplayData";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { useOfferGroupHook } from "../hooks/useOfferGroupHooks";
import PrivateOfferGroupContent from "../../main-product/components/DetailCategoryContent/PrivateOfferGroupContent";
import FeatureTabContent from "../../main-product/components/DetailCategoryContent/FeatureTabContent";
import RelationshipTabContent from "../../main-product/components/DetailCategoryContent/RelationShipTabContent";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface DetailSubCategorySidebarProps {
  isOpen: boolean;
  subCategory: string;
  onBack: () => void;
  onClose?: () => void;
  rowData: any;
  openSource: "table" | "sidebar";
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

const API_URL_OFFER = apiConfigOffer.offer;

const DetailSubCategorySidebar: React.FC<DetailSubCategorySidebarProps> = ({ isOpen, subCategory, onBack, onClose, rowData, openSource }) => {
  const offerTabs = [
    { id: "detail", label: "Detail" },
    { id: "feature", label: "Feature" },
    { id: "relationship", label: "Relationship" },
    { id: "private-offer-group", label: "Private Offer Group" },
  ];
  const {menuPrivAccess} = useOfferLayout()
  const [activeTab, setActiveTab] = useState("detail");
  const [activeSubsPlanTabs, setActiveSubsPlanTabs] = useState("detail");
  const [showOfferStatus, setShowOfferStatus] = useState(false);
  const { setRefreshOfferListSidebar, selectedCategoryId } = useSubscriptionPlanOfferListContext();
  const [cachedData, setCachedData] = useState<{ [key: string]: any }>({});
  const [isFetching, setIsFetching] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    offer: {
      offerType: "",
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEffType, setSelectedEffType] = useState<string[]>([]);
  const [effTypeOpen, setEffTypeOpen] = useState(false);

  // Data states
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailContent, setDetailContent] = useState<any>(null);
  const [serviceType, setServiceType] = useState<any[]>([]);
  const [lifecycleType, setLifecycleType] = useState<any[]>([]);
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);
  const [isEditModeSubsPlan, setIsEditModeSubsPlan] = useState(false);

  const { GetData, PutData } = useCallApi();
  const { setServType } = useOfferLayout();
  const { findServiceType } = useOfferGroupHook();

  const setupFormData = (dataObject: any) => {
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
      lifecycleType: dataObject.lifecycleType ? String(dataObject.lifecycleType) : "",
      offerCatgId: dataObject.offerCatgId || "",
      prodType: dataObject.prodType || "",
    };

    setFormData(newFormData);
    setOriginalFormData(JSON.parse(JSON.stringify(newFormData)));
  };

  const fetchDetailSubCategoryContent = async (offerId: string) => {
    if (!offerId) {
      console.error("OfferId is required");
      return;
    }

    if (cachedData[offerId]) {
      // console.log("📦 Using cached data for:", offerId);
      const dataObject = cachedData[offerId];
      setDetailContent(dataObject);
      setupFormData(dataObject);
      return dataObject;
    }

    if (isFetching) {
      // console.log("⏳ Already fetching, skipping...");
      return;
    }

    // console.log("🌐 Fetching from API for:", offerId);
    setIsFetching(true);
    setIsLoading(true);
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

        setCachedData((prev) => ({
          ...prev,
          [offerId]: dataObject,
        }));

        setDetailContent(dataObject);
        setupFormData(dataObject);

        return dataObject;
      } else {
        throw new Error("Data not found or invalid responsed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to retrieve content details";
      console.error("❌ Error fetching detail:", err);
      setError(errorMessage);
      toast.error(`Failed to load details: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  // Function untuk fetch service type
  const fetchServiceType = async () => {
    try {
      const response = await GetData(`${API_URL_OFFER}/servType/qryServType`, {
        search: "",
        page: 1,
        size: 1000,
        sortBy: "SERV_TYPE_NAME",
        catgType: "M",
        sortDirection: "asc",
        // servType: serverType,
      });
      if (response?.data) {
        setServiceType(response?.data);
      }
    } catch (error) {
      // console.log(error);
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

  useEffect(() => {
    // console.log("DETAIL CONTENT FROM SUBSCRIP", detailContent);
  }, [detailContent]);

  const handleServType = async (servType: any) => {
    try {
      const resp = await findServiceType(servType);
      setServType(resp);
    } catch (error) {}
  };

  useEffect(() => {
    if (isOpen && (rowData?.offerId || rowData?.id)) {
      const targetId = rowData?.offerId || rowData?.id;

      if (!cachedData[targetId] && !isFetching) {
        fetchServiceType();
        fetchDetailSubCategoryContent(targetId)
          .then((detailData) => {
            if (detailData) {
              setDetailContent(detailData);
              handleServType(detailData.servType);

              if (detailContent?.spId !== undefined) {
                fetchLifecycleType(detailContent.spId);
              } else {
                fetchLifecycleType(0);
              }
            }
          })
          .catch(() => {});
      } else if (cachedData[targetId]) {
        // Use cached data
        // console.log("📦 Loading from cache in useEffect");
        setDetailContent(cachedData[targetId]);
        setupFormData(cachedData[targetId]);
        handleServType(cachedData[targetId].servType);
      }
    }
  }, [isOpen, rowData?.offerId, rowData?.id]);

  useEffect(() => {
    if (isEditMode && detailContent) {
      fetchServiceType();
      handleServType(detailContent.serverType);

      if (detailContent?.spId !== undefined) {
        fetchLifecycleType(detailContent.spId);
      } else {
        fetchLifecycleType(0);
      }
    }
  }, [isEditMode, detailContent]);

  // Handle input changes for edit mode
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

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const requiredFields = [
      {
        key: "offer.offerName",
        label: "Product Name",
        getValue: () => formData.offer.offerName,
      },
      {
        key: "offer.offerCode",
        label: "Code",
        getValue: () => formData.offer.offerCode,
      },
      {
        key: "offer.effDate",
        label: "Effective Date",
        getValue: () => formData.offer.effDate,
      },
      {
        key: "servType",
        label: "Service Type",
        getValue: () => formData.servType,
      },
      {
        key: "paidFlag",
        label: "Paid Flag",
        getValue: () => formData.paidFlag,
      },
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
        toast.success("Sub Category successfully updated!");

        // Update detail content dengan data terbaru
        const updatedData = {
          ...detailContent,
          ...payloadToSend.offer,
          paidFlag: payloadToSend.paidFlag,
          lifecycleType: payloadToSend.lifecycleType,
          servType: payloadToSend.servType,
        };

        setDetailContent(updatedData);

        setCachedData((prev) => ({
          ...prev,
          [targetId]: updatedData,
        }));

        setOriginalFormData(JSON.parse(JSON.stringify(formData)));

        setIsEditMode(false);
        setRefreshOfferListSidebar(selectedCategoryId);
      } else {
        const errorMessage = response?.message || "Failed to update Sub Category";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setErrors({});
  };

  const handleEditClickSubsPlan = useCallback(() => {
    setIsEditModeSubsPlan(true);
    setErrors({});
    setActiveSubsPlanTabs("detail");
  }, []);

  const handleCancelEditSubsPlan = () => {
    setIsEditModeSubsPlan(false);
    setErrors({});
  };

  const handleOfferStatusManage = () => {
    setShowOfferStatus(!showOfferStatus);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (originalFormData) {
      setFormData(JSON.parse(JSON.stringify(originalFormData)));
      setSelectedEffType(originalFormData.offer.effType?.split("|") || []);
    }
    setErrors({});
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (activeTab === "detail") {
          if (isEditMode) {
            handleCancelEdit();
          } else if (showOfferStatus) {
            setShowOfferStatus(false);
          } else if (onClose) {
            onClose();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [isEditMode, isEditModeSubsPlan, showOfferStatus, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="flex flex-col px-6 pt-0 mb-0">
      <div className="flex items-center gap-3 p-4 border-b">
        <button onClick={onBack} className="btn btn-sm btn-icon btn-light">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">{subCategory.charAt(0)}</div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg">{detailContent?.offerName || rowData?.offerName || "-"}</span>
          </div>
        </div>
        {onClose && (
          <div className="ml-auto">
            <button onClick={onClose} className="btn btn-sm btn-icon btn-light">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {openSource === "table" && (
        <div className="flex border-b">
          {offerTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === "detail" && (
          <div>
            {isEditMode ? (
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
                  <div className="space-y-4">
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Main Product Name</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">{detailContent?.offerName || rowData?.offerName || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Main Product Code</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">{detailContent?.offerCode || rowData?.offerCode || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Service Type</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">{serviceType.find((item) => item.servType === detailContent?.servType)?.servTypeName || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Lifecycle Type</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">{lifecycleType.find((item) => item.lifecycleType === detailContent?.lifecycleType)?.lifecycleTypeName || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Comments</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">{detailContent?.comments || rowData?.comments || "-"}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Effective Date</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">{detailContent?.effDate || rowData?.effDate || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Expired Date</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">{detailContent?.expDate || rowData?.expDate || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Effective Type</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">{MapDisplayData(detailContent).effectiveTypeDisplay || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Paid Flag</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">{MapDisplayData(detailContent).paidFlagDisplay || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Brand Price Plan</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">{detailContent?.brandPricePlanId || rowData?.brandPricePlanId || "-"}</span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Product Line</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">{MapDisplayData(detailContent).productLineDisplay || "-"}</span>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
                      <button
                        type="button"
                        onClick={handleEditClick}
                        className="px-4 py-2 text-sm font-normal text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                      >
                        Edit
                      </button>
                      </AccessWrapper>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <SubsPlanSubscriptionPlanSection rowData={rowData} />
          </div>
        )}

        {activeTab === "feature" && <FeatureTabContent category={subCategory} rowData={detailContent || rowData} />}

        {activeTab === "relationship" && <RelationshipTabContent rowData={detailContent || rowData} allowedRelationTypes={["Exchangeable"]} />}

        {activeTab === "private-offer-group" && <PrivateOfferGroupContent rowData={rowData} />}

        {showOfferStatus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-6xl h-[90vh] max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">OS</div>
                  <h2 className="text-lg font-semibold">Offer Status Management</h2>
                  <span className="text-sm text-gray-500">- {rowData.offerName}</span>
                </div>
                <button onClick={handleOfferStatusManage} className="btn btn-sm btn-icon btn-light hover:bg-gray-100 transition-colors" title="Close (Esc)">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <OfferStatusManage category={subCategory} rowData={detailContent || rowData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailSubCategorySidebar;
