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
import { subscriptionUpdatePriceAccumulationSchema } from "../types/form";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ExpressionPriceComponent from "./sub-block/UpdateExpressionPrice";
import { XMLParser } from "fast-xml-parser";
import { PricePlanService } from "@/common/api/price-plan/endpoints";

const API_URL = apiConfig.service_price_plan;

export type SubscriptionUpdateAcmFormType = z.infer<typeof subscriptionUpdatePriceAccumulationSchema>;

// Helper function untuk inject values ke script template
const injectValuesToScript = (script: string, values: Record<string, string>): string => {
  let updatedScript = script;
  Object.entries(values).forEach(([key, value]) => {
    const placeholder = `&${key}&`;
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"), "g");
    updatedScript = updatedScript.replace(regex, value);
  });
  return updatedScript;
};

interface ExpressionPrice {
  scriptTempletId?: number | null;
  ruleComment?: string | null;
  ruleScript?: string | null;
  jsonScriptPage?: string | null;
}

const EditPriceDialog = () => {
  const { selectedOfferVerId } = usePortalData();
  const { GetData, PutData } = useCallApi();
  const { GET_REATTR } = PricePlanService();
  const { fetchVersionsAccumulationForRatePlan, selectedRatePlan, selectedMapping } = useSubscriptionPriceCreateContext();
  const { showPriceDialog, handlePriceDialog, selectedPrice, selectedPriceVer } = useAccumulationContext();

  const methods = useForm<SubscriptionUpdateAcmFormType>({
    resolver: zodResolver(subscriptionUpdatePriceAccumulationSchema),
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
      expressionPrice: null,
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

  // State untuk expression price parsing
  const [scriptToChange, setScriptToChange] = useState<string>("");
  const [detailAcm, setDetailAcm] = useState<any | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timespan");

  const effectiveDate = (selectedPriceVer as any)?.effDate;
  const expiryDate = (selectedPriceVer as any)?.expDate;

  const ResetForm = () => {
    reset();
    setActiveTab("timespan");
    setScriptToChange("");
    setDetailAcm(null);
  };

  // Robust expression price processing logic

  // Fixed FetchDetailData dengan robust handling
  const FetchDetailData = useCallback(
    async (selectedPrice: number) => {
      setIsLoading(true);

      try {
        const minDelay = new Promise((resolve) => setTimeout(resolve, 300));

        // Fetch main accumulation data
        const fetcDataMandatory = GetData(`${API_URL}/price/accumulation/list?priceId=${selectedPrice}`, {});

        // Multiple API attempts untuk expression price

        const [res1] = await Promise.all([
  fetcDataMandatory,
  minDelay,
]);

        // Handle main accumulation data
        if (res1.status && Array.isArray(res1.data) && res1.data.length > 0) {
          const detail = res1.data[0];
          setDetailAcm(detail);

          // Set form values
          setValue("effDate", detail.effDate || "");
          setValue("expDate", detail.expDate || "");
          setValue("resourceId", detail.resourceId || 0);
          setValue("reAttrId", detail.reAttr || 0);
          setValue("accumulation", detail.accumulation || "");
          setValue("calculateUnit", detail.rum || 0);
          setValue("remarks", detail.comments || "");
        } else {
          toast.error("Failed to fetch accumulation data");
        }

        // Handle expression price data dengan robust processing
      } catch (error) {
        console.error("Error fetching detail data:", error);
        toast.error("Something went wrong while fetching data");

        // Set default values pada error
        setValue("expressionPrice", {
          scriptTempletId: null,
          ruleComment: null,
          ruleScript: null,
          jsonScriptPage: null,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [selectedPriceVer, setValue],
  );

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

  const GetScriptTemplate = async () => {
    
  };

  const DoUpdateVersion = async (formField: SubscriptionUpdateAcmFormType) => {
    setIsSubmitting(true);
    try {
      const response = await PutData(`${API_URL}/price/accumulation/update`, formField);

      if (response?.status) {
        toast.success(response.message);
        await fetchVersionsAccumulationForRatePlan(selectedRatePlan || 0, selectedMapping);
        handlePriceDialog(false, showPriceDialog.mode, null, null);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error("Error updating accumulation:", error);
      toast.error("Error updating accumulation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: SubscriptionUpdateAcmFormType) => {
    // Check apakah semua field expression price null atau empty
    const allNull = Object.values(data.expressionPrice ?? {}).every((v) => v == null || v === "");

    const cleaned = {
      ...data,
      expressionPrice: allNull ? null : data.expressionPrice,
    };

    await DoUpdateVersion(cleaned);
  };

  useEffect(() => {
    GetCalculateUnit();
    GetAccumType();
    GetScriptTemplate();
  }, []);

  useEffect(() => {
    if (showPriceDialog.show === false) {
      ResetForm();
    }
  }, [showPriceDialog.show, ResetForm]);

  useEffect(() => {
    if (showPriceDialog.show) {
      setValue("offerVerId", selectedOfferVerId ?? 0);
      setValue("ratePlanId", selectedRatePlan ?? 0);
      setValue("priceVerId", selectedPriceVer?.priceVerId ?? 0);
    }
  }, [showPriceDialog.show, selectedOfferVerId, selectedRatePlan, selectedPriceVer]);

  useEffect(() => {
    if (selectedPrice && showPriceDialog.show) {
      FetchDetailData(selectedPrice);
    }
  }, [selectedPrice, showPriceDialog.show, FetchDetailData]);

  const handleAccumulationTypeChange = (value: string) => {
    const selected = accumType.find((item) => item.resourceId === Number(value));
    setValue("resourceId", Number(value));
    setValue("reAttrId", selected?.reAttrId ?? 0);
  };

  return (
    <Dialog open={showPriceDialog.show} onOpenChange={(open) => handlePriceDialog(open, showPriceDialog.mode, null, null)}>
      <DialogContent className="max-w-[1300px] max-h-[90vh] overflow-hidden p-5 flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold">Accumulation Edit</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-5rem)] pr-2">
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
            <form id="edit-accumulation" onSubmit={handleSubmit(onSubmit)} className="pt-5">
              {/* Main Form Fields */}
              <div className="grid grid-cols-4 gap-4 items-start mb-10">
                {/* Effective Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Effective Date
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      {...register("effDate", {
                        required: "Effective Date is required",
                      })}
                      className="pr-10 min-h-[40px]"
                      disabled
                    />
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">Expiry Date</label>
                  <div className="relative">
                    <Input type="date" {...register("expDate")} className="pr-10 min-h-[40px]" disabled />
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
                      <SelectTrigger className={`min-h-[40px] ${errors.resourceId ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select Accumulation Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {accumType.map((item) => (
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
                    <Input
                      type="text"
                      {...register("accumulation", {
                        required: "Accumulation is required",
                      })}
                      className={`min-h-[40px] ${errors.accumulation ? "border-red-500" : ""}`}
                      placeholder="Enter Accumulation"
                    />

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
                      placeholder="Enter Calculate Unit"
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

            </form>
          )}
        </div>
        <DialogFooter className="pt-4 mt-5 flex justify-end gap-5">
          <Button type="button" variant="outline" onClick={() => handlePriceDialog(false, showPriceDialog.mode, null, null)}>
            Cancel
          </Button>
          <Button form="edit-accumulation" type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
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
      </DialogContent>
    </Dialog>
  );
};

export default EditPriceDialog;
