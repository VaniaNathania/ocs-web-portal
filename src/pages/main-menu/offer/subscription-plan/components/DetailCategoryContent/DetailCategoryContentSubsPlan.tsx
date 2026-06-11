import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import VersionSubsPlan from "./VersionSubsPlan";
import RelationshipTabContent from "../../../main-product/components/DetailCategoryContent/RelationShipTabContent";
import SalesConditionTabContent from "../../../related-product/components/DetailCategoryContent/SalesConditionTabContent";
import SubscriptionPriceContent from "./SubscriptionPriceContent";
import ScriptRuleTabContent from "./ScriptRuleTabContent";
import DetailEditModeSubsPlan from "../DetailEditModeSubsPlan";
import { useSubscriptionPlanOfferListContext } from "../../hooks/useSubscriptionPlanOfferListContext";
import SubsPlanFeatureTabContent from "./SubsPlanFeatureTabContent";
import OfferGroupContentSubsPlanNode from "./OfferGroupContentSubsPlanDrop";
import {
  initialStateAddSubsplan,
  SubsPlanProps,
} from "../../blocks/AddDialogSubsPlan";
import { useOfferLayout } from "@/layouts/main-menu/offer";


interface CategoryDetailSubsPlanProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  rowData: any;
  onSuccess: () => void;
}

export interface DetailDataProps {
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
    saleFlag?: string;
    timeUnit: string;
    cycleQuantity: string;
    priority: string;
    renewal: string;
    autoContinueFlag: string;
    agreementEffType: string;
  };
  servType: string;
  paidFlag: string;
  lifecycleType: number | string | null;
  offerCatgId: string;
  prodType: string;
}

export const initialStateSubsPlan: DetailDataProps = {
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
    saleFlag: "",
    timeUnit: "",
    cycleQuantity: "",
    priority: "",
    renewal: "",
    autoContinueFlag: "",
    agreementEffType: "",
  },
  servType: "",
  paidFlag: "",
  lifecycleType: "",
  offerCatgId: "",
  prodType: "",
};

export const subsPlansTabs = [
  { id: "detail", label: "Detail" },
  { id: "offer-group", label: "Offer Group" },
  { id: "feature", label: "Feature" },
  { id: "relationship", label: "Relationship" },
  { id: "sales-condition", label: "Sales Condition" },
  { id: "subscription-price", label: "Subscription Price" },
  { id: "script-rule", label: "Script Rule" },
];

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "-";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // bulan mulai dari 0
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatSaleFlag = (saleFlag: string) => {
  switch (saleFlag) {
    case "0":
      return "Sold Unlimitedly";
    case "1":
      return "Sold Separately";
    case "2":
      return "Sold In Bundle";
    default:
      return "-";
  }
};

export const formatAutoContinueFlag = (flag: string) => {
  return flag === "Y" ? "Yes" : flag === "N" ? "No" : "-";
};

export const formatProductLine = (prodLine: string) => {
  return prodLine === "F" ? "Fix" : prodLine === "M" ? "Mobile" : "-";
};

export const timeUnitMap: Record<string, string> = {
  Y: "Year",
  M: "Month",
  W: "Week",
  D: "Day",
  H: "Hour",
  C: "Billing Cycle",
  S: "Exact Time",
};

// Mapping untuk Effective Type (sudah ada, tapi diperluas)
export const effectiveTypeMap: Record<string, string> = {
  "1": "Next Day",
  "2": "Next Month",
  "3": "Next Billing Cycle",
  "4": "Today 0:00",
};

// Helper functions untuk mapping
export const formatTimeUnit = (timeUnit: string) => {
  return timeUnitMap[timeUnit] || timeUnit || "-";
};

export const formatEffectiveType = (effType: string) => {
  return effectiveTypeMap[effType] || effType || "-";
};

const API_URL_OFFER = apiConfigOffer.offer;

