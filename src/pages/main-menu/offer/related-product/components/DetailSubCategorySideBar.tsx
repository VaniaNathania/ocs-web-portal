import React, { useState, useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import OfferStatusManage from "./OfferStatusManage";
import RelationshipTabContent from "../../main-product/components/DetailCategoryContent/RelationShipTabContent";
import SalesConditionTabContent from "./DetailCategoryContent/SalesConditionTabContent";
import BelongPackageTabContent from "./DetailCategoryContent/BelongPackageContent";
import BelongInOfferTabContent from "./DetailCategoryContent/BelongOfferGroupContent";
import ScriptRuleTabContent from "./DetailCategoryContent/ScriptRuleTabContent";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import {
  getEffectiveTypeLabel,
  getDuplicateOrderLabel,
  getYesNoLabel,
  renderExpOff,
  agreementPeriod,
  getServTypeName,
  getLifecycleType,
  AgreementEff,
  formatNumber,
} from "./types";
import RelatedProductActions from "../actions/RelatedProductActions";
import { useRelatedProductOfferListContext } from "../hooks/useRelatedProductOfferListContext";
import DetailEditMode from "../blocks/DetailEditMode";
import FeatureTabContent from "../../main-product/components/DetailCategoryContent/FeatureTabContent";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";

interface CategoryDetailProps {
  category: string;
  onBack: () => void;
  rowData: any;
  isOpen: boolean;
}

export interface FormData {
  offerId: string;
  servType: number | string; // Fixed: allow both number and string
  isPackage: string;
  spId: number | null;
  offer: {
    offerId: string;
    offerType: string;
    offerName: string;
    comments: string | null;
    offerCode: string;
    saleListPrice: number | null;
    rentListPrice: number | null;
    effDate: string;
    expDate: string;
    effType: string;
    autoContinueFlag: string | null;
    cycleQuantity: number | null;
    timeUnit: string | null;
    duplicateFlag: string | null;
    spId: number | null;
    expOff: number | null;
    expTimeUnit: string | null;
    agreementEffType: string | null;
    prodType?: string; // Added missing field
  };
  lifecycleType: number | string | null; // Fixed: allow string
  offerCatgId: string;
  networkType: string;
  paidFlag?: string; // Added missing field
  prodType?: string; // Added missing field
}

export const initialStateDetailSidebar: FormData = {
  offerId: "",
  servType: 0,
  isPackage: "",
  spId: null,
  offer: {
    offerId: "",
    offerType: "3",
    offerName: "",
    comments: null,
    offerCode: "",
    saleListPrice: null,
    rentListPrice: null,
    effDate: "",
    expDate: "",
    effType: "B",
    autoContinueFlag: null,
    cycleQuantity: null,
    timeUnit: null,
    duplicateFlag: null,
    spId: null,
    expOff: null,
    expTimeUnit: null,
    agreementEffType: null,
    prodType: "", // Added missing field
  },
  lifecycleType: null,
  offerCatgId: "",
  networkType: "C",
  paidFlag: "", // Added missing field
  prodType: "", // Added missing field
};

const tabs = [
  { id: "detail", label: "Detail" },
  { id: "feature", label: "Feature" },
  { id: "relationship", label: "Relationship" },
  { id: "sales-condition", label: "Sales Condition" },
  { id: "belong-package", label: "Belong in Package" },
  { id: "belong-offer", label: "Belong in Offer Group" },
  { id: "script-rule", label: "Script Rule" },
];

const API_URL_OFFER = apiConfigOffer.offer;

const CategoryDetail: React.FC<CategoryDetailProps> = ({ category, onBack, rowData, isOpen }) => {
  const { GetData, PutData } = useCallApi();
  const {
    handleEditDialog,
    selectedCategory,
    setSelectedCategory,
    refreshCategorySideBar,
    setRefreshOfferListSidebar,
    selectedCategoryId,
  } = useRelatedProductOfferListContext();
  const {menuPrivAccess} = useOfferLayout()
  const [formData, setFormData] = useState<FormData>(initialStateDetailSidebar); // Fixed: use correct initial state
  const { serviceType, lifecycleType, fetchLifecycleType, fetchServiceTypeList } = RelatedProductActions();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("detail");
  const [showOfferStatus, setShowOfferStatus] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [detailContent, setDetailContent] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);
  const [effTypeOpen, setEffTypeOpen] = useState(false);
  const [selectedEffType, setSelectedEffType] = useState<string[]>([]);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [displayTitle, setDisplayTitle] = useState(category);

  const categoryName =
    typeof category === "string" ? category : rowData?.offerName || rowData?.categoryName || "Unknown Category";

  const fetchDetailCategoryContent = async (offerId: string) => {
    if (!offerId) {
      console.error("OfferId is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    const params = {
      dependProdSpecId: offerId,
    };

    try {
      const response = await GetData(`${API_URL_OFFER}/offer/depend/qry-depend-prod-detail-by-offer-id`, params);

      if (response?.status && response?.data) {
        let dataObject;
        if (Array.isArray(response.data)) {
          dataObject = response.data[0] || {};
        } else {
          dataObject = response.data;
        }

        setDetailContent(dataObject);
        const newFormData: FormData = {
          offerId: dataObject.offerId || "", // Fixed: add missing field
          servType: dataObject.servType ? String(dataObject.servType) : "",
          isPackage: dataObject.isPackage || "", // Fixed: add missing field
          spId: dataObject.spId || null, // Fixed: add missing field
          offer: {
            offerId: dataObject.offerId || "", // Fixed: add missing field
            offerType: dataObject.offerType || "2",
            offerName: dataObject.offerName || "",
            comments: dataObject.comments || "",
            offerCode: dataObject.offerCode || "",
            saleListPrice: dataObject.saleListPrice || null, // Fixed: add missing field
            rentListPrice: dataObject.rentListPrice || null, // Fixed: add missing field
            effDate: dataObject.effDate || "",
            expDate: dataObject.expDate || "",
            effType: dataObject.effType || "",
            autoContinueFlag: dataObject.autoContinueFlag || null, // Fixed: add missing field
            cycleQuantity: dataObject.cycleQuantity || null, // Fixed: add missing field
            timeUnit: dataObject.timeUnit || null, // Fixed: add missing field
            duplicateFlag: dataObject.duplicateFlag || null, // Fixed: add missing field
            spId: dataObject.spId || null,
            expOff: dataObject.expOff || null, // Fixed: add missing field
            expTimeUnit: dataObject.expTimeUnit || null, // Fixed: add missing field
            agreementEffType: dataObject.agreementEffType || null, // Fixed: add missing field
            prodType: dataObject.prodType || "",
          },
          lifecycleType: dataObject.lifecycleType ? Number(dataObject.lifecycleType) : null,
          offerCatgId: dataObject.offerCatgId || "",
          networkType: dataObject.networkType || "C", // Fixed: add missing field
          paidFlag: dataObject.paidFlag || "",
          prodType: dataObject.prodType || "",
        };

        setFormData(newFormData);
        setOriginalFormData(JSON.parse(JSON.stringify(newFormData)));
        return dataObject;
      } else {
        throw new Error("Data tidak ditemukan atau response tidak valid");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal fetch detail content";
      console.error("❌ Error fetching detail:", err);
      setError(errorMessage);
      toast.error(`Gagal memuat detail: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

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

  const validateForm = () => {
    const requiredFields = [
      { key: "offer.offerName", label: "Offer Name" },
      { key: "offer.offerCode", label: "Code" },
      { key: "offer.effDate", label: "Effective Date" },
      { key: "offer.effType", label: "Effective Type" },
      { key: "isPackage", label: "Is Package" },
    ];

    const newErrors: Record<string, string> = {};
    let isValid = true;

    setAlert({ show: false, message: "" });

    requiredFields.forEach(({ key, label }) => {
      let value;
      if (key.startsWith("offer.")) {
        const offerField = key.replace("offer.", "");
        value = formData.offer[offerField as keyof typeof formData.offer];
      } else {
        value = formData[key as keyof FormData];
      }

      const isEmpty = value === "" || value === null || value === undefined;

      if (isEmpty) {
        newErrors[key] = `${label} is required`;
        isValid = false;
      }
    });

    if (!formData.servType || formData.servType === 0) {
      newErrors["servType"] = "Service Type is required";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      const firstError = Object.values(newErrors)[0];
      setAlert({
        show: true,
        message: firstError || "Please fill in all required fields",
      });
    }

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

    const category = selectedCategory as any;

    const offerIdtoUse = formData.offerId || category?.offerId;

    const payloadToSend = {
      dependProdSpecId: Number(offerIdtoUse), //penting
      servType: Number(formData.servType), //penting
      isPackage: formData.isPackage, //penting
      spId: formData.spId,
      networkType: formData.networkType,
      lifecycleType: formData.lifecycleType,
      offer: {
        offerId: Number(offerIdtoUse), //penting
        offerType: formData.offer.offerType, //penting
        offerName: formData.offer.offerName,
        duplicateFlag: formData.offer.duplicateFlag,
        comments: formData.offer.comments,
        offerCode: formData.offer.offerCode,
        saleListPrice: formData.offer.saleListPrice,
        rentListPrice: formData.offer.rentListPrice,
        effDate: formData.offer.effDate,
        expDate: formData.offer.expDate,
        effType: formData.offer.effType,
        autoContinueFlag: formData.offer.autoContinueFlag,
        agreementEffType: formData.offer.agreementEffType,
        spId: formData.offer.spId,
        expOff: formData.offer.expOff,
        expTimeUnit: formData.offer.expTimeUnit,
        cycleQuantity: formData.offer.cycleQuantity,
        timeUnit: formData.offer.timeUnit,
      },
    };

    setIsSubmitting(true);

    try {
      const response = await PutData(`${API_URL_OFFER}/offer/depend/mod-depend-prod-spec`, payloadToSend);

      if (response?.status) {
        toast.success("Related Product has been successfully updated!");

        if (offerIdtoUse) {
          const updatedData = await fetchDetailCategoryContent(offerIdtoUse);

          if (updatedData?.offerName) {
            setSelectedCategory(updatedData.offerName);
            setDisplayTitle(updatedData.offerName);
          }
        }

        // if (reload) {
        //   reload();
        // }

        // const updateActivity = {
        //   module: "Manage Related Product",
        //   description: `Update Related Product => ${formData.offer.offerName}`,
        //   action: "U",
        // };
        // doSaveLogActivity(updateActivity);

        setIsEditMode(false);
        setErrors({});

        if (selectedCategoryId) {
          setRefreshOfferListSidebar(selectedCategoryId);
        }

        await refreshCategorySideBar();

        // handleEditDialog(false, null);
      } else {
        const errorMessage = response?.message || "Failed to update Related Product. Please try again.";
        toast.error(errorMessage);
        setAlert({
          show: true,
          message: errorMessage,
        });
        console.error("❌ API returned an error");
      }
    } catch (error: any) {
      const errorMessage = error?.message || "An error occurred. Please try again.";
      console.error("❌ API returned an error:", error);
      toast.error(errorMessage);
      setAlert({
        show: true,
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getValidPeriod = (effDate: string, expDate: string) => {
    if (effDate && expDate) {
      return `${effDate} - ${expDate}`;
    }
    return "-";
  };

  const handleOfferStatusManage = () => {
    // console.log("👉 Toggle Offer Status:", !showOfferStatus);
    setShowOfferStatus(!showOfferStatus);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (originalFormData) {
      setFormData(JSON.parse(JSON.stringify(originalFormData)));
    }
    setErrors({});
  };

  const handleEdit = () => {
    if (isEditMode) {
      return;
    }

    const hasDetailEditMode = detailContent || rowData;

    if (hasDetailEditMode) {
      setIsEditMode(true);
      setErrors({});
    } else {
      const dataToEdit = detailContent || rowData;
      // console.log("Edit button clicked - dataToEdit:", dataToEdit);

      if (dataToEdit) {
        handleEditDialog(true, dataToEdit);
      } else {
        console.error("No data available for editing");
      }
    }
  };

  useEffect(() => {
    if (rowData?.offerId) {
      fetchDetailCategoryContent(rowData.offerId);
    } else if (rowData?.id) {
      fetchDetailCategoryContent(rowData.id);
    } else {
      console.warn("No offerId or id found in rowData");
    }
  }, [rowData?.offerId, rowData?.id]);

  useEffect(() => {
    if (isOpen) {
      fetchServiceTypeList();
      fetchLifecycleType();
    }
  }, [isOpen, fetchServiceTypeList, fetchLifecycleType]);

  useEffect(() => {
    if (detailContent?.offerName) {
      // Update both states
      setSelectedCategory(detailContent.offerName);
      setDisplayTitle(detailContent.offerName);
    }
  }, [detailContent?.offerName]);

  return (
    <>
      <div className="flex flex-col px-6 pt-0 mb-0">
        {/* Header with back button */}
        <div className="flex items-center gap-3 p-4 border-b">
          <button onClick={onBack} className="btn btn-sm btn-icon btn-light">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              {categoryName.charAt(0)}
            </div>
            <span className="font-semibold text-lg">{displayTitle}</span>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <span>⚠️ Error loading data</span>
              </div>
            )}
          </div>
          <div className="ml-auto">
            <button type="button" onClick={handleOfferStatusManage} className="px-3 py-1 border rounded">
              Offer Status Manage
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
              {isEditMode ? (
                <DetailEditMode
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  setErrors={setErrors}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Offer Name</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900 break-words whitespace-normal">
                        {detailContent?.offerName || rowData?.offerName || "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Offer Code</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900 break-words whitespace-normal">
                        {detailContent?.offerCode || rowData?.offerCode || "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Effective Type</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">
                        {getEffectiveTypeLabel(detailContent?.effType || rowData?.effType)}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Service Type</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900 break-words whitespace-normal">
                        {getServTypeName(detailContent?.servType ?? rowData?.servType, serviceType)}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Lifecycle Type</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900 break-words whitespace-normal">
                        {getLifecycleType(detailContent?.lifecycleType ?? rowData?.lifecycleType, lifecycleType)}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Sale Price</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">
                        {formatNumber(detailContent?.saleListPrice ?? rowData?.saleListPrice)}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Rent Price</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">
                        {formatNumber(detailContent?.rentListPrice ?? rowData?.rentListPrice)}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Duplicate Order</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">
                        {getDuplicateOrderLabel(detailContent?.duplicateFlag || rowData?.duplicateFlag || "-")}
                      </span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Valid Period</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">
                        {getValidPeriod(
                          detailContent?.effDate || rowData?.effDate,
                          detailContent?.expDate || rowData?.expDate
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Is Package</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">
                        {getYesNoLabel(detailContent?.isPackage || rowData?.isPackage || "-")}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Automatic Renewal</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">
                        {getYesNoLabel(detailContent?.autoContinueFlag || rowData?.autoContinueFlag || "-")}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Order Time Limit</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">
                        {renderExpOff(detailContent?.expOff, detailContent?.expTimeUnit)}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Agreement Period</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">
                        {agreementPeriod(detailContent?.cycleQuantity, detailContent?.timeUnit)}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Agreement Effective Type</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">
                        {AgreementEff(detailContent?.agreementEffType || rowData?.agreementEffType || "-")}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">Remarks</label>
                      <span className="text-sm font-medium text-gray-700">:</span>
                      <span className="text-sm text-gray-900">
                        {detailContent?.comments || rowData?.comments || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer with Edit button */}
              {!isEditMode && (
                <div className="p-4">
                  <div className="flex justify-end">
                    <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
                    <Button type="button" onClick={handleEdit} disabled={!detailContent && !rowData}>
                      Edit
                    </Button>
                    </AccessWrapper>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feature Tab - INTEGRASI YANG BENAR */}
          {activeTab === "feature" && <FeatureTabContent category={category} rowData={detailContent || rowData} />}

          {activeTab === "relationship" && (
            <RelationshipTabContent rowData={detailContent || rowData} allowedRelationTypes={["Mutually Exclusive", "Dependent", "Dependent for automatic order", "Weakly Dependent"]} />
          )}

          {activeTab === "sales-condition" && (
            <SalesConditionTabContent category={category} rowData={detailContent || rowData} />
          )}

          {activeTab === "belong-package" && (
            <BelongPackageTabContent category={category} rowData={detailContent || rowData} />
          )}

          {activeTab === "belong-offer" && (
            <BelongInOfferTabContent category={category} rowData={detailContent || rowData} />
          )}

          {activeTab === "script-rule" && <ScriptRuleTabContent />}

          {/* Tabs lainnya yang belum diimplementasi */}
          {![
            "detail",
            "feature",
            "relationship",
            "sales-condition",
            "belong-package",
            "belong-offer",
            "script-rule",
          ].includes(activeTab) && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-gray-400 text-lg mb-2">No data available</div>
                <div className="text-gray-500 text-sm">
                  Content for {tabs.find((t) => t.id === activeTab)?.label} will be displayed here
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Offer Status Manage Card - Overlay */}
      {showOfferStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-6xl h-[90vh] max-h-[90vh] flex flex-col">
            {/* Card Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  OS
                </div>
                <h2 className="text-lg font-semibold">Offer Status Management</h2>
                <span className="text-sm text-gray-500">- {category}</span>
              </div>
              <button
                onClick={handleOfferStatusManage}
                className="btn btn-sm btn-icon btn-light hover:bg-gray-100 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Card Content */}
            <div className="flex-1 overflow-hidden">
              <OfferStatusManage category={category} rowData={detailContent || rowData} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryDetail;
