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
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createSubscriptionBenefitSchema
} from "../types/form";
import AdvancedBenefitComponent from "./sub-block/AdvancedBenefit";

const API_URL = apiConfig.service_price_plan;
export type periodType = "absolute" | "relative";
export type SubscriptionCreateBenefitFormType = z.infer<
  ReturnType<typeof createSubscriptionBenefitSchema>
>;

const AddPriceDialog = () => {
  const {  selectedOfferVerId  } = usePortalData();
  const { GetData, PostData } = useCallApi();
  const { selectedRatePlan, selectedMapping, fetchVersionsBenefitForRatePlan } =
    useSubscriptionPriceCreateContext();
  const { showPriceDialog, handlePriceDialog, selectedPriceVer } =
    useBenefitContext();

  const [periodType, setPeriodType] = useState<periodType>("absolute");
  const [priceType, setPriceType] = useState<string>("Advanced");

  const benefitSchema = useMemo(
    () => createSubscriptionBenefitSchema(periodType),
    [periodType]
  );

  // type SubscriptionCreateBenefitFormType = z.infer<typeof benefitSchema>;

  const methods = useForm<SubscriptionCreateBenefitFormType>({
    resolver: zodResolver(benefitSchema),
    mode: "onChange",
    defaultValues: {
      ratePlanId: selectedRatePlan || 0,
      offerVerId: selectedOfferVerId || 0,
      priceVerId: selectedPriceVer?.priceVerId || 0,
      mappingId: null,
      effectiveDate: "",
      expiryDate: null,
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

  const [scriptTemplate, setScriptTemplate] = useState<
    { scriptTempletId: string; scriptTempletName: string }[]
  >([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEffDateDisabled, setIsEffDateDisabled] = useState(false);
  const [isExpDateDisabled, setIsExpDateDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("benefit");

  const effectiveDate = (selectedPriceVer as any)?.effDate;
  const expiryDate = (selectedPriceVer as any)?.expDate;

  const ResetForm = useCallback(() => {
    reset();
    // setActiveTab("timespan");
  }, [reset]);

  const onSubmit = async (data: SubscriptionCreateBenefitFormType) => {
    const allNull = Object.values(data.advanceBenefit ?? {}).every(
      (v) => v == null
    );
    const cleaned = {
      ...data,
      priceVerId: !data.priceVerId || data.priceVerId === 0 ? null : data.priceVerId,
      advanceBenefit: allNull ? null : data.advanceBenefit,
    };

    await DoCreateBenefit(cleaned);
  };

  const DoCreateBenefit = async (
    formField: SubscriptionCreateBenefitFormType
  ) => {
    setIsSubmitting(true);
    try {
      const response = await PostData(
        `${API_URL}/price/benefit/create`,
        formField
      );

      if (response?.status) {
        toast.success(response.message);
        await fetchVersionsBenefitForRatePlan(
          selectedRatePlan || 0,
          selectedMapping
        );
        handlePriceDialog(
          false,
          showPriceDialog.mode,
          showPriceDialog.type,
          null
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

  // useEffect(() => {
  //   GetScriptTemplate();
  // }, []);

  useEffect(() => {
    const tabStillValid =
      activeTab === "benefit" ||
      (activeTab === "advanced" && priceType === "Advanced") ||
      (activeTab === "priceMapping" && priceType === "Price Mapping");

    if (!tabStillValid) {
      setActiveTab("benefit");
    }
  }, [priceType]);

  // useEffect(() => {
  //   const scriptId = watch("advanceBenefit.scriptTempletId");
  //   if (scriptId) {
  //     GetScriptContent(scriptId);
  //   }
  // }, [watch("advanceBenefit.scriptTempletId")]);

  useEffect(() => {
    if (!showPriceDialog.show) {
      ResetForm();
    }
  }, [showPriceDialog.show, ResetForm]);

  useEffect(() => {
    if (showPriceDialog.show) {
      setValue("offerVerId", selectedOfferVerId || 0);
      setValue("ratePlanId", selectedRatePlan ?? 0);
      if (showPriceDialog.type === "price") {
        setValue("priceVerId", selectedPriceVer?.priceVerId ?? 0);
      } else {
        setValue("priceVerId", 0);
      }
      setValue("mappingId", selectedMapping ?? null);
    }
  }, [
    showPriceDialog.show,
    showPriceDialog.type,
    selectedOfferVerId,
    selectedRatePlan,
    selectedPriceVer,
    setValue,
  ]);

  useEffect(() => {
    if (showPriceDialog.show && selectedPriceVer && showPriceDialog.mode) {
      if (showPriceDialog.type === "version") {
        setValue("effectiveDate", selectedPriceVer.expiryDate || selectedPriceVer.expDate || "");
        setIsEffDateDisabled(true);
      } else if (showPriceDialog.type === "price") {
        setValue("effectiveDate", selectedPriceVer.effectiveDate || selectedPriceVer.effDate || "");
        setValue("expiryDate", selectedPriceVer.expiryDate || selectedPriceVer.expDate || "");

        if (selectedPriceVer.effectiveDate || selectedPriceVer.effDate) {
          setIsEffDateDisabled(true);
        }
        if (selectedPriceVer.expiryDate || selectedPriceVer.expDate) {
          setIsExpDateDisabled(true);
        }
      }
    }
  }, [showPriceDialog, selectedPriceVer]);

  return (
    <Dialog
      open={showPriceDialog.show}
      onOpenChange={(open) =>
        handlePriceDialog(
          open,
          showPriceDialog.mode,
          showPriceDialog.type,
          null
        )
      }
    >
      <DialogContent className="max-w-[95vw] sm:max-w-[1300px] max-h-[95vh] flex flex-col overflow-hidden p-3 sm:p-5">
        <DialogHeader className="pb-2 sm:pb-4 flex-shrink-0">
          <DialogTitle className="text-base sm:text-lg font-semibold">
            Benefit Create
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {/* Form wrapper untuk seluruh content */}
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
                  <Input
                    type="date"
                    id="effectiveDate"
                    {...register("effectiveDate")}
                    className={`w-full transition-colors ${
                      errors.effectiveDate
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    disabled={isEffDateDisabled}
                    min={expiryDate ? expiryDate : undefined}
                    onChange={(e) => {
                      setValue("effectiveDate", e.target.value);
                      const currentExpiry = watch("expiryDate");
                      if (
                        currentExpiry &&
                        new Date(currentExpiry) < new Date(e.target.value)
                      ) {
                        setValue("expiryDate", null);
                      }
                    }}
                  />
                  {errors.effectiveDate && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.effectiveDate.message}
                    </p>
                  )}
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Expiry Date
                  </label>
                  <Input
                    type="date"
                    {...register("expiryDate")}
                    className={`w-full transition-colors`}
                    disabled={isExpDateDisabled}
                    min={watch("effectiveDate") || undefined}
                  />
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
                      className={`min-h-[40px] w-full ${errors.benefitName ? "border-red-500" : ""}`}
                    />
                    {errors.benefitName && (
                      <p className="text-xs text-red-500 mt-1">
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

                </div>

                {/* Tab Content */}
                <div className="mt-4">
                  <FormProvider {...methods}>
                    {activeTab === "benefit" && (
                      <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <BenefitValue<SubscriptionCreateBenefitFormType>
                          periodType={periodType}
                          setPeriodType={setPeriodType}
                        />
                      </div>
                    )}
                    {activeTab === "advanced" && priceType === "Advanced" && (
                      <div className="rounded-lg p-3 sm:p-4 min-h-[300px] sm:min-h-[400px]">
                        <AdvancedBenefitComponent
                          data={watch("advanceBenefit")}
                          onChange={(data) => setValue("advanceBenefit", data)}
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
                  null
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
                  Creating...
                </>
              ) : (
                "OK"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPriceDialog;
