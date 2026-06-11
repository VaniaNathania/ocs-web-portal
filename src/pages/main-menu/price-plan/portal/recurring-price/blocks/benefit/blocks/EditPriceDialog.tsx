import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { useRecurringPriceContext } from "../../../hooks";
import useRecurringBenefitContext from "../hooks/useRecurringBenefitContext";
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
import BenefitValue from "./sub-block/BenefitValue";
import AdvancedBenefit from "./sub-block/AdvancedBenefit";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { periodType } from "./AddPriceDialog";
import { z } from "zod";
import { recurringUpdateBenefitSchema } from "../types/form";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XMLParser } from "fast-xml-parser";
import AdvancedBenefitUpdateComponent from "./sub-block/AdvancedBenefitUpdate";
// import AdvanceBenefitUpdateComponent from "../../../../usage-price/blocks/benefit-usage-price/create-benefit/AdvancedBenefitUpdate";

const API_URL = apiConfig.service_price_plan;
export type RecurringUpdateFormType = z.infer<
  typeof recurringUpdateBenefitSchema
>;

const EditPriceDialog = () => {
  const {  dataPricePlanDetail  } = usePortalData();
  const { GetData, PutData } = useCallApi();
  const {
    selectedRatePlan,
    selectedMapping,
    setSelectedMapping,
    fetchVersionsBenefitForRatePlan,
  } = useRecurringPriceContext();
  const { showPriceDialog, handlePriceDialog, selectedPriceVersion } =
    useRecurringBenefitContext();
  const [scriptToChange, setScriptToChange] = useState<string>("");

  const methods = useForm<RecurringUpdateFormType>({
    resolver: zodResolver(recurringUpdateBenefitSchema),
    defaultValues: {
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
    getValues,
    formState: { errors },
  } = methods;

  const [detailData, setDetailData] = useState<RecurringBenefitDetail | null>(
    null,
  );

  const [scriptTemplate, setScriptTemplate] = useState<
    { scriptTempletId: string; scriptTempletName: string }[]
  >([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [priceType, setPriceType] = useState<string>("Advanced");
  const [activeTab, setActiveTab] = useState("benefit");
  const [periodType, setPeriodType] = useState<periodType>("absolute");

  const effectiveDate = (selectedPriceVersion as any)?.effDate;
  const expiryDate = (selectedPriceVersion as any)?.expDate;

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

  const GetDataDetail = async () => {
    setIsLoading(true);
    try {
      const response = await GetData(
        `${API_URL}/price/detail/${selectedPriceVersion?.priceId}`,
        {},
      );

      if (response.status) {
        const detail: RecurringBenefitDetail = response.data;
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
        setValue("benefitValue", benefitValue);
        setValue("calculationUnit", calculationUnit ?? 0);
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
          jsonScriptPage: scriptPage,
          advancedBenefitRemarks: ruleRemarks,
        });
        setValue("reAttrId", reAttr);
        setValue("acctBalanceTypeId", acctBalanceTypeId);

        if (watch("absoluteEffectiveDate") !== null) {
          setPeriodType("absolute");
        } else {
          setPeriodType("relative");
        }

        //  console.log("detail:\n", detail);
        //  console.log("form:\n", getValues());
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const DoUpdateBenefit = async (formField: RecurringUpdateFormType) => {
    setIsSubmitting(true);
    try {
      const response = await PutData(
        `${API_URL}/price/benefit/update/${selectedPriceVersion?.priceId}`,
        formField,
      );

      if (response?.status) {
        toast.success(response.message);
        await fetchVersionsBenefitForRatePlan(
          selectedRatePlan || 0,
          selectedMapping,
        );
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

  const onSubmit = async (data: RecurringUpdateFormType) => {
    const allNull = Object.values(data.advanceBenefit ?? {}).every(
      (v) => v == null,
    );
    const cleaned = {
      ...data,
      advanceBenefit: allNull ? null : data.advanceBenefit,
    };
    await DoUpdateBenefit(cleaned);
  };

  // useEffect(() => {
  //   GetScriptTemplate();
  // }, []);

  useEffect(() => {
    if (showPriceDialog.show && selectedPriceVersion) {
      GetDataDetail();
    }
  }, [showPriceDialog.show, selectedPriceVersion]);

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
    if (!showPriceDialog.show && showPriceDialog.mode === "update") {
      ResetForm();
    }
  }, [showPriceDialog, ResetForm]);

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
            Benefit Create
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
                        min={detailData?.effectiveDate || undefined}
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

                    {priceType === "Advanced" && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("advanced")}
                        className={`py-2 px-3 sm:px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
                          <BenefitValue<RecurringUpdateFormType>
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
                    Creating...
                  </>
                ) : (
                  "OK"
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
