import { apiConfigOffer } from "@/config/api.config";
import {
  initialStateAddSubsplan,
  lifecycleType,
  SubsPlanProps,
} from "./AddDialogSubsPlan";
import { useCallback, useEffect, useState } from "react";
import { useCallApi } from "@/hooks";
import { getAuth } from "@/auth";
import { useSubscriptionPlanOfferListContext } from "../hooks/useSubscriptionPlanOfferListContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NumericFormat } from "react-number-format";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { subsPlansTabs } from "../components/DetailCategoryContent/DetailCategoryContentSubsPlan";
import SubsPlanFeatureTabContent from "../components/DetailCategoryContent/SubsPlanFeatureTabContent";
import RelationshipTabContent from "../../main-product/components/DetailCategoryContent/RelationShipTabContent";
import SalesConditionTabContent from "../../related-product/components/DetailCategoryContent/SalesConditionTabContent";
import SubscriptionPriceContent from "../components/DetailCategoryContent/SubscriptionPriceContent";
import ScriptRuleTabContent from "../components/DetailCategoryContent/ScriptRuleTabContent";
import OfferGroupContentSubsPlanNode from "../components/DetailCategoryContent/OfferGroupContentSubsPlanDrop";
import { useOfferLayout } from "@/layouts/main-menu/offer";

interface EditDialogSubsPlanProps {
  isOpen: boolean;
  onClose: () => void;
  subsPlanId: number | null;
  onSucces: () => void;
  indepProdSpecId: number | null;
  category: string;
}

export interface DetailDataProps {
  subsPlanId: number;
  indepProdSpecId: number;
  priority: number;
  saleFlag: string;
  isBundleFlag: string;
  spId: number;
  offerId: number;
  offerType: string;
  offerName: string;
  comments: string | null;
  offerCode: string;
  saleListPrice: string | null;
  rentListPrice: string | null;
  effDate: string;
  expDate: string | null;
  createdDate: string;
  state: string;
  effType: string | null;
  expOff: string | null;
  timeUnit: string | null;
  autoContinueFlag: string;
  cycleQuantity: string | null;
  duplicateFlag: string | null;
  offerSpId: string | null;
  expTimeUnit: string | null;
  agreementEffType: string | null;
  salesRuleScript: string | null;
  prodType: string | null;
  offerVer?: Array<any>;
  lifecycleType: number | null;
}

const API_URL_OFFER = apiConfigOffer.offer;

export const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return "";
  return dateString.split("T")[0];
};

