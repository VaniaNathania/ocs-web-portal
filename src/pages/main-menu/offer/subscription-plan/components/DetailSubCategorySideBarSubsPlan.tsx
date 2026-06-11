import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useCallback, useEffect, useState } from "react";
import {
  formatAutoContinueFlag,
  formatDate,
  formatEffectiveType,
  formatProductLine,
  formatTimeUnit,
  subsPlansTabs,
} from "./DetailCategoryContent/DetailCategoryContentSubsPlan";
import { toast } from "sonner";
import { useSubscriptionPlanOfferListContext } from "../hooks/useSubscriptionPlanOfferListContext";
import { ArrowLeft } from "lucide-react";
import VersionSubsPlan from "./DetailCategoryContent/VersionSubsPlan";
import { Button } from "@/components/ui/button";
import DetailEditModeSubsPlan from "./DetailEditModeSubsPlan";
import RelationshipTabContent from "../../main-product/components/DetailCategoryContent/RelationShipTabContent";
import SalesConditionTabContent from "../../related-product/components/DetailCategoryContent/SalesConditionTabContent";
import ScriptRuleTabContent from "./DetailCategoryContent/ScriptRuleTabContent";
import SubscriptionPriceContent from "./DetailCategoryContent/SubscriptionPriceContent";
import { formatSaleFlag } from "./DetailCategoryContent/DetailCategoryContentSubsPlan";
import SubsPlanFeatureTabContent from "./DetailCategoryContent/SubsPlanFeatureTabContent";
import OfferGroupContentSubsPlanNode from "./DetailCategoryContent/OfferGroupContentSubsPlanDrop";
import {
  initialStateAddSubsplan,
  SubsPlanProps,
} from "../blocks/AddDialogSubsPlan";
import { formatDateForInput } from "../blocks/EditDialogSubsPlan";
import { getAuth } from "@/auth";
import OfferStatusManageModal from "./OfferStatusManageSubsPlanModal";
import CompareSubsPlanModal from "./CompareSubsPlanModal";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import PublishSubsPlan from "./PublishSubsPlan";
import { useNavigate } from "react-router";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface CategoryDetailSubsPlanProps {
  isOpen: boolean;
  onBack: () => void;
  onClose: () => void;
  rowData: any;
  subCategory: string;
  // onSuccess: () => void;
  onUpdatePlanInSidebar: (updatedPlan: any) => void;
}

const API_URL_OFFER = apiConfigOffer.offer;

const DetailSubCategorySideBarSubsPlan: React.FC<
  CategoryDetailSubsPlanProps
