import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import useRecurringAcmContext from "../hooks/useRecurringAcmContext";
import { useRecurringPriceContext } from "../../../hooks";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ExpressionPrice from "./sub-block/ExpressionPrice";

const API_URL = apiConfig.service_price_plan;

const AddPriceDialog = () => {
  const { selectedOfferVerId } = usePortalData();
  const { GetData, PostData } = useCallApi();
  const { selectedRatePlan, selectedMapping, setSelectedMapping, fetchVersionsAccumulationForRatePlan } = useRecurringPriceContext();
  const { showPriceDialog, handlePriceDialog, selectedPriceVersion, setSelectedPriceVersion, selectedPrice, setSelectedPrice } = useRecurringAcmContext();

  const createInitialFormField = useCallback(
    (): RecurringCreateAcm => ({
      priceVerId: selectedPriceVersion?.priceVerId ?? 0,
      offerVerId: selectedOfferVerId ?? 0,
      ratePlanId: selectedRatePlan ?? 0,
      mappingId: selectedMapping,
      effDate: "",
      expDate: null,
      resourceId: null,
      reAttrId: null,
      calculateUnit: null,
      accumulation: null,
      remarks: null,
      templateId: null,
      expressionPrice: null,
    }),
    [selectedOfferVerId, selectedRatePlan, selectedPriceVersion],
  );

  const [formField, setFormField] = useState<RecurringCreateAcm>(() => createInitialFormField());
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const effectiveDate = (selectedPriceVersion as any)?.effDate;
  const expiryDate = (selectedPriceVersion as any)?.expDate;

  const ResetForm = useCallback(() => {
    const freshInitialForm = createInitialFormField();
    setFormField(freshInitialForm);
    setErrors({});
    // setActiveTab("timespan");
  }, [createInitialFormField]);

  const GetAccumType = async () => {
    try {
      const response = await GetData(`${API_URL}/price/accumulation-type/list`, {});
      setAccumType(response?.data);
    } catch (error) {
      console.error("Error fetching accumulation type data:", error);
    }
  };

  const DoCreateVersion = async (formField: RecurringCreateAcm) => {
    setIsSubmitting(true);
    try {
      const response = await PostData(`${API_URL}/price/accumulation/create`, formField);

      if (response?.status) {
        toast.success(response.message);
        await fetchVersionsAccumulationForRatePlan(selectedRatePlan ?? 0, selectedMapping);
        handlePriceDialog(false, showPriceDialog.mode, null, null);
        setSelectedMapping(null);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Error creating Rate Plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formField.effDate) {
      return toast.error("Effective date is required.");
    }

    if (!formField.resourceId) {
      return toast.error("Please select an accumulation type.");
    }

    if (!formField.accumulation) {
      return toast.error("Please enter an accumulation value.");
    }

    if (!formField.calculateUnit) {
      return toast.error("Please select a calculate unit.");
    }
    DoCreateVersion(formField);
  };

  const handleAccumulationTypeChange = (value: string) => {
    const selected = accumType.find((item) => item.resourceId === Number(value));
    setFormField((prev) => ({
      ...prev,
      resourceId: Number(value),
      reAttrId: selected?.reAttrId ?? 0,
    }));
  };

  useEffect(() => {
    // GetCalculateUnit();
    GetAccumType();
    // GetScriptTemplate();
  }, []);

  useEffect(() => {
    if (showPriceDialog.show === false) {
      ResetForm();
    }
  }, [showPriceDialog.show, ResetForm]);

  // useEffect(() => {
  //   if (formField.expressionPrice?.scriptTempletId) {
  //     GetScriptContent(formField.expressionPrice.scriptTempletId);
  //   }
  // }, [formField.expressionPrice?.scriptTempletId]);

  useEffect(() => {
    if (showPriceDialog.show && showPriceDialog.mode === "create" && selectedPriceVersion?.expDate) {
      setFormField((prev) => ({
        ...prev,
        effDate: selectedPriceVersion?.expDate ?? "",
      }));
      setIsEffDateDisabled(true);
    } else if (showPriceDialog.show && showPriceDialog.mode === "create") {
      setIsEffDateDisabled(false);
    }
  }, [showPriceDialog.show, showPriceDialog.mode, selectedPriceVersion]);

  useEffect(() => {
    if (showPriceDialog.show) {
      setFormField((prev) => ({
        ...prev,
        offerVerId: selectedOfferVerId || 0,
        ratePlanId: selectedRatePlan ?? 0,
        priceVerId: selectedPriceVersion?.priceVerId ?? 0,
        mappingId: selectedMapping,
      }));
    }
  }, [showPriceDialog.show, selectedOfferVerId, selectedRatePlan, selectedPriceVersion, selectedMapping]);

  return (
    <Dialog open={showPriceDialog.show} onOpenChange={(open) => handlePriceDialog(open, showPriceDialog.mode, null, null)}>
      <DialogContent className="max-w-[1300px] max-h-[90vh] overflow-hidden p-5">
        <div className="overflow-y-auto max-h-[calc(90vh-5rem)] pr-2">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-semibold">Accumulation Create</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="pt-5">
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
                    id="effDate"
                    value={formField.effDate ?? ""}
                    disabled={isEffDateDisabled}
                    min={expiryDate || undefined}
                    className={`w-full transition-colors ${errors.effDate ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormField((prev) => ({
                        ...prev,
                        effDate: newValue,
                      }));

                      setErrors((prev) => ({
                        ...prev,
                        effDate: "",
                      }));

                      if (formField.expDate && new Date(formField.expDate) < new Date(newValue)) {
                        setFormField((prev) => ({
                          ...prev,
                          expDate: null,
                        }));
                      }
                    }}
                  />

                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">Expiry Date</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formField.expDate || ""}
                    onChange={(e) => {
                      setFormField((prev) => ({
                        ...prev,
                        expDate: e.target.value,
                      }));
                    }}
                    className="pr-10 min-h-[40px]"
                    min={formField.effDate || undefined}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Accumulation Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Accumulation Type
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Select value={formField.resourceId?.toString() || ""} onValueChange={handleAccumulationTypeChange}>
                    <SelectTrigger className="min-h-[40px]">
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
                </div>
              </div>

              {/* Event Change */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">Event Change</label>
                <div className="relative">
                  <Input type="number" value={formField.reAttrId ?? ""} className="w-full bg-gray-100 border border-dashed border-gray-400 text-gray-600 cursor-not-allowed min-h-[40px]" disabled />
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
                    value={formField.accumulation || ""}
                    onChange={(e) =>
                      setFormField((prev) => ({
                        ...prev,
                        accumulation: e.target.value,
                      }))
                    }
                    className="min-h-[40px]"
                  />
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
                    value={formField.calculateUnit || ""}
                    onChange={(e) =>
                      setFormField((prev) => ({
                        ...prev,
                        calculateUnit: Number(e.target.value),
                      }))
                    }
                    className="min-h-[40px]"
                  />
                </div>
              </div>

              {/* Remarks (col-span-2) */}
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">Remarks</label>
                <div className="relative">
                  <Input
                    value={formField.remarks || ""}
                    onChange={(e) =>
                      setFormField((prev) => ({
                        ...prev,
                        remarks: e.target.value,
                      }))
                    }
                    placeholder="Enter remarks"
                    className="w-full px-3 py-2 min-h-[40px]"
                  />
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="w-full mt-10">
              <div className="grid grid-cols-3 border-b">
                <button type="button" className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors border-blue-600 text-blue-600`}>
                  Expression Price
                </button>
              </div>

              <div className="mt-4">
                <div className="rounded-lg p-4 min-h-[400px]">
                  <ExpressionPrice
                    data={formField.expressionPrice}
                    onChange={(data) =>
                      setFormField((prev: any) => ({
                        ...prev,
                        expressionPrice: data,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 mt-5 flex justify-end gap-5">
              <Button type="button" variant="outline" onClick={() => handlePriceDialog(false, showPriceDialog.mode, null, null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPriceDialog;
