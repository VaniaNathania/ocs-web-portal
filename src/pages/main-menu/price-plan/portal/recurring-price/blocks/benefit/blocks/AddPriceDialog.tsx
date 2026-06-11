import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import useRecurringBenefitContext from "../hooks/useRecurringBenefitContext";
import { useRecurringPriceContext } from "../../../hooks";
import { useCallback, useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import AdvancedBenefit from "./sub-block/AdvancedBenefit";
import BenefitValue from "./sub-block/BenefitValue";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recurringCreateBenefitSchema } from "../types/form";
import AdvancedBenefitComponent from "./sub-block/AdvancedBenefit";

const API_URL = apiConfig.service_price_plan;
export type periodType = "absolute" | "relative";
export type RecurringCreateBenefitFormType = z.infer<
  typeof recurringCreateBenefitSchema
>;

const AddPriceDialog = () => {
  const {  selectedOfferVerId  } = usePortalData();
  const { GetData, PostData } = useCallApi();
  const {
    selectedRatePlan,
    selectedMapping,
    setSelectedMapping,
    fetchVersionsBenefitForRatePlan,
  } = useRecurringPriceContext();
  const {
    showPriceDialog,
    handlePriceDialog,
    selectedPriceVersion,
    priceVersionDate,
  } = useRecurringBenefitContext();

  const methods = useForm<RecurringCreateBenefitFormType>({
    resolver: zodResolver(recurringCreateBenefitSchema),
    defaultValues: {
      ratePlanId: selectedRatePlan || 0,
      offerVerId: selectedOfferVerId || 0,
      priceVerId: selectedPriceVersion?.priceVerId || 0,
      mappingId: selectedMapping,
      effectiveDate: "",
      expiryDate: null,
      benefitName: "",
      remarks: null,
      benefitValue: undefined,
      acctBalanceTypeId: undefined,
      reAttrId: undefined,
      calculationUnit: undefined,
      cycleFloorLimit: null,
      cycleCeilLimit: null,
      dailyFloorLimit: null,
      dailyCeilLimit: null,
      maximumDays: null,
      subscriberOnly: null,
      absoluteEffectiveDate: "",
      absoluteExpiryDate: null,
      offsetOfEffectiveDate: undefined,
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

  const [isEffDateDisabled, setIsEffDateDisabled] = useState(false);
  const [isExpDateDisabled, setIsExpDateDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [priceType, setPriceType] = useState<string>("Advanced");
  const [activeTab, setActiveTab] = useState("benefit");
  const [periodType, setPeriodType] = useState<periodType>("absolute");

  const ResetForm = useCallback(() => {
    reset();
    // setActiveTab("timespan");
  }, [reset]);

  // const GetScriptTemplate = async () => {
  //   try {
  //     const response = await GetData(`${API_URL}/script-templet/list`, {});
  //     setScriptTemplate(response?.data);
  //   } catch (error) {
  //     console.error("Error fetching script template data:", error);
  //   }
  // };

  // const GetScriptContent = async (scriptId: number) => {
  //   try {
  //     const response = await GetData(
  //       `${API_URL}/script-templet/${scriptId}`,
  //       {}
  //     );

  //     if (response.data) {
  //       setValue("advanceBenefit", {
  //         scriptTempletId: response.data.templateId,
  //         ruleScript: response.data.templetTypeScript,
  //         jsonScriptPage: "",
  //         advancedBenefitRemarks: null,
  //       });
  //     }
  //   } catch (error) {
  //     toast.error("Something went wrong");
  //   }
  // };

  const onSubmit = async (data: RecurringCreateBenefitFormType) => {
    // console.log(data);
    await DoCreateBenefit(data);
  };

  const DoCreateBenefit = async (formField: RecurringCreateBenefitFormType) => {
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
    if (!showPriceDialog.show && showPriceDialog.mode === "create") {
      ResetForm();
    } else {
      setValue("offerVerId", selectedOfferVerId || 0);
      setValue("ratePlanId", selectedRatePlan ?? 0);
      setValue("priceVerId", selectedPriceVersion?.priceVerId ?? 0);
      setValue("mappingId", selectedMapping);
    }
  }, [
    showPriceDialog,
    selectedOfferVerId,
    selectedRatePlan,
    selectedPriceVersion,
  ]);

  const effectiveDate = (selectedPriceVersion as any)?.effDate;
  const expiryDate = (selectedPriceVersion as any)?.expDate;

  useEffect(() => {
    if (
      showPriceDialog.show &&
      showPriceDialog.mode === "create" &&
      expiryDate
    ) {
      setValue("effectiveDate", expiryDate ?? "");
      setIsEffDateDisabled(true);
    } else if (showPriceDialog.show && showPriceDialog.mode === "create") {
      setIsEffDateDisabled(false);
    }
  }, [showPriceDialog, expiryDate]);

  useEffect(() => {
    if (showPriceDialog.show && selectedPriceVersion && showPriceDialog.type) {
      if (showPriceDialog.type === "version") {
        setValue("effectiveDate", expiryDate || "");
        setIsEffDateDisabled(true);
      } else if (showPriceDialog.type === "price") {
        setValue("effectiveDate", selectedPriceVersion.effectiveDate || "");
        setValue("expiryDate", selectedPriceVersion.expiryDate || "");

        if (selectedPriceVersion.effectiveDate || effectiveDate) {
          setIsEffDateDisabled(true);
        }
        if (selectedPriceVersion.expiryDate || expiryDate) {
          setIsExpDateDisabled(true);
        }
      }
    }
  }, [showPriceDialog, selectedPriceVersion, expiryDate, effectiveDate]);

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
      <DialogContent className="max-w-[1300px] max-h-[95vh] overflow-y-auto p-5 flex flex-col">
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
                  <div className="relative">
                    <Input
                      type="date"
                      id="effectiveDate"
                      {...register("effectiveDate")}
                      className="pr-10 min-h-[40px] w-full"
                      disabled={isEffDateDisabled}
                      min={expiryDate ? expiryDate : undefined} // Eff date minimal setelah exp date versi sebelumnya
                      onChange={(e) => {
                        setValue("effectiveDate", e.target.value);
                        // Reset expiry date jika lebih kecil dari effective date baru
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
                      <p className="text-xs text-red-500 mt-1">
                        {errors.effectiveDate.message}
                      </p>
                    )}
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
                      {...register("expiryDate")}
                      className="pr-10 min-h-[40px] w-full"
                      disabled={isExpDateDisabled}
                      min={watch("effectiveDate") || undefined}
                    />
                    {errors.expiryDate && (
                      <p className="text-red-500 text-sm">
                        {errors.expiryDate.message}
                      </p>
                    )}
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

                  {priceType === "Advanced" && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("advanced")}
                      className={` py-2 px-3 sm:px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap${
                        activeTab === "advanced"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-600 hover:text-blue-600"
                      }`}
                    >
                      Advanced Benefit
                    </button>
                  )}

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
                        <BenefitValue<RecurringCreateBenefitFormType>
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
