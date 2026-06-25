import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { useSubscriptionPriceCreateContext } from "../../../hooks";
import useBenefitContext from "../hooks/useBenefitContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import BenefitValue from "./sub-block/BenefitValue";
import AdvancedBenefit from "./sub-block/AdvancedBenefit";
import { z } from "zod";
import {
  subscriptionUpdateBenefitSchema,
  updateSubscriptionBenefitSchema,
} from "../types/form";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { periodType } from "./AddPriceDialog";
import { XMLParser } from "fast-xml-parser";
import AdvancedBenefitUpdateComponent from "./sub-block/AdvancedBenefitUpdate";

const API_URL = apiConfig.service_price_plan;
export type SubscriptionUpdateBenefitFormType = z.infer<
  ReturnType<typeof updateSubscriptionBenefitSchema>
>;

const EditPriceDialog = () => {
  const { dataPricePlanDetail } = usePortalData();
  const { GetData, PutData } = useCallApi();
  const { selectedRatePlan, selectedMapping, fetchVersionsBenefitForRatePlan } =
    useSubscriptionPriceCreateContext();
  const {
    showPriceDialog,
    handlePriceDialog,
    selectedPrice,
    selectedPriceVer,
  } = useBenefitContext();

  const [priceType, setPriceType] = useState<string>("Advanced");
  const [periodType, setPeriodType] = useState<periodType>("absolute");

  const benefitSchema = useMemo(
    () => updateSubscriptionBenefitSchema(periodType),
    [periodType],
  );

  const methods = useForm<SubscriptionUpdateBenefitFormType>({
    resolver: zodResolver(benefitSchema),
    defaultValues: {
      benefitName: "",
      remarks: null,
      benefitValue: "",
      acctBalanceTypeId: undefined,
      reAttrId: undefined,
      calculationUnit: undefined,
      cycleFloorLimit: null,
      cycleCeilLimit: null,
      dailyFloorLimit: null,
      dailyCeilLimit: null,
      maximumDays: null,
      subscriberOnly: null,
      absoluteEffectiveDate: null,
      absoluteExpiryDate: null,
      offsetOfEffectiveDate: null,
      offsetOfEffectiveDateUnit: null,
      durationOfAvailability: null,
      durationOfAvailabilityUnit: null,
      relativeEffectiveTime: null,
      relativeExpiryTime: null,
      relativePeriodUnit: null,
      offsetOfAbsoluteExpiry: null,
      balFlags: null,
      advanceBenefit: null,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    watch,
    formState: { errors },
  } = methods;

  const [detailData, setDetailData] =
    useState<SubscriptionBenefitDetail | null>(null);

  const [scriptTemplate, setScriptTemplate] = useState<
    { scriptTempletId: string; scriptTempletName: string }[]
  >([]);
  const [scriptToChange, setScriptToChange] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("benefit");

  const effectiveDate = (selectedPriceVer as any)?.effDate;
  const expiryDate = (selectedPriceVer as any)?.expDate;

  const ResetForm = useCallback(() => {
    reset();
    // setActiveTab("timespan");
  }, [reset]);

  const refreshBenefitListWithRetry = useCallback(async () => {
    if (!selectedRatePlan) {
      return;
    }

    // The benefit list endpoint can lag behind the detail endpoint for a moment
    // right after update, so we retry briefly to keep the table in sync.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await fetchVersionsBenefitForRatePlan(selectedRatePlan, selectedMapping);

      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }
  }, [fetchVersionsBenefitForRatePlan, selectedMapping, selectedRatePlan]);

  const GetDataDetail = async () => {
    setIsLoading(true);
    try {
      const response = await GetData(
        `${API_URL}/price/detail/${selectedPrice?.priceId}`,
        {},
      );

      if (response.status) {
        const detail: SubscriptionBenefitDetail = response.data;
        setDetailData(detail);

        const {
          absoluteEffectiveDate,
          absoluteExpiryDate,
          accountBalanceTypeName,
          acctBalanceTypeId,
          balFlags,
          benefitName,
          benefitValue,
          calculationUnit,
          cycleCeilLimit,
          cycleFloorLimit,
          dailyCeilLimit,
          dailyFloorLimit,
          durationOfAvailability,
          durationOfAvailabilityUnit,
          maximumDays,
          offsetOfAbsoluteExpiry,
          offsetOfEffectiveDate,
          offsetOfEffectiveDateUnit,
          reAttr,
          reAttrName,
          relativeEffectiveTime,
          relativeExpiryTime,
          relativePeriodUnit,
          remarks,
          rule,
          ruleRemarks,
          scriptPage,
          scriptTempletId,
          subscriberOnly,
        } = detail;

        let jsonScriptPage = "";
        if (scriptPage) {
          try {
            const parser = new XMLParser({
              ignoreAttributes: false,
              attributeNamePrefix: "",
            });

            const parsed = parser.parse(scriptPage);
            const valueItems =
              parsed?.Properties?.value?.group?.item ||
              parsed?.zsmart?.Properties?.value?.group?.item ||
              [];

            const values = Array.isArray(valueItems)
              ? valueItems.reduce((acc, item) => {
                  acc[item.id] = item.value || "";
                  return acc;
                }, {})
              : { [valueItems.id]: valueItems.value || "" };

            jsonScriptPage = JSON.stringify([{ "": values }]);
            setScriptToChange(scriptPage);
          } catch (error) {
            console.error("Failed to parse scriptPage XML:", error);
            jsonScriptPage = "";
          }
        }

        setValue("absoluteEffectiveDate", absoluteEffectiveDate);
        setValue("absoluteExpiryDate", absoluteExpiryDate);
        setValue("acctBalanceTypeId", acctBalanceTypeId);
        setValue("balFlags", balFlags);
        setValue("benefitName", benefitName);
        setValue("benefitValue", String(benefitValue));
        setValue("calculationUnit", Number(calculationUnit));
        setValue("cycleCeilLimit", cycleCeilLimit);
        setValue("cycleFloorLimit", cycleFloorLimit);
        setValue("dailyCeilLimit", dailyCeilLimit);
        setValue("dailyFloorLimit", dailyFloorLimit);
        setValue("offsetOfEffectiveDate", offsetOfEffectiveDate);
        setValue("offsetOfEffectiveDateUnit", offsetOfEffectiveDateUnit);
        setValue("durationOfAvailability", durationOfAvailability);
        setValue("durationOfAvailabilityUnit", durationOfAvailabilityUnit);
        setValue("maximumDays", maximumDays);
        setValue("relativePeriodUnit", relativePeriodUnit);
        setValue("subscriberOnly", subscriberOnly);
        setValue("offsetOfAbsoluteExpiry", offsetOfAbsoluteExpiry);
        setValue("reAttrId", reAttr);
        setValue("relativeEffectiveTime", relativeEffectiveTime);
        setValue("relativeExpiryTime", relativeExpiryTime);
        setValue("remarks", remarks);
        setValue("advanceBenefit", {
          scriptTempletId: scriptTempletId,
          ruleScript: rule,
          jsonScriptPage: scriptPage ?? null,
          advancedBenefitRemarks: ruleRemarks,
        });
        setValue("reAttrId", reAttr);
        setValue("acctBalanceTypeId", acctBalanceTypeId);

        if (watch("absoluteEffectiveDate") !== null) {
          setPeriodType("absolute");
        } else {
          setPeriodType("relative");
        }
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const DoUpdateBenefit = async (
    formField: SubscriptionUpdateBenefitFormType,
  ) => {
    setIsSubmitting(true);
    try {
      const response = await PutData(
        `${API_URL}/price/benefit/update/${selectedPrice?.priceId}`,
        formField,
      );

      if (response?.status) {
        toast.success(response.message);
        await refreshBenefitListWithRetry();
        handlePriceDialog(
          false,
          showPriceDialog.mode,
          showPriceDialog.type,
          null,
        );
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Error creating Rate Plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: SubscriptionUpdateBenefitFormType) => {
    const allNull = Object.values(data.advanceBenefit ?? {}).every(
      (v) => v == null,
    );
    const cleaned = {
      ...data,
      advanceBenefit: allNull ? null : data.advanceBenefit,
    };
    await DoUpdateBenefit(cleaned);
  };

  useEffect(() => {
    if (selectedPrice) {
      GetDataDetail();
    }
  }, [selectedPrice]);

  useEffect(() => {
    const tabStillValid =
      activeTab === "benefit" ||
      (activeTab === "advanced" && priceType === "Advanced") ||
      (activeTab === "priceMapping" && priceType === "Price Mapping");

    if (!tabStillValid) {
      setActiveTab("benefit");
    }
  }, [priceType]);

  useEffect(() => {
    if (!showPriceDialog.show) {
      ResetForm();
    }
  }, [showPriceDialog.show, ResetForm]);
  return (
    <Dialog
      open={showPriceDialog.show}
      onOpenChange={(open) =>
        handlePriceDialog(
          open,
          showPriceDialog.mode,
          showPriceDialog.type,
          null,
        )
      }
    >
      <DialogContent className="max-w-[95vw] sm:max-w-[1300px] max-h-[95vh] flex flex-col overflow-hidden p-3 sm:p-5">
        <DialogHeader className="pb-2 sm:pb-4 flex-shrink-0">
          <DialogTitle className="text-base sm:text-lg font-semibold">
            Benefit Edit
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-pulse flex space-x-4 w-full">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-gray-500">Loading Price Details...</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-2 sm:px-5 py-2 sm:py-4 min-h-0">
              <div className="space-y-4 sm:space-y-6">
                {/* Form Fields Grid - Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Effective Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Effective Date
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="date"
                        id="effectiveDate"
                        value={detailData?.effectiveDate || ""}
                        className="pr-10 min-h-[40px] w-full"
                        disabled={true}
                        min={expiryDate || undefined}
                      />
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Expiry Date
                    </label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={detailData?.expiryDate || ""}
                        className="pr-10 min-h-[40px] w-full"
                        disabled={true}
                        min={detailData?.effectiveDate}
                      />
                    </div>
                  </div>

                  {/* Benefit Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Benefit Name
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Benefit Name"
                        {...register("benefitName")}
                        className="min-h-[40px] w-full"
                      />
                      {errors.benefitName && (
                        <p className="text-red-500 text-sm">
                          {errors.benefitName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Price Type
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Select
                        value={priceType}
                        onValueChange={(e) => {
                          setPriceType(e);
                        }}
                      >
                        <SelectTrigger className="min-h-[40px] w-full">
                          <SelectValue placeholder="Select Price Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Price Mapping">
                            Price Mapping
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {/* {errors.priceType && (
                      <p className="text-red-500 text-sm">
                        {errors.priceType.message}
                      </p>
                    )} */}
                    </div>
                  </div>

                  {/* Remarks - Full width on all screens */}
                  <div className="sm:col-span-2 lg:col-span-4 space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Remarks
                    </label>
                    <div className="relative">
                      <Input
                        {...register("remarks")}
                        placeholder="Enter remarks"
                        className="w-full px-3 py-2 min-h-[40px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Tabs Section */}
                <div className="w-full">
                  <div className="flex border-b overflow-x-auto">
                    {/* Benefit Value Tab - Always visible */}
                    <button
                      type="button"
                      onClick={() => setActiveTab("benefit")}
                      className={`py-2 px-3 sm:px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "benefit"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-600 hover:text-blue-600"
                      }`}
                    >
                      Benefit Value
                    </button>

                    {priceType === "Price Mapping" && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("priceMapping")}
                        className={`py-2 px-3 sm:px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === "priceMapping"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-600 hover:text-blue-600"
                        }`}
                      >
                        Price Mapping
                      </button>
                    )}
                  </div>

                  {/* Tab Content */}
                  <div className="mt-4">
                    <FormProvider {...methods}>
                      {activeTab === "benefit" && (
                        <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                          <BenefitValue<SubscriptionUpdateBenefitFormType>
                            periodType={periodType}
                            setPeriodType={setPeriodType}
                          />
                        </div>
                      )}
                      {activeTab === "advanced" && priceType === "Advanced" && (
                        <div className="rounded-lg p-3 sm:p-4 min-h-[300px] sm:min-h-[400px]">
                          <AdvancedBenefitUpdateComponent
                            data={watch("advanceBenefit")}
                            onChange={(data) =>
                              setValue("advanceBenefit", data)
                            }
                            scriptToChange={scriptToChange}
                          />
                        </div>
                      )}
                      {activeTab === "priceMapping" &&
                        priceType === "Price Mapping" && (
                          <div className="rounded-lg p-3 sm:p-4 min-h-[300px] sm:min-h-[400px]">
                            <p className="text-gray-500">
                              Price Mapping content will be here
                            </p>
                          </div>
                        )}
                    </FormProvider>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer - Sekarang di dalam form */}
            <DialogFooter className="pt-3 sm:pt-4 border-t bg-white flex-shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-5">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  handlePriceDialog(
                    false,
                    showPriceDialog.mode,
                    showPriceDialog.type,
                    null,
                  )
                }
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditPriceDialog;
