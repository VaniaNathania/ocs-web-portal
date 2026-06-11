import { X, ArrowLeft } from "lucide-react";
import EditDetailSubCategoryContent from "../../blocks/EditDialog";
import RelationshipTabContent from "../../../main-product/components/DetailCategoryContent/RelationShipTabContent";
import SalesConditionTabContent from "./SalesConditionTabContent";
import BelongPackageTabContent from "./BelongPackageContent";
import BelongInOfferTabContent from "./BelongOfferGroupContent";
import ScriptRuleTabContent from "./ScriptRuleTabContent";
import { Button } from "@/components/ui/button";
import OfferStatusManage from "../OfferStatusManage";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { NumericFormat } from "react-number-format";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { useRelatedProductOfferListContext } from "../../hooks/useRelatedProductOfferListContext";
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
} from "../types";
import RelatedProductActions from "../../actions/RelatedProductActions";
import { FormData } from "../DetailSubCategorySideBar";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import DetailEditMode from "../../blocks/DetailEditMode";
import { useDataGrid } from "@/components";
import { useEffect, useState } from "react";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import FeatureTabContent from "../../../main-product/components/DetailCategoryContent/FeatureTabContent";

const API_URL_OFFER = apiConfigOffer.offer;

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  rowData: any;
}