const EditDialogSubsPlan = ({
  subsPlanId,
  isOpen,
  onClose,
  onSucces,
  indepProdSpecId,
  category,
}: EditDialogSubsPlanProps) => {
  const { refreshCategorySidebar } = useSubscriptionPlanOfferListContext();
  const [detailData, setDetailData] = useState<DetailDataProps | null>(null);
  const [formData, setFormData] = useState<SubsPlanProps>(
    initialStateAddSubsplan,
  );
  const [isDataReady, setIsDataReady] = useState(false);
  const [activeTab, setActiveTab] = useState("detail");
  const { selectedSubSubPlan, selectedVer } = useOfferLayout();

  const {
    selectedDetailSideBar,
    fetchSubscriptionPlans,
    selectedIndepProdSpecId,
    refreshSubsPlanSection,
  } = useSubscriptionPlanOfferListContext();

  const { GetData, PutData } = useCallApi();
  const parsedUser = getAuth()?.user;
  const [lifecycleType, setLifecycleType] = useState<lifecycleType[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verCopyForm, setVerCopyForm] = useState<any[]>([]);
  const [verOpen, setVerOpen] = useState(false);

  // Fungsi untuk mengambil detail spesifik berdasarkan subsPlanId
  const fetchSubsPlanDetail = async (
    subsPlanId: number,
    indepProdSpecId: string,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const allPlans = await fetchSubscriptionPlans(indepProdSpecId);

      if (!allPlans || allPlans.length === 0) {
        throw new Error("No subscription plans found");
      }

      const targetPlan = allPlans.find((plan: any) => {
        return Number(plan.subsPlanId) === Number(subsPlanId);
      });

      if (!targetPlan) {
        throw new Error(`Subscription plan with ID ${subsPlanId} not found`);
      }

      setDetailData(targetPlan);

      setFormData({
        lifecycleType: targetPlan.lifecycleType || null,
        lifecyleFlag: "",
        staffJobId: parsedUser?.staffJobId || "",
        actionState: "",
        checkPeriod: true,
        spId: targetPlan.spId || 0,
        offerId: targetPlan.offerId,
        subsPlanRequestDto: {
          subsPlanId: targetPlan.subsPlanId,
          indepProdSpecId: targetPlan.indepProdSpecId,
          priority: targetPlan.priority,
          effDate: targetPlan.effDate,
          expDate: targetPlan.expDate,
          saleFlag: targetPlan.saleFlag,
          spId: targetPlan.spId || 0,
          isBundleFlag: targetPlan.isBundleFlag,
          subsPlanCode: targetPlan.offerCode,
          subsPlanName: targetPlan.offerName,
        },
        offerRequestDto: {
          offerId: targetPlan.offerId,
          offerType: targetPlan.offerType,
          offerName: targetPlan.offerName,
          comments: targetPlan.comments,
          offerCode: targetPlan.offerCode,
          effDate: targetPlan.effDate,
          expDate: targetPlan.expDate,
          createdDate: targetPlan.createdDate,
          saleListPrice: targetPlan.saleListPrice,
          rentListPrice: targetPlan.rentListPrice,
          effType: targetPlan.effType,
          autoContinueFlag: targetPlan.autoContinueFlag,
          cycleQuantity: Number(targetPlan.cycleQuantity) || 0,
          timeUnit: targetPlan.timeUnit,
          duplicateFlag: targetPlan.duplicateFlag,
          spId: targetPlan.spId || 0,
          expOff: Number(targetPlan.expOff) || 0,
          expTimeUnit: targetPlan.expTimeUnit,
          agreementEffType: targetPlan.agreementEffType,
          prodType: targetPlan.prodType,
        },
        offerVerRequestDto: {
          effDate: targetPlan.offerVer?.[0]?.effDate || targetPlan.effDate, // ✅ Benar
          expDate: targetPlan.offerVer?.[0]?.expDate || targetPlan.expDate, // ✅ Benar
          offerVerId: targetPlan.offerVerId,
          offerId: targetPlan.offerId,
          spId: targetPlan.spId,
          state: targetPlan.state,
          offerName: targetPlan.offerName,
          offerCode: targetPlan.offerCode,
          refOfferVerId: targetPlan.refOfferVerId,
        },
      });

      // if (targetPlan) {
      //   await fetchLifecycleType(targetPlan);
      // }
      setIsDataReady(true);
      return targetPlan;
    } catch (error: any) {
      console.error("❌ fetchSubsPlanDetail error:", error);
      setError(error?.message ?? "Failed to fetch subscription plan detail");
      toast.error("Failed to load subscription plan details");
    } finally {
      setLoading(false);
    }
  };

  const fetchVersionCopy = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchSubscriptionPlans(
        String(selectedIndepProdSpecId),
      );
      setVerCopyForm(result ?? []);
    } catch (error: any) {
      console.error("❌ fetchVersionCopy error:", error);
      setError(error?.message ?? "Failed to fetch version copy form");
    } finally {
      setLoading(false);
    }
  };

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
      toast.error("Error GET Service Type data");
    }
  };

  const resetForm = () => {
    setDetailData(null);
    setFormData(initialStateAddSubsplan);
    setErrors({});
    setAlert({ show: false, message: "" });
  };

  useEffect(() => {
    const targetIndepProdSpecId =
      indepProdSpecId || selectedDetailSideBar?.indepProdSpecId;

    if (isOpen && subsPlanId && targetIndepProdSpecId) {
      setIsDataReady(false);
      fetchSubsPlanDetail(subsPlanId, String(targetIndepProdSpecId));
    } else if (isOpen) {
      console.warn("⚠️ Dialog opened but missing data:", {
        subsPlanId,
        indepProdSpecId: indepProdSpecId,
        selectedDetailSideBarIndepProdSpecId:
          selectedDetailSideBar?.indepProdSpecId,
      });
    }

    if (!isOpen) {
      resetForm();
      setIsDataReady(false);
    }
  }, [
    isOpen,
    subsPlanId,
    indepProdSpecId,
    selectedDetailSideBar?.indepProdSpecId,
  ]);

  const handleInputChange = (field: keyof SubsPlanProps, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      { key: "offerRequestDto.offerName", label: "Plan Name" },
      { key: "offerRequestDto.offerCode", label: "Plan Code" },
      { key: "offerRequestDto.effDate", label: "Effective Date" },
    ];

    const newErrors: Record<string, string> = {};
    let isValid = true;

    setAlert({ show: false, message: "" });

    requiredFields.forEach(({ key, label }) => {
      const value = key
        .split(".")
        .reduce((obj: any, part) => obj?.[part], formData);

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

    if (!isValid) {
      const firstError = Object.values(newErrors)[0];
      setAlert({
        show: true,
        message: firstError || "Please fill in all required fields",
      });
    }

    return isValid;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
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
            //   offerVerId: formData.offerVerRequestDto.offerVerId,
            //   offerId: formData.offerVerRequestDto.offerId,
            effDate: formatDateForInput(formData.offerVerRequestDto.effDate),
            expDate: formatDateForInput(formData.offerVerRequestDto.expDate),
            //   spId: formData.offerVerRequestDto.spId,
            //   state: formData.offerVerRequestDto.state,
            //   refOfferVerId: formData.offerVerRequestDto.refOfferVerId,
          },
        };

        // //  console.log("📤 Submit payload:", submitPayload);

        const response = await PutData(
          `${API_URL_OFFER}/offer/subs-plan/mod-subs-plan`,
          submitPayload,
        );

        if (response?.status) {
          toast.success("Subscription plan updated successfully");
          refreshSubsPlanSection();
          onClose();
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
    [formData, PutData, onClose],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full p-3 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg">Edit Subscription Plan</DialogTitle>
        </DialogHeader>
        <div className="flex border-b bg-gray-50 mb-4 sticky top-0 z-20">
          {subsPlansTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              disabled={loading}
              className={`px-4 py-3 text-sm font-normal border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <DialogBody className="max-h-[75vh] overflow-y-auto">
          {activeTab === "detail" && (
            <>
              {/* Loading State */}
              {loading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-600 text-sm">
                    Loading subscription plan details...
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Alert */}
              {alert.show && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{alert.message}</p>
                </div>
              )}

              {isDataReady ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="form-label pb-2">
                          Plan Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={formData.offerRequestDto?.offerName || ""}
                          onChange={(e) =>
                            handleInputChange("offerRequestDto", {
                              ...formData.offerRequestDto,
                              offerName: e.target.value,
                            })
                          }
                          disabled={isSubmitting || loading}
                          placeholder="Enter Offer Name"
                          className={
                            errors["offerRequestDto.offerName"]
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {errors["offerRequestDto.offerName"] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors["offerRequestDto.offerName"]}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Lifecycle Type
                        </label>
                        <Select
                          value={formData?.lifecycleType?.toString() || ""}
                          onValueChange={(value) =>
                            handleInputChange("lifecycleType", Number(value))
                          }
                          disabled
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Lifecycle Type" />
                          </SelectTrigger>
                          <SelectContent
                            side="bottom"
                            className="max-h-60 overflow-y-auto"
                          >
                            {lifecycleType.map((type) => (
                              <SelectItem
                                key={type.lifecycleType}
                                value={type.lifecycleType.toString()}
                              >
                                {type.lifecycleTypeName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Effective Date */}
                      <div>
                        <label className="form-label pb-2">
                          Effective Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="date"
                          value={formatDateForInput(
                            formData.offerRequestDto?.effDate || "",
                          )}
                          onChange={(e) =>
                            handleInputChange("offerRequestDto", {
                              ...formData.offerRequestDto,
                              effDate: e.target.value,
                            })
                          }
                          disabled={isSubmitting || loading}
                          className={
                            errors["offerRequestDto.effDate"]
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {errors["offerRequestDto.effDate"] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors["offerRequestDto.effDate"]}
                          </p>
                        )}
                      </div>

                      {/* Plan Code */}
                      <div>
                        <label className="form-label pb-2">
                          Plan Code <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={formData.offerRequestDto.offerCode || ""}
                          onChange={(e) =>
                            handleInputChange("offerRequestDto", {
                              ...formData.offerRequestDto,
                              offerCode: e.target.value,
                            })
                          }
                          disabled={isSubmitting || loading}
                          placeholder="Enter code"
                          className={
                            errors["offerRequestDto.offerCode"]
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {errors["offerRequestDto.offerCode"] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors["offerRequestDto.offerCode"]}
                          </p>
                        )}
                      </div>

                      {/* Agreement Effective Type */}
                      <div>
                        <label className="form-label pb-2">
                          Agreement Effective Type
                        </label>
                        <Select
                          value={
                            formData.offerRequestDto.agreementEffType || ""
                          }
                          onValueChange={(value) =>
                            handleInputChange("offerRequestDto", {
                              ...formData.offerRequestDto,
                              agreementEffType: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Agreement Effective Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Next Day</SelectItem>
                            <SelectItem value="2">Next Month</SelectItem>
                            <SelectItem value="3">
                              Next Billing Cycle
                            </SelectItem>
                            <SelectItem value="4">Today 0:00</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Comments */}
                      <div>
                        <label className="form-label pb-2">Remarks</label>
                        <textarea
                          value={formData.offerRequestDto.comments || ""}
                          className="w-full input h-20 p-2"
                          placeholder="Enter comments..."
                          onChange={(e) =>
                            handleInputChange("offerRequestDto", {
                              ...formData.offerRequestDto,
                              comments: e.target.value,
                            })
                          }
                          disabled={isSubmitting || loading}
                        />
                      </div>

                      {/* Version Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Version Date <span className="text-red-500">*</span>
                        </label>

                        {/* Dua input sejajar */}
                        <div className="flex gap-2">
                          {/* Effective Date */}
                          <div className="w-1/2">
                            <input
                              type="date"
                              value={formData.offerVerRequestDto.effDate}
                              onChange={(e) =>
                                handleInputChange("offerVerRequestDto", {
                                  ...formData.offerVerRequestDto,
                                  effDate: e.target.value,
                                })
                              }
                              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors["offerVerRequestDto.effDate"] ? "border-red-500" : "border-gray-300"}`}
                              disabled={isSubmitting}
                            />
                            {errors["offerVerRequestDto.effDate"] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors["offerVerRequestDto.effDate"]}
                              </p>
                            )}
                          </div>

                          <label className="mt-2">-</label>

                          {/* Expired Date */}
                          <div className="w-1/2">
                            <input
                              type="date"
                              value={formData.offerVerRequestDto.expDate || "-"}
                              onChange={(e) =>
                                handleInputChange("offerVerRequestDto", {
                                  ...formData.offerVerRequestDto,
                                  expDate: e.target.value,
                                })
                              }
                              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors["offerVerRequestDto.expDate"] ? "border-red-500" : "border-gray-300"}`}
                              disabled={isSubmitting}
                            />
                            {errors["offerVerRequestDto.expDate"] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors["offerVerRequestDto.expDate"]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Sale Type */}
                      <div>
                        <label className="form-label pb-2">Sale Type</label>
                        <Select
                          value={formData.subsPlanRequestDto.saleFlag || ""}
                          onValueChange={(value) =>
                            handleInputChange("subsPlanRequestDto", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Sale Flag" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0" className="cursor-pointer">
                              Sold Unlimitedly
                            </SelectItem>
                            <SelectItem value="1" className="cursor-pointer">
                              Sold Separately
                            </SelectItem>
                            <SelectItem value="2" className="cursor-pointer">
                              Sold in Bundle
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Agreement Period */}
                      <div>
                        <label className="form-label pb-2">
                          Agreement Period
                          {formData.offerRequestDto.autoContinueFlag ===
                            "Y" && <span className="text-red-600">*</span>}
                        </label>
                        <div className="flex gap-2">
                          <div className="w-2/3">
                            <NumericFormat
                              placeholder="Input Agreement Period"
                              value={
                                formData.offerRequestDto.cycleQuantity || ""
                              }
                              onValueChange={(values) =>
                                handleInputChange("offerRequestDto", {
                                  ...formData.offerRequestDto,
                                  cycleQuantity: values.value,
                                })
                              }
                              disabled={isSubmitting || loading}
                              className={`w-full input ${errors["offerRequestDto.cycleQuantity"] ? "border-red-500" : ""}`}
                            />
                          </div>
                          <div className="w-1/3">
                            <Select
                              value={formData.offerRequestDto.timeUnit || ""}
                              onValueChange={(value) =>
                                handleInputChange("offerRequestDto", {
                                  ...formData.offerRequestDto,
                                  timeUnit: value,
                                })
                              }
                            >
                              <SelectTrigger
                                className={
                                  errors["offerRequestDto.timeUnit"]
                                    ? "border-red-500"
                                    : ""
                                }
                              >
                                <SelectValue placeholder="Select Time Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Y">Year</SelectItem>
                                <SelectItem value="M">Month</SelectItem>
                                <SelectItem value="W">Week</SelectItem>
                                <SelectItem value="D">Day</SelectItem>
                                <SelectItem value="H">Hour</SelectItem>
                                <SelectItem value="C">Billing Cycle</SelectItem>
                                <SelectItem value="S">Exact Time</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {(errors["offerRequestDto.cycleQuantity"] ||
                          errors["offerRequestDto.timeUnit"]) && (
                          <p className="text-red-500 text-xs w-full">
                            {errors["offerRequestDto.cycleQuantity"] ||
                              errors["offerRequestDto.timeUnit"]}
                          </p>
                        )}
                      </div>

                      {/* Expiry Date */}
                      <div>
                        <label className="form-label pb-2">Expiry Date</label>
                        <Input
                          type="date"
                          value={formatDateForInput(
                            formData.offerRequestDto.expDate || "",
                          )}
                          onChange={(e) =>
                            handleInputChange("offerRequestDto", {
                              ...formData.offerRequestDto,
                              expDate: e.target.value,
                            })
                          }
                          disabled={isSubmitting || loading}
                        />
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="form-label pb-2">
                          Priority <span className="text-red-500">*</span>
                        </label>
                        <NumericFormat
                          placeholder="Input Priority"
                          value={formData.subsPlanRequestDto.priority || ""}
                          onValueChange={(values) =>
                            handleInputChange("subsPlanRequestDto", {
                              ...formData.subsPlanRequestDto,
                              priority: Number(values.value),
                            })
                          }
                          className={`w-full input ${errors["subsPlanRequestDto.priority"] ? "border-red-500" : ""}`}
                        />
                        {errors["subsPlanRequestDto.priority"] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors["subsPlanRequestDto.priority"]}
                          </p>
                        )}
                      </div>

                      {/* Renewal */}
                      <div>
                        <label className="form-label pb-2">Renewal</label>
                        <div className="inline-block">
                          <div className="flex gap-4 p-2 border rounded-md border-gray-300">
                            <label className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                checked={
                                  formData.offerRequestDto.autoContinueFlag ===
                                  "Y"
                                }
                                onChange={(e) =>
                                  handleInputChange("offerRequestDto", {
                                    ...formData.offerRequestDto,
                                    autoContinueFlag: e.target.checked
                                      ? "Y"
                                      : "N",
                                  })
                                }
                                disabled={isSubmitting || loading}
                                className="mr-2"
                              />
                              Automatic Renewal
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Product Line */}
                      <div>
                        <label className="form-label pb-2">Product Line</label>
                        <Select
                          value={formData.offerRequestDto.prodType || ""}
                          onValueChange={(value) =>
                            handleInputChange("offerRequestDto", {
                              ...formData.offerRequestDto,
                              prodType: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Product Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="F">Fix</SelectItem>
                            <SelectItem value="M">Mobile</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Version Copy From */}
                      <div>
                        <label className="form-label pb-2">
                          Version Copy From
                        </label>
                        <Popover
                          open={verOpen}
                          onOpenChange={(open) => {
                            setVerOpen(open);
                            if (open && verCopyForm?.length === 0 && !loading) {
                              fetchVersionCopy();
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={`w-full flex items-center justify-between input text-left ${
                                errors.offerId ? "border-red-500" : ""
                              }`}
                              disabled={loading}
                            >
                              {loading
                                ? "Loading subscription plans..."
                                : (() => {
                                    const selected = verCopyForm?.find(
                                      (p) => p.offerId === formData?.offerId,
                                    );
                                    return selected
                                      ? selected.offerName
                                      : "Select Subscription Plan";
                                  })()}

                              <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                            </button>
                          </PopoverTrigger>

                          <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] p-0"
                            onWheel={(e) => e.stopPropagation()}
                          >
                            <Command>
                              <CommandInput placeholder="Search subscription plan..." />
                              <CommandList className="max-h-[200px] overflow-y-auto pointer-events-auto">
                                <CommandEmpty>
                                  {loading
                                    ? "Loading..."
                                    : "No subscription plan found."}
                                </CommandEmpty>
                                <CommandGroup>
                                  {verCopyForm?.map((plan) => (
                                    <CommandItem
                                      key={plan.subsPlanId}
                                      value={plan.offerName}
                                      // onSelect={() => {
                                      //   setFormData((prev) => ({
                                      //     ...prev,
                                      //     offerId: plan.offerId, // untuk header
                                      //     offerName: plan.offerName, // untuk display
                                      //     offerVerRequestDto: {
                                      //       ...prev.offerVerRequestDto,
                                      //       offerId: plan.offerId,
                                      //     },
                                      //   }));
                                      //   setErrors((prev) => ({ ...prev, offerId: "" }));
                                      //   setVerOpen(false);
                                      // }}
                                    >
                                      <span>{plan.offerName}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        {errors.subsPlanId && (
                          <span className="text-red-500 text-xs mt-1">
                            {errors.subsPlanId}
                          </span>
                        )}
                        {error && (
                          <span className="text-red-500 text-xs mt-1">
                            Error loading subscription plans: {error}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex justify-end gap-4 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Updating..." : "Update"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">Loading form data...</p>
                </div>
              )}
            </>
          )}

          {activeTab === "offer-group" && (
            <OfferGroupContentSubsPlanNode rowData={detailData} />
          )}
          {activeTab === "feature" && (
            <SubsPlanFeatureTabContent
              payload={{
                offerId: selectedSubSubPlan.indepProdSpecId,
                subsPlanVerId: selectedVer?.offerVerId,
              }}
            />
          )}
          {activeTab === "relationship" && (
            <RelationshipTabContent allowedRelationTypes={["Exchangeable", "Mutually Exclusive"]} rowData={detailData} />
          )}
          {activeTab === "sales-condition" && (
            <SalesConditionTabContent
              offerId={detailData?.offerId}
              rowData={detailData}
            />
          )}
          {activeTab === "subscription-price" && <SubscriptionPriceContent />}
          {activeTab === "script-rule" && <ScriptRuleTabContent />}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default EditDialogSubsPlan;