const DetailCategoryContentSubsPlan: React.FC<CategoryDetailSubsPlanProps> = ({
  isOpen,
  onClose = () => {},
  rowData,
  category,
  onSuccess,
}) => {
  const { GetData, PutData } = useCallApi();
  const { refreshCategorySidebar } = useSubscriptionPlanOfferListContext();
  const [detailData, setDetailData] =
    useState<DetailDataProps>(initialStateSubsPlan);
  const [formData, setFormData] = useState<SubsPlanProps>(
    initialStateAddSubsplan
  );
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSubsPlanTabs, setActiveSubsPlanTabs] = useState("detail");
  const [subscriptionPlanDetail, setSubscriptionPlanDetail] =
    useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [detailContent, setDetailContent] = useState<any>(null);
  const [originalFormData, setOriginalFormData] =
    useState<DetailDataProps | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditModeSubsPlan, setIsEditModeSubsPlan] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceType, setServiceType] = useState<any[]>([]);
  const [lifecycleType, setLifecycleType] = useState<any[]>([]);
  const [selectedEffType, setSelectedEffType] = useState<string[]>([]);
  const [effTypeOpen, setEffTypeOpen] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const currentOfferIdRef = useRef<string | number | null>(null);
  const {selectedVer, selectedSubSubPlan} = useOfferLayout()

  const fetchSubscriptionPlanDetail = async (offerId: string | number) => {
    if (isLoadingDetail) return;
    setIsLoadingDetail(true);
    setLoading(true);
    setError(null);

    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/subs-plan/qry-subs-plan-by-indep-prod-id`,
        {
          indepProdSpecId: offerId,
        }
      );

      if (response?.status) {
        let dataObject: any = {};

        if (Array.isArray(response.data) && response.data.length > 0) {
          dataObject = response.data[0] || {};
        } else if (!Array.isArray(response.data)) {
          dataObject = response.data || {};
        }

        // kalau kosong, fallback ke rowData
        const newFormData: DetailDataProps = {
          offer: {
            offerType: dataObject.offerType || rowData?.offerType || "",
            offerName: dataObject.offerName || rowData?.offerName || "",
            comments: dataObject.comments || rowData?.comments || "",
            offerCode: dataObject.offerCode || rowData?.offerCode || "",
            effDate: formatDate(dataObject.effDate || rowData?.effDate) || "",
            expDate: formatDate(dataObject.expDate || rowData?.expDate) || "",
            effType: dataObject.effType || rowData?.effType || "",
            prodType: dataObject.prodType || rowData?.prodType || "",
            spId: dataObject.spId || rowData?.spId || 0,
            saleFlag: String(dataObject.saleFlag ?? rowData?.saleFlag ?? ""),

            timeUnit: dataObject.timeUnit || rowData?.timeUnit || "",
            cycleQuantity: String(
              dataObject.cycleQuantity || rowData?.cycleQuantity || ""
            ),
            priority: dataObject.priority || rowData?.priority || "",
            renewal: dataObject.renewal || rowData?.renewal || "",
            autoContinueFlag:
              dataObject.autoContinueFlag || rowData?.autoContinueFlag || "N",
            agreementEffType:
              dataObject.agreementEffType || rowData?.agreementEffType || "",
          },
          servType: dataObject.servType || rowData?.servType || "",
          paidFlag: dataObject.paidFlag || rowData?.paidFlag || "",
          lifecycleType: dataObject.lifecycleType
            ? Number(dataObject.lifecycleType)
            : (rowData?.lifecycleType ?? null),
          offerCatgId: dataObject.offerCatgId || rowData?.offerCatgId || "",
          prodType: dataObject.prodType || rowData?.prodType || "",
        };

        const subscriptionDetail = {
          ...dataObject,
          cycleQuantity: dataObject.cycleQuantity || rowData?.cycleQuantity,
          timeUnit: dataObject.timeUnit || rowData?.timeUnit,
        };

        setDetailContent(dataObject);
        setSubscriptionPlanDetail(subscriptionDetail);
        setDetailData(newFormData);
        setOriginalFormData(JSON.parse(JSON.stringify(newFormData)));
        return dataObject;
      } else {
        throw new Error(
          response?.message || "Failed to fetch subscription plan"
        );
      }
    } catch (error) {
      console.error("Error fetching subscription plan:", error);
      setError("Failed to load subscription plan details");
      toast.error("Failed to load subscription plan details");
    } finally {
      setLoading(false);
      setIsLoadingDetail(false);
    }
  };

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  useEffect(() => {
    if (isOpen && rowData && !hasInitialLoad) {
      const offerId =
        rowData.offerId ||
        rowData.id ||
        rowData.subsPlanId ||
        rowData.indepProdSpecId;

      if (offerId && currentOfferIdRef.current !== offerId) {
        currentOfferIdRef.current = offerId;
        fetchSubscriptionPlanDetail(offerId);
        setHasInitialLoad(true);
      }
    }

    // Reset flag when modal closes
    if (!isOpen) {
      setHasInitialLoad(false);
      currentOfferIdRef.current = null;
    }
  }, [isOpen, rowData, hasInitialLoad]);

  useEffect(() => {
    if (!isOpen) {
      setSubscriptionPlanDetail(null);
      setError(null);
      setActiveSubsPlanTabs("detail");
    }
  }, [isOpen]);

  const validateForm = () => {
    const requiredFields = [
      {
        key: "offerReuqestDto.offerName",
        label: "Plan Name",
        getValue: () => formData.offerRequestDto.offerName,
      },
      {
        key: "offerRequestDto.offerCode",
        label: "Plan Code",
        getValue: () => formData.offerRequestDto.offerCode,
      },
      {
        key: "offerRequestDto.effDate",
        label: "Effective Date",
        getValue: () => formData.offerRequestDto.effDate,
      },
      {
        key: "subsPlanRequestDto.priority",
        label: "Priority",
        getValue: () => formData.subsPlanRequestDto.priority,
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

    if (formData.offerRequestDto.autoContinueFlag === "Y") {
      if (!formData.offerRequestDto.cycleQuantity) {
        newErrors["offerRequestDto.cycleQuantity"] =
          "Agreement Period is required";
        isValid = false;
      }

      if (!formData.offerRequestDto.timeUnit) {
        newErrors["offerRequestDto.timeUnit"] = "Time Unit is required";
        isValid = false;
      }
    }

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

    try {
      setIsSubmitting(true);

      const submitPayload: SubsPlanProps = {
        ...formData,
        lifecycleType: formData.lifecycleType,
        lifecyleFlag: formData.lifecyleFlag,
        staffJobId: formData.staffJobId,
        actionState: formData.actionState,
        checkPeriod: formData.checkPeriod,
        spId: formData.spId,
        offerId: formData.offerId,
        subsPlanRequestDto: {
          ...formData.subsPlanRequestDto,
          subsPlanId: formData.subsPlanRequestDto.subsPlanId,
          indepProdSpecId: formData.subsPlanRequestDto.indepProdSpecId,
          priority: formData.subsPlanRequestDto.priority,
          effDate: formatDateForInput(formData.subsPlanRequestDto.effDate),
          expDate: formatDateForInput(formData.subsPlanRequestDto.expDate),
          saleFlag: formData.subsPlanRequestDto.saleFlag,
          spId: formData.subsPlanRequestDto.spId,
          isBundleFlag: formData.subsPlanRequestDto.isBundleFlag,
          subsPlanCode: formData.subsPlanRequestDto.subsPlanCode,
          subsPlanName: formData.subsPlanRequestDto.subsPlanName,
        },
        offerRequestDto: {
          ...formData.offerRequestDto,
          offerId: formData.offerRequestDto.offerId,
          offerType: formData.offerRequestDto.offerType,
          offerName: formData.offerRequestDto.offerName,
          comments: formData.offerRequestDto.comments,
          offerCode: formData.offerRequestDto.offerCode,
          saleListPrice: formData.offerRequestDto.saleListPrice,
          rentListPrice: formData.offerRequestDto.rentListPrice,
          effDate: formatDateForInput(formData.offerRequestDto.effDate),
          expDate: formatDateForInput(formData.offerRequestDto.expDate),
          effType: formData.offerRequestDto.effType,
          autoContinueFlag: formData.offerRequestDto.autoContinueFlag,
          cycleQuantity: formData.offerRequestDto.cycleQuantity,
          timeUnit: formData.offerRequestDto.timeUnit,
          duplicateFlag: formData.offerRequestDto.duplicateFlag,
          spId: formData.offerRequestDto.spId,
          expOff: formData.offerRequestDto.expOff,
          expTimeUnit: formData.offerRequestDto.expTimeUnit,
          agreementEffType: formData.offerRequestDto.agreementEffType,
          prodType: formData.offerRequestDto.prodType,
          createdDate: formData.offerRequestDto.createdDate,
        },
        offerVerRequestDto: {
          ...formData.offerVerRequestDto,
          //   offerVerId: formData.offerVerRequestDto.offerVerId,
          //   offerId: formData.offerVerRequestDto.offerId,
          effDate: formatDateForInput(formData.offerVerRequestDto.effDate),
          expDate: formatDateForInput(formData.offerVerRequestDto.expDate),
          //   spId: formData.offerVerRequestDto.spId,
          //   state: formData.offerVerRequestDto.state,
          //   refOfferVerId: formData.offerVerRequestDto.refOfferVerId,
        },
      };

      const response = await PutData(
        `${API_URL_OFFER}/offer/subs-plan/mod-subs-plan`,
        submitPayload
      );

      if (response?.status) {
        toast.success("Subscription plan updated successfully");
        await refreshCategorySidebar();
        onSuccess?.();
        onClose();
      } else {
        toast.error(response?.message || "Failed to update subscription plan");
      }
    } catch (error: any) {
      console.error("❌ Submit error:", error);
      toast.error("Failed to update subscription plan");
      setAlert({
        show: true,
        message: error?.message || "Failed to update subscription plan",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function untuk fetch lifecycle type
  const fetchLifecycleType = async (spId: number) => {
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/common/qry-lifecycle-type`,
        {
          lifecycleType: "",
          spId: spId,
        }
      );
      if (response?.data) {
        setLifecycleType(response?.data);
      }
    } catch (error) {
      toast.error("Error GET Lifecycle Type data");
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditClickSubsPlan = () => {
    setIsEditModeSubsPlan(true);
    setErrors({});
    setActiveSubsPlanTabs("detail");
  };

  const handleCancelEditSubsPlan = () => {
    setIsEditModeSubsPlan(false);
    setErrors({});
  };

  useEffect(() => {
    if (isOpen && (rowData?.offerId || rowData?.id)) {
      fetchLifecycleType(0);
    }
  }, [isOpen, rowData?.offerId, rowData?.id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full p-3 overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                {category.charAt(0)}
              </div>
              <span>Detail Subscription Plan - {category}</span>
              <div className="pl-2">
                <VersionSubsPlan />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <span>⚠️ {error}</span>
                </div>
              )}
            </DialogTitle>
            <div className="mr-5 flex gap-2">
              <Button variant="default">Offer Status Manage</Button>
              <Button variant="outline">Compare</Button>
              <Button variant="outline">Publish</Button>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="overflow-y-auto">
          <div className="mb-5">
            {subsPlansTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubsPlanTabs(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeSubsPlanTabs === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeSubsPlanTabs === "detail" && (
            <div className="max-w-7xl w-full p-3 pt-5 overflow-hidden">
              {isEditModeSubsPlan ? (
                <DetailEditModeSubsPlan
                  formDataSubsPlan={formData}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  lifecycleType={lifecycleType}
                  selectedEffType={selectedEffType}
                  effTypeOpen={effTypeOpen}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  onCancel={handleCancelEditSubsPlan}
                  setSelectedEffType={setSelectedEffType}
                  setEffTypeOpen={setEffTypeOpen}
                  rowData={rowData}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start pb-2">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Plan Name
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {subscriptionPlanDetail?.offerName ||
                          rowData?.offerName ||
                          "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start pb-2">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Lifecycle Type
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {subscriptionPlanDetail?.lifecycleType ||
                          rowData?.lifecycleType ||
                          "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start pb-2">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Effective Date
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatDate(
                          subscriptionPlanDetail?.effDate ||
                            rowData?.effDate ||
                            "-"
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start pb-2">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Plan Code
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {subscriptionPlanDetail?.offerCode ||
                          rowData?.offerCode ||
                          "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start pb-2">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Agreement Effective Type
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatEffectiveType(
                          subscriptionPlanDetail?.agreementEffType ||
                            rowData?.agreementEffType ||
                            "-"
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Remarks
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {subscriptionPlanDetail?.comments ||
                          rowData?.comments ||
                          "-"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start pb-2">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Sale Type
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatSaleFlag(
                          subscriptionPlanDetail?.saleFlag ||
                            rowData?.saleFlag ||
                            "-"
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start pb-2">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Agreement Period
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {subscriptionPlanDetail?.cycleQuantity
                          ? `${subscriptionPlanDetail.cycleQuantity || rowData?.cycleQuantity || "-"} ${formatTimeUnit(subscriptionPlanDetail.timeUnit || rowData?.timeUnit)}`
                          : "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start pb-2">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Expiry Date
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatDate(
                          subscriptionPlanDetail?.expDate ||
                            rowData?.expDate ||
                            "-"
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start pb-2">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {subscriptionPlanDetail?.priority ||
                          rowData?.priority ||
                          "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start pb-2">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Renewal
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatAutoContinueFlag(
                          subscriptionPlanDetail?.autoContinueFlag ||
                            rowData?.autoContinueFlag ||
                            "-"
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Product Line
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatProductLine(
                          subscriptionPlanDetail?.prodType ||
                            rowData?.prodType ||
                            "-"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-3">
                {!isEditModeSubsPlan && (
                  <>
                    <Button type="button" variant="outline" onClick={onClose}>
                      Close
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      onClick={handleEditClickSubsPlan}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Tab lainnya */}
          {activeSubsPlanTabs === "offer-group" && (
            // <OfferGroupContentSubsPlan rowData={subscriptionPlanDetail || rowData} />
            <OfferGroupContentSubsPlanNode
              rowData={subscriptionPlanDetail || rowData}
            />
          )}
          {activeSubsPlanTabs === "feature" && (
            <SubsPlanFeatureTabContent
              payload={{offerId: selectedSubSubPlan.indepProdSpecId, subsPlanVerId: selectedVer?.offerVerId} }
            />
          )}
          {activeSubsPlanTabs === "relationship" && (
            <RelationshipTabContent
              rowData={subscriptionPlanDetail || rowData}
              allowedRelationTypes={["Exchangeable", "Mutually Exclusive"]}
            />
          )}
          {activeSubsPlanTabs === "sales-condition" && (
            <SalesConditionTabContent
              offerId={(subscriptionPlanDetail || rowData)?.offerId}
              rowData={subscriptionPlanDetail || rowData}
            />
          )}
          {activeSubsPlanTabs === "subscription-price" && (
            <SubscriptionPriceContent />
          )}
          {activeSubsPlanTabs === "script-rule" && <ScriptRuleTabContent />}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default DetailCategoryContentSubsPlan;
