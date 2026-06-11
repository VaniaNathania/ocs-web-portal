import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { useSubscriptionPriceCreateContext } from "../../../hooks";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar, Copy, Plus } from "lucide-react";
import { getAuth } from "@/auth";
import { useAccumulationContext } from "../hooks/useAccumulationContext";
import TimeSpan from "./sub-block/TimeSpan";
import ExpressionPrice from "./sub-block/ExpressionPrice";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subscriptionCreatePriceAccumulationSchema } from "../types/form";
import { PricePlanService } from "@/common/api/price-plan/endpoints";

const API_URL = apiConfig.service_price_plan;
export type SubscriptionCreateAcmFormType = z.infer<typeof subscriptionCreatePriceAccumulationSchema>;

const AddPriceDialog = () => {
  const { selectedOfferVerId } = usePortalData();
  const { GetData, PostData } = useCallApi();
  const { GET_REATTR } = PricePlanService();
  const { fetchVersionsAccumulationForRatePlan, selectedRatePlan, selectedMapping, selectedPrice } = useSubscriptionPriceCreateContext();
  const { showPriceDialog, handlePriceDialog, selectedPriceVer } = useAccumulationContext();

  const methods = useForm<SubscriptionCreateAcmFormType>({
    resolver: zodResolver(subscriptionCreatePriceAccumulationSchema),
    mode: "onChange",
    defaultValues: {
      offerVerId: selectedOfferVerId || 0,
      ratePlanId: selectedRatePlan ?? 0,
      priceVerId: selectedPriceVer?.priceVerId ?? 0,
      mappingId: null,
      effDate: "",
      expDate: "",
      resourceId: undefined,
      reAttrId: 0,
      calculateUnit: undefined,
      accumulation: "",
      remarks: "",
      expressionPrice: {
        ruleComment: null,
        jsonScriptPage: null,
        ruleScript: null,
        scriptTempletId: null,
      },
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = methods;

  const effDateField = register("effDate");

  const [calculateUnit, setCalculateUnit] = useState<{ id: number; reAttrName: string }[]>([]);
  const [accumType, setAccumType] = useState<
    {
      resourceId: number;
      resourceName: string;
      reAttrId: number;
      reAttrName: string;
    }[]
  >([]);
  const [scriptTemplate, setScriptTemplate] = useState<{ scriptTempletId: string; scriptTempletName: string }[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEffDateDisabled, setIsEffDateDisabled] = useState(false);
  const [isExpDateDisabled, setIsExpDateDisabled] = useState(false);
  const [activeTab, setActiveTab] = useState("timespan");

  const effectiveDate = (selectedPriceVer as any)?.effDate;
  const expiryDate = (selectedPriceVer as any)?.expDate;

  const ResetForm = () => {
    reset();
    setActiveTab("timespan");
  };

  const GetCalculateUnit = async () => {
    try {
      const response = await GET_REATTR();
      setCalculateUnit(response?.data);
    } catch (error) {
      console.error("Error fetching calculate unit data:", error);
    }
  };

  const GetAccumType = async () => {
    try {
      const response = await GetData(`${API_URL}/price/accumulation-type/list`, {});
      setAccumType(response?.data);
    } catch (error) {
      console.error("Error fetching accumulation type data:", error);
    }
  };

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

  //     if (response.status) {
  //       setValue("expressionPrice.scriptTempletId", response.data.templateId);
  //       setValue("expressionPrice.ruleScript", response.data.templetTypeScript);
  //       setValue("expressionPrice.jsonScriptPage", "[]");
  //       setValue("expressionPrice.ruleComment", null);
  //     }
  //   } catch (error) {
  //     toast.error("Something went wrong");
  //   }
  // };

  const DoCreateVersion = async (formField: SubscriptionCreateAcmFormType) => {
    setIsSubmitting(true);
    try {
      const response = await PostData(`${API_URL}/price/accumulation/create`, formField);

      if (response?.status) {
        toast.success(response.message);
        await fetchVersionsAccumulationForRatePlan(selectedRatePlan ?? 0, selectedMapping);
        handlePriceDialog(false, showPriceDialog.mode, null, null);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Error creating Rate Plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: SubscriptionCreateAcmFormType) => {
    // console.log(data);
    const allNull = Object.values(data.expressionPrice ?? {}).every((v) => v == null);
    const cleaned = {
      ...data,
      expressionPrice: allNull ? null : data.expressionPrice,
    };

    await DoCreateVersion(cleaned);
  };

  useEffect(() => {
    GetCalculateUnit();
    GetAccumType();
  }, []);

  useEffect(() => {
    if (showPriceDialog.show === false) {
      ResetForm();
    }
  }, [showPriceDialog.show, ResetForm]);

  useEffect(() => {
    if (showPriceDialog.show && showPriceDialog.mode === "create" && selectedPriceVer?.expDate) {
      setValue("effDate", selectedPriceVer?.expDate ?? "");
      setIsEffDateDisabled(true);
    } else if (showPriceDialog.show && showPriceDialog.mode === "create") {
      setIsEffDateDisabled(false);
      setIsExpDateDisabled(false);
    }
  }, [showPriceDialog.show, showPriceDialog.mode, selectedPriceVer]);

  useEffect(() => {
    if (showPriceDialog.show) {
      setValue("offerVerId", selectedOfferVerId ?? 0);
      setValue("ratePlanId", selectedRatePlan ?? 0);
      setValue("priceVerId", selectedPriceVer?.priceVerId ?? 0);
      setValue("mappingId", selectedMapping ?? null);
    }
  }, [showPriceDialog.show, selectedOfferVerId, selectedRatePlan, selectedPriceVer]);

  const handleAccumulationTypeChange = (value: string) => {
    const selected = accumType.find((item) => item.resourceId === Number(value));
    setValue("resourceId", Number(value), {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("reAttrId", selected?.reAttrId ?? 0, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // useEffect(() => {
  //   if (watch("expressionPrice.scriptTempletId")) {
  //     GetScriptContent(Number(watch("expressionPrice.scriptTempletId")));
  //   }
  // }, [watch("expressionPrice.scriptTempletId")]);
  // console.log(errors);

  return (
    <Dialog open={showPriceDialog.show} onOpenChange={(open) => handlePriceDialog(open, showPriceDialog.mode, null, null)}>
      <DialogContent className="max-w-[1300px] max-h-[90vh] overflow-hidden p-5 flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold">Accumulation Create</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-5rem)] pr-2">
          <form id="add-accumulation" onSubmit={handleSubmit(onSubmit)} className="pt-5">
            {/* Main Form Fields */}
            <div className="grid grid-cols-4 gap-4 items-start mb-10">
              {/* Effective Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Effective Date
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type="date" id="effDate" {...register("effDate")} className={`w-full transition-colors border border-gray-300 rounded-md text-sm p-2 ${errors.effDate ? "border-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`} disabled={isEffDateDisabled} min={expiryDate ? expiryDate : undefined} />
                </div>
                {errors.effDate && <p className="text-red-500 text-xs mt-1">{errors.effDate.message}</p>}
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">Expiry Date</label>
                <div className="relative">
                  <input type="date" {...register("expDate")} className={`w-full transition-colors border border-gray-300 rounded-md p-2 text-sm ${errors.expDate ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`} disabled={isExpDateDisabled} min={watch("effDate") || undefined} />
                </div>
              </div>

              {/* Accumulation Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Accumulation Type
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Select value={watch("resourceId") != null ? String(watch("resourceId")) : ""} onValueChange={handleAccumulationTypeChange}>
                    <SelectTrigger className={`min-h-[40px] ${errors?.resourceId ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select Accumulation Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accumType?.map((item) => (
                        <SelectItem key={item.resourceId} value={item.resourceId.toString()}>
                          {item.resourceName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {errors.resourceId && <p className="text-red-500 text-xs mt-1">{errors.resourceId.message}</p>}
                </div>
              </div>

              {/* Event Change */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">Event Change</label>
                <div className="relative">
                  <Input type="number" value={watch("reAttrId")} className="w-full bg-gray-100 border border-dashed border-gray-400 text-gray-600 cursor-not-allowed min-h-[40px]" disabled />
                </div>
              </div>

              {/* Accumulation */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Accumulation
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input type="text" {...register("accumulation")} className={`min-h-[40px] ${errors.accumulation ? "border-red-500" : ""}`} placeholder="Enter accumulation" />
                  {errors.accumulation && <p className="text-red-500 text-xs mt-1">{errors.accumulation.message}</p>}
                </div>
              </div>

              {/* Calculate Unit */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Calculate Unit
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    onKeyDown={(e) => {
                      if (e.key === "." || e.key === "," || e.key === "-") {
                        e.preventDefault();
                      }
                    }}
                    {...register("calculateUnit", {
                      setValueAs: (value) => {
                        if (!value) return null;
                        return Number(value);
                      },
                    })}
                    placeholder="Enter calculate unit"
                    className={`min-h-[40px] ${errors.calculateUnit ? "border-red-500" : ""}`}
                  />

                  {errors.calculateUnit && <p className="text-red-500 text-xs mt-1">{errors.calculateUnit.message}</p>}
                </div>
              </div>

              {/* Remarks (col-span-2) */}
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">Remarks</label>
                <div className="relative">
                  <Input {...register("remarks")} placeholder="Enter remarks" className="w-full px-3 py-2 min-h-[40px]" />
                </div>
              </div>
            </div>

            {/* Tabs Section */}

          </form>
        </div>
        <DialogFooter className="flex justify-end gap-5">
          <Button type="button" variant="outline" onClick={() => handlePriceDialog(false, showPriceDialog.mode, null, null)}>
            Cancel
          </Button>
          <Button form="add-accumulation" type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
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
      </DialogContent>
    </Dialog>
  );
};

export default AddPriceDialog;