const tabs = [
  { id: "detail", label: "Detail" },
  { id: "feature", label: "Feature" },
  { id: "relationship", label: "Relationship" },
  { id: "sales-condition", label: "Sales Condition" },
  { id: "belong-package", label: "Belong in Package" },
  { id: "belong-offer", label: "Belong in Offer Group" },
  { id: "script-rule", label: "Script Rule" },
];

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({ isOpen, onClose, category, rowData }) => {
  const { GetData, PutData } = useCallApi();
  const { reload } = useDataGrid();
  const { serviceType, lifecycleType, fetchServiceTypeList, fetchLifecycleType } = RelatedProductActions();
  const {
    handleEditDialog,
    selectedCategory,
    shouldOpenModalInEditMode,
    setShouldOpenModalInEditMode,
    refreshCategorySideBar,
    setRefreshOfferListSidebar,
    setSelectedCategory,
    selectedCategoryId,
  } = useRelatedProductOfferListContext();
  const [activeTab, setActiveTab] = useState("detail");
  const [showOfferStatus, setShowOfferStatus] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [detailContent, setDetailContent] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEffType, setSelectedEffType] = useState<string[]>([]);
  const [effTypeOpen, setEffTypeOpen] = useState(false);
  const [displayTitle, setDisplayTitle] = useState(category);

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

          if (reload) {
            reload();
          }
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
    setFormData((prev: any) => {
      const newData = { ...prev };

      if (field.startsWith("offer.")) {
        const offerField = field.replace("offer.", "") as keyof FormData["offer"];
        newData.offer = { ...prev.offer, [offerField]: value };
      } else {
        (newData as any)[field] = value;
      }

      return newData;
    });

    // Clear error for this field when user is typing/changing value
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Clear alert when user makes changes
    if (alert.show) {
      setAlert({ show: false, message: "" });
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
      dependProdSpecId: Number(offerIdtoUse),
      servType: Number(formData.servType),
      isPackage: formData.isPackage,
      spId: formData.spId,
      networkType: formData.networkType,
      lifecycleType: formData.lifecycleType,
      offer: {
        offerId: Number(offerIdtoUse),
        offerType: formData.offer.offerType,
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

        if (reload) {
          reload();
        }

        setIsEditMode(false);
        setErrors({});
        setAlert({ show: false, message: "" });

        if (targetId) {
          const updatedData = await fetchDetailCategoryContent(targetId);

          if (updatedData?.offerName) {
            setSelectedCategory(updatedData.offerName);
            setDisplayTitle(updatedData.offerName);
          }
        }

        // ✅ FIX: Ambil categoryId dari multiple sources
        const categoryId =
          detailContent?.offerCatgId?.toString() || rowData?.offerCatgId?.toString() || selectedCategoryId;

        if (categoryId) {
          setRefreshOfferListSidebar(categoryId);
        } else {
          console.warn("⚠️ [SUBMIT] categoryId not found, sidebar offer list won't refresh");
        }

        await refreshCategorySideBar();
      } else {
        console.error("❌ [SUBMIT] Update failed:", response);
        const errorMessage = response?.message || "Failed to update Related Product. Please try again.";
        toast.error(errorMessage);
        setAlert({
          show: true,
          message: errorMessage,
        });
      }
    } catch (error: any) {
      console.error("❌ [SUBMIT] Error during update:", error);
      const errorMessage = error?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);
      setAlert({
        show: true,
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getValidPeriod = (effDate: string, expDate?: string) => {
    return expDate ? `${effDate} - ${expDate}` : effDate;
  };

  const handleOfferStatusManage = () => {
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

  const { menuPrivAccess } = useOfferLayout();

  useEffect(() => {
    if (shouldOpenModalInEditMode && detailContent && isOpen) {
      setIsEditMode(true);
      setShouldOpenModalInEditMode(false); // Reset flag
    }
  }, [shouldOpenModalInEditMode, detailContent, isOpen, setShouldOpenModalInEditMode]);

  //untuk reset edit mode saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setIsEditMode(false);
      setShouldOpenModalInEditMode(false);
    }
  }, [isOpen, setShouldOpenModalInEditMode]);

  // Di CategoryDetailModal component
  // Update useEffect
  useEffect(() => {
    if (detailContent?.offerName) {
      // Update both states
      setSelectedCategory(detailContent.offerName);
      setDisplayTitle(detailContent.offerName);
    }
  }, [detailContent?.offerName]);

  // If loading or no data, show loading state
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl w-full p-3 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                {(detailContent?.offerName || selectedCategory || category).charAt(0)}
              </div>
              <span>Detail Related Product - {displayTitle}</span>
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <span>⚠️ Error loading data</span>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Loading detail information...</div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl w-full p-3 overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between w-full">
              <DialogTitle className="text-lg flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  {category.charAt(0)}
                </div>
                <span>Detail Related Product - {displayTitle}</span>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <span>⚠️ Error loading data</span>
                  </div>
                )}
              </DialogTitle>
              <Button className="mr-3" variant="outline" onClick={handleOfferStatusManage}>
                Offer Status Manage
              </Button>
            </div>
            <DialogDescription />
          </DialogHeader>

          <DialogBody className="max-h-[75vh] overflow-y-auto">
            {/* Tabs */}
            <div className="flex border-b bg-gray-50 mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-normal border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 bg-white"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "detail" && (
              <div className="max-w-7xl w-full p-3 overflow-hidden">
                {/* <div className="max-h-[75vh] overflow-y-auto"> */}
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
                        <span className="text-sm text-gray-900">
                          {detailContent?.offerName || rowData?.offerName || "-"}
                        </span>
                      </div>

                      <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                        <label className="w-40 text-sm font-medium text-gray-700">Offer Code</label>
                        <span className="text-sm font-medium text-gray-700">:</span>
                        <span className="text-sm text-gray-900">
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
                        <span className="text-sm text-gray-900">
                          {getServTypeName(detailContent?.servType ?? rowData?.servType, serviceType)}
                        </span>
                      </div>

                      <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                        <label className="w-40 text-sm font-medium text-gray-700">Lifecycle Type</label>
                        <span className="text-sm font-medium text-gray-700">:</span>
                        <span className="text-sm text-gray-900">
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
                {/* Footer Buttons */}
                <div className="flex justify-end gap-4 mt-6">
                  {!isEditMode && (
                    <>
                      <Button type="button" variant="outline" onClick={onClose} disabled={!detailContent && !rowData}>
                        Close
                      </Button>
                      <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
                        <Button type="button" onClick={handleEdit} disabled={!detailContent && !rowData}>
                          Edit
                        </Button>
                      </AccessWrapper>
                    </>
                  )}
                </div>
              </div>
              // </div>
            )}

            {/* Other Tabs */}
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

            {/* Default content for unimplemented tabs */}
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
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Offer Status Manage Modal */}
      {showOfferStatus && (
        <Dialog open={showOfferStatus} onOpenChange={() => setShowOfferStatus(false)}>
          <DialogContent className="max-w-6xl w-full p-3 overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  OS
                </div>
                <span>Offer Status Management - {category}</span>
              </DialogTitle>
              <DialogDescription />
            </DialogHeader>

            <DialogBody className="max-h-[75vh] overflow-y-auto">
              <OfferStatusManage category={category} rowData={detailContent || rowData} />
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CategoryDetailModal;