> = ({ isOpen, onBack, rowData, subCategory, onUpdatePlanInSidebar }) => {
  const { GetData, PutData } = useCallApi();
  const { moveToSubsPlan, setMoveToSubsPlan, setActiveTab, menuPrivAccess } = useOfferLayout();
  const navigate = useNavigate();
  const parsedUser = getAuth()?.user;
  const {
    refreshCategorySidebar,
    refreshSubsPlanSection,
    fetchVersions,
    showDetailView,
    setShowDetailView,
    loadingVersions,
    versions,
  } = useSubscriptionPlanOfferListContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailContent, setDetailContent] = useState<any>(null);
  const [formData, setFormData] = useState<SubsPlanProps>(
    initialStateAddSubsplan,
  );
  const [originalFormData, setOriginalFormData] =
    useState<SubsPlanProps | null>(null);
  const [subscriptionPlanDetail, setSubscriptionPlanDetail] =
    useState<any>(null);
  const [activeSubsPlanTabs, setActiveSubsPlanTabs] = useState("detail");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedEffType, setSelectedEffType] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModeSubsPlan, setIsEditModeSubsPlan] = useState(false);
  const [lifecycleType, setLifecycleType] = useState<any[]>([]);
  const [showOfferStatus, setShowOfferStatus] = useState(false);
  const [effTypeOpen, setEffTypeOpen] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [displayTitle, setDisplayTitle] = useState("");
  const { selectedSubSubPlan, selectedVer } = useOfferLayout();

  const [showCompare, setShowCompare] = useState(false);
  const [showPublish, setShowPublish] = useState(false);

  useEffect(() => {
    if (isOpen && rowData) {
      const offerId =
        rowData.offerId ||
        rowData.id ||
        rowData.subsPlanId ||
        rowData.indepProdSpecId ||
        rowData.parentOffer?.offerId;

      if (offerId) {
        fetchSubscriptionPlanDetail(offerId)
          .then((detailData) => {
            if (detailData?.spId !== undefined) {
              fetchLifecycleType(detailData.spId);
            } else {
              fetchLifecycleType(0);
            }
          })
          .catch(() => {
            fetchLifecycleType(0);
          });
      } else {
        console.warn("⚠️ DetailSubsPlan - No valid offerId found in rowData");
      }
    }
  }, [isOpen, rowData]);

  useEffect(() => {
    if (!isOpen) {
      setSubscriptionPlanDetail(null);
      setError(null);
      setActiveSubsPlanTabs("detail");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && rowData) {
      const offerId = rowData.offerId || rowData.id || rowData.subsPlanId;
      if (offerId) {
        fetchVersions(offerId);
      }
    }
  }, [isOpen, rowData]);

  const validateForm = () => {
    const requiredFields = [
      {
        key: "offerRequestDto.offerName",
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

  useEffect(() => {
    setDisplayTitle(rowData?.offerName || "");
  }, [rowData?.offerName]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

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
            effDate: formatDateForInput(formData.offerVerRequestDto.effDate),
            expDate: formatDateForInput(formData.offerVerRequestDto.expDate),
          },
        };

        // console.log("📤 Submit payload:", submitPayload);

        const response = await PutData(
          `${API_URL_OFFER}/offer/subs-plan/mod-subs-plan`,
          submitPayload,
        );

        if (response?.status) {
          toast.success("Subscription plan updated successfully");
          setIsEditModeSubsPlan(false);
          setShowDetailView(true);

          // if (onUpdatePlanInSidebar) {
          //   onUpdatePlanInSidebar({
          //     subsPlanId: formData.subsPlanRequestDto.subsPlanId,
          //     offerId: formData.offerId,
          //     indepProdSpecId: rowData.indepProdSpecId,
          //     offerName: formData.offerRequestDto.offerName,
          //     offerCode: formData.offerRequestDto.offerCode,
          //   });
          // }

          setDisplayTitle(formData.offerRequestDto.offerName);
          // const offerId = rowData.offerId || rowData.id || rowData.subsPlanId || rowData.indepProdSpecId;
          // if (offerId) {
          //   await fetchSubscriptionPlanDetail(offerId);
          // }
          // await refreshCategorySidebar();
          await refreshSubsPlanSection();
        } else {
          toast.error(
            response?.message || "Failed to update subscription plan",
          );
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
    },
    [formData, PutData, refreshCategorySidebar],
  );

  // Function untuk fetch lifecycle type
  const fetchLifecycleType = async (spId: number) => {
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/common/qry-lifecycle-type`,
        {
          lifecycleType: "",
          spId: spId,
        },
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

  const handleOfferStatusManage = () => {
    setShowOfferStatus(!showOfferStatus);
  };

  useEffect(() => {
    if (isOpen && (rowData?.offerId || rowData?.id)) {
      fetchLifecycleType(0);
    }
  }, [isOpen, rowData?.offerId, rowData?.id]);

  const fetchSubscriptionPlanDetail = useCallback(
    async (offerId: string | number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await GetData(
          `${API_URL_OFFER}/offer/subs-plan/qry-subs-plan-by-indep-prod-id`,
          {
            indepProdSpecId: offerId,
          },
        );

        if (response?.status) {
          let dataObject: any = {};

          if (Array.isArray(response.data) && response.data.length > 0) {
            dataObject = response.data[0] || {};
          } else if (!Array.isArray(response.data)) {
            dataObject = response.data || {};
          }

          const newFormData: SubsPlanProps = {
            lifecycleType:
              dataObject.lifecycleType ?? rowData?.lifecycleType ?? null,
            lifecyleFlag:
              dataObject.lifecycleFlag ?? rowData?.lifecycleFlag ?? "",
            staffJobId: parsedUser?.staffJobId || "",
            actionState: dataObject.actionState ?? rowData?.actionState ?? "",
            checkPeriod: true,
            spId: dataObject.spId ?? rowData?.spId ?? 0,
            offerId: dataObject.offerId ?? rowData?.offerId ?? 0,

            subsPlanRequestDto: {
              subsPlanId: dataObject.subsPlanId ?? rowData?.subsPlanId ?? 0,
              indepProdSpecId:
                dataObject.indepProdSpecId ?? rowData?.indepProdSpecId ?? 0,
              priority: dataObject.priority ?? rowData?.priority ?? null,
              effDate: formatDateForInput(dataObject.effDate),
              expDate: formatDateForInput(dataObject.expDate),
              saleFlag: String(dataObject.saleFlag ?? rowData?.saleFlag ?? ""),
              spId: dataObject.spId ?? rowData?.spId ?? 0,
              isBundleFlag:
                dataObject.isBundleFlag ?? rowData?.isBundleFlag ?? "N",
              subsPlanCode: dataObject.offerCode ?? rowData?.offerCode ?? "",
              subsPlanName: dataObject.offerName ?? rowData?.offerName ?? "",
            },

            offerRequestDto: {
              offerId: dataObject.offerId ?? rowData?.offerId ?? 0,
              offerType: dataObject.offerType ?? rowData?.offerType ?? "",
              offerName: dataObject.offerName ?? rowData?.offerName ?? "",
              comments: dataObject.comments ?? rowData?.comments ?? null,
              offerCode: dataObject.offerCode ?? rowData?.offerCode ?? "",
              saleListPrice:
                dataObject.saleListPrice ?? rowData?.saleListPrice ?? null,
              rentListPrice:
                dataObject.rentListPrice ?? rowData?.rentListPrice ?? null,
              effDate:
                formatDateForInput(dataObject.effDate ?? rowData?.effDate) ??
                "",
              expDate:
                formatDateForInput(dataObject.expDate ?? rowData?.expDate) ??
                "",
              effType: dataObject.effType ?? rowData?.effType ?? null,
              autoContinueFlag:
                dataObject.autoContinueFlag ??
                rowData?.autoContinueFlag ??
                null,
              cycleQuantity:
                Number(dataObject.cycleQuantity ?? rowData?.cycleQuantity) ||
                null,
              timeUnit: dataObject.timeUnit ?? rowData?.timeUnit ?? null,
              duplicateFlag:
                dataObject.duplicateFlag ?? rowData?.duplicateFlag ?? null,
              spId: dataObject.spId ?? rowData?.spId ?? 0,
              expOff: Number(dataObject.expOff ?? rowData?.expOff) || 0,
              expTimeUnit:
                dataObject.expTimeUnit ?? rowData?.expTimeUnit ?? null,
              agreementEffType:
                dataObject.agreementEffType ??
                rowData?.agreementEffType ??
                null,
              prodType: dataObject.prodType ?? rowData?.prodType ?? null,
              createdDate: dataObject.createdDate ?? rowData?.createdDate ?? "",
            },

            offerVerRequestDto: {
              offerVerId: dataObject.offerVerId ?? rowData?.offerVerId ?? 0,
              offerId: dataObject.offerId ?? rowData?.offerId ?? 0,
              effDate:
                formatDateForInput(
                  dataObject.offerVer?.[0]?.effDate ??
                    dataObject.effDate ??
                    rowData?.effDate,
                ) ?? "",
              expDate:
                formatDateForInput(
                  dataObject.offerVer?.[0]?.expDate ??
                    dataObject.expDate ??
                    rowData?.expDate,
                ) ?? "",
              spId: dataObject.spId ?? rowData?.spId ?? null,
              state: dataObject.state ?? rowData?.state ?? "",
              refOfferVerId:
                dataObject.refOfferVerId ?? rowData?.refOfferVerId ?? 0,
              offerName: dataObject.offerName ?? rowData?.offerName ?? "",
              offerCode: dataObject.offerCode ?? rowData?.offerCode ?? "",
            },
          };

          // console.log("🔎 Final Form Data:", newFormData);

          setDetailContent(dataObject);
          setFormData(newFormData);
          setOriginalFormData(JSON.parse(JSON.stringify(newFormData)));
          return dataObject;
        } else {
          throw new Error(
            response?.message || "Failed to fetch subscription plan",
          );
        }
      } catch (error) {
        console.error("Error fetching subscription plan:", error);
        setError("Failed to load subscription plan details");
        toast.error("Failed to load subscription plan details");
      } finally {
        setLoading(false);
      }
    },
    [
      rowData,
      refreshSubsPlanSection,
      handleSubmit,
      formData,
      detailContent,
      originalFormData,
    ],
  );

  return (
    <div className="flex flex-col px-6 pt-0 mb-0">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <button
          onClick={() => {
            if (moveToSubsPlan) {
              // navigate("/main/offer/main-product");asdasdasda
              setActiveTab("main");
            }
            onBack();
          }}
          className="btn btn-sm btn-icon btn-light"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-semibold text-lg">{displayTitle || "-"}</span>
          </div>

          <div className="pl-2">
            <VersionSubsPlan />
          </div>
        </div>

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            className="text-white bg-blue-700 hover:bg-blue-500"
            onClick={handleOfferStatusManage}
            disabled
          >
            Offer Status Manage
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowCompare(true)}
            disabled
          >
            Compare
          </Button>

          <Button
            variant="outline"
            className=""
            onClick={() => setShowPublish(true)}
          >
            Publish
          </Button>

          <CompareSubsPlanModal
            isOpen={showCompare}
            onClose={() => setShowCompare(false)}
            rowData={rowData}
            versions={versions}
            loadingVersions={loadingVersions}
            GetData={GetData}
            API_URL_OFFER={API_URL_OFFER}
          />

          <OfferStatusManageModal
            isOpen={showOfferStatus}
            onClose={() => setShowOfferStatus(false)}
            rowData={rowData}
          />

          <PublishSubsPlan
            isOpen={showPublish}
            onClose={() => setShowPublish(false)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {subsPlansTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubsPlanTabs(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeSubsPlanTabs === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeSubsPlanTabs === "detail" && (
          <div>
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
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                  {/* left col */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Plan Name
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formData.offerRequestDto?.offerName || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Lifecycle Type
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {rowData.lifecycleType || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Effective Date
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatDate(formData.offerRequestDto?.effDate || "-")}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Plan Code
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formData.offerRequestDto?.offerCode || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Agreement Effective Type
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatEffectiveType(
                          formData.offerRequestDto?.agreementEffType || "-",
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
                        {formData.offerRequestDto?.comments ?? "-"}
                      </span>
                    </div>
                  </div>
                  {/* right col */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Sale Type
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatSaleFlag(
                          formData.subsPlanRequestDto?.saleFlag,
                        ) || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Agreement Period
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formData.offerRequestDto?.cycleQuantity
                          ? `${formData.offerRequestDto?.cycleQuantity || "-"} ${formatTimeUnit(formData.offerRequestDto?.timeUnit || "")}`
                          : "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Expiry Date
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatDate(formData.offerRequestDto?.expDate || "-")}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formData.subsPlanRequestDto?.priority || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
                      <label className="w-40 text-sm font-medium text-gray-700">
                        Renewal
                      </label>
                      <span className="text-sm font-medium text-gray-700">
                        :
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatAutoContinueFlag(
                          formData.offerRequestDto?.autoContinueFlag || "-",
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
                          formData.offerRequestDto?.prodType || "-",
                        )}
                      </span>
                    </div>

                    {/* Edit Button */}
                    <div className="flex justify-end gap-2 pt-4">
                      <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
                      <button
                        type="button"
                        onClick={handleEditClickSubsPlan}
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
          </div>
        )}

        {activeSubsPlanTabs === "offer-group" && (
          <OfferGroupContentSubsPlanNode rowData={rowData} />
        )}

        {activeSubsPlanTabs === "feature" && (
          <SubsPlanFeatureTabContent
            payload={{
              offerId: selectedSubSubPlan.indepProdSpecId,
              subsPlanVerId: selectedVer?.offerVerId ?? 0,
            }}
          />
        )}

        {activeSubsPlanTabs === "relationship" && (
          <RelationshipTabContent rowData={rowData} allowedRelationTypes={["Exchangeable", "Mutually Exclusive"]} />
        )}

        {activeSubsPlanTabs === "sales-condition" && (
          <SalesConditionTabContent
            offerId={rowData.offerId}
            rowData={rowData}
          />
        )}
        {activeSubsPlanTabs === "subscription-price" && (
          <SubscriptionPriceContent />
        )}
        {activeSubsPlanTabs === "script-rule" && <ScriptRuleTabContent />}
      </div>
    </div>
  );
};

export default DetailSubCategorySideBarSubsPlan;
