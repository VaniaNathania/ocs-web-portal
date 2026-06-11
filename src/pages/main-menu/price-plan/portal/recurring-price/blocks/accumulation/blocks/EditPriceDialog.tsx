import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import useRecurringAcmContext from "../hooks/useRecurringAcmContext";
import { useRecurringPriceContext } from "../../../hooks";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
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
import ExpressionPriceUpdateComponent from "./sub-block/ExpressionPriceUpdate";
import { XMLParser } from "fast-xml-parser";
// import ExpressionPrice from "./sub-block/ExpressionPrice";

const API_URL = apiConfig.service_price_plan;

const EditPriceDialog = () => {
  const {  selectedOfferVerId  } = usePortalData();
  const { GetData, PutData } = useCallApi();
  const {
    selectedRatePlan,
    selectedMapping,
    fetchVersionsAccumulationForRatePlan,
  } = useRecurringPriceContext();
  const {
    showPriceDialog,
    handlePriceDialog,
    selectedPriceVersion,
    setSelectedPriceVersion,
    selectedPrice,
    setSelectedPrice,
  } = useRecurringAcmContext();

  const updateInitialFormField = useCallback(
    (): RecurringUpdateAcm => ({
      offerVerId: selectedOfferVerId ?? 0,
      ratePlanId: selectedRatePlan ?? 0,
      priceVerId: selectedPriceVersion?.priceVerId ?? 0,
      mappingId: selectedMapping,
      effDate: "",
      expDate: null,
      resourceId: null,
      reAttrId: null,
      calculateUnit: null,
      accumulation: null,
      remarks: null,
      templateId: null,
      timeSpanAccumulation: null,
      referenceAccumulation: null,
      expressionPrice: null,
    }),
    [selectedOfferVerId, selectedRatePlan, selectedPriceVersion]
  );
  const [scriptToChange, setScriptToChange] = useState<string>("");
  const [detailAcm, setDetailAcm] = useState<RecurringPriceAcmDetail | null>(
    null
  );
  const [formField, setFormField] = useState<RecurringUpdateAcm>(() =>
    updateInitialFormField()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [accumType, setAccumType] = useState<
    {
      resourceId: number;
      resourceName: string;
      reAttrId: number;
      reAttrName: string;
    }[]
  >([]);
  const [scriptTemplate, setScriptTemplate] = useState<
    { scriptTempletId: string; scriptTempletName: string }[]
  >([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEffDateDisabled, setIsEffDateDisabled] = useState(false);

  const effectiveDate = (selectedPriceVersion as any)?.effDate;
  const expiryDate = (selectedPriceVersion as any)?.expDate;

  const ResetForm = useCallback(() => {
    const freshInitialForm = updateInitialFormField();
    setFormField(freshInitialForm);
    setErrors({});
    // setActiveTab("timespan");
  }, [updateInitialFormField]);

  const GetAccumType = async () => {
    try {
      const response = await GetData(
        `${API_URL}/price/accumulation-type/list`,
        {}
      );
      setAccumType(response?.data);
    } catch (error) {
      console.error("Error fetching accumulation type data:", error);
    }
  };

  const GetDetailAcm = async () => {
    setIsLoading(true);
    try {
      const response = await GetData(
        `${API_URL}/price/accumulation/list?priceId=${selectedPrice}`,
        {}
      );

      if (response.status) {
        const detail: RecurringPriceAcmDetail = response.data[0];
        setDetailAcm(detail);

        const {
          priceVerId,
          accumulation,
          rum,
          resourceId,
          resourceName,
          reAttr,
          reAttrName,
          effDate,
          expDate,
          acmName,
          priceId,
          srcPriceId,
          comments,
          refValueId,
          shareFlag,
          ratePlanId,
          ratePlanType,
          offerVerId,
          mappingId,
        } = detail;

        setFormField((prev) => ({
          ...prev,
          offerVerId,
          ratePlanId,
          priceVerId,
          effDate,
          expDate,
          resourceId,
          reAttrId: reAttr,
          calculateUnit: rum,
          accumulation,
          remarks: comments,
        }));
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Updated expression price fetch logic - sama seperti di UpdateAccumulationPriceDialog
  useEffect(() => {
    const fetchExpressionPriceDetail = async () => {
      try {
        const response = await GetData(`${API_URL}/price/acm-expression/list`, {
          priceVerId: selectedPriceVersion?.priceVerId,
          spId: 0,
        });

        const data = response?.data;
        if (data) {
          const {
            scriptTempletId,
            ruleComments,
            scriptPage,
            ruleScript: existingRuleScript,
          } = data;

          // Set scriptToChange untuk component
          setScriptToChange(scriptPage || "");

          let expressionPriceData = null;

          try {
            // Parse XML menggunakan XMLParser
            const parser = new XMLParser({
              ignoreAttributes: false,
              attributeNamePrefix: "",
            });
            const parsed = parser.parse(scriptPage || "<Properties/>");

            const props = parsed?.Properties?.Property || [];
            const items = parsed?.Properties?.value?.group?.item || [];
            const arrProps = Array.isArray(props) ? props : [props];
            const arrItems = Array.isArray(items) ? items : [items];

            // Build values object
            const values: Record<string, string> = {};
            arrProps.forEach((p: any) => {
              const item = arrItems.find((i: any) => i.id === p.id);
              values[p.id] = (item?.value ?? p.defaultValue ?? "").toString();
            });

            // Generate jsonScriptPage
            const jsonScriptPage = scriptTempletId
              ? JSON.stringify([{ "": values }])
              : null;

            // Generate ruleScript
            let ruleScript = "";
            if (scriptTempletId) {
              try {
                // Fetch template content
                const tmplRes = await GetData(
                  `${API_URL}/script-templet/${scriptTempletId}`,
                  {}
                );
                const tmpl = tmplRes?.data;
                if (tmpl?.templetTypeScript) {
                  ruleScript = tmpl.templetTypeScript;
                  // Replace placeholders dengan values
                  Object.entries(values).forEach(([k, v]) => {
                    const regex = new RegExp(
                      `&${k}&`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                      "g"
                    );
                    ruleScript = ruleScript.replace(regex, v);
                  });
                }
              } catch (tmplErr) {
                console.error("Failed to fetch script template:", tmplErr);
              }
            } else {
              ruleScript = existingRuleScript || "";
            }

            expressionPriceData = {
              scriptTempletId,
              ruleComment: ruleComments,
              ruleScript,
              jsonScriptPage,
            };
          } catch (parseError) {
            console.error("Parse expression failed:", parseError);
            // Fallback jika parsing gagal
            expressionPriceData = {
              scriptTempletId,
              ruleComment: ruleComments,
              ruleScript: existingRuleScript || "",
              jsonScriptPage: null,
            };
          }

          setFormField((prev) => ({
            ...prev,
            expressionPrice: expressionPriceData,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch expression price:", error);
      }
    };

    if (selectedPriceVersion?.priceVerId) {
      fetchExpressionPriceDetail();
    }
  }, [selectedPriceVersion?.priceVerId, GetData]);

  const DoUpdateVersion = async (formField: RecurringCreateAcm) => {
    setIsSubmitting(true);
    try {
      const response = await PutData(
        `${API_URL}/price/accumulation/update`,
        formField
      );

      if (response?.status) {
        toast.success(response.message);
        await fetchVersionsAccumulationForRatePlan(
          selectedRatePlan || 0,
          selectedMapping
        );
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!formField.effDate) {
      return toast.error("Please select an effective date.");
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
    DoUpdateVersion(formField);
  };

  const handleAccumulationTypeChange = (value: string) => {
    const selected = accumType.find(
      (item) => item.resourceId === Number(value)
    );
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
    if (selectedPrice) {
      GetDetailAcm();
    }
  }, [selectedPrice]);

  useEffect(() => {
    if (
      showPriceDialog.show &&
      showPriceDialog.mode === "create" &&
      selectedPriceVersion?.expDate
    ) {
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
  }, [
    showPriceDialog.show,
    selectedOfferVerId,
    selectedRatePlan,
    selectedPriceVersion,
  ]);

  return (
    <Dialog
      open={showPriceDialog.show}
      onOpenChange={(open) =>
        handlePriceDialog(open, showPriceDialog.mode, null, null)
      }
    >
      <DialogContent className="max-w-[1400px] max-h-[90vh] overflow-hidden p-6">
        <div className="overflow-y-auto max-h-[calc(90vh-6rem)] pr-2">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-xl font-semibold">
              Accumulation Edit
            </DialogTitle>
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
            <form onSubmit={handleSubmit} className="pt-2">
              {/* Main Form Fields */}
              <div className="grid grid-cols-4 gap-6 items-start mb-12">
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
                      className={`w-full transition-colors ${
                        errors.effDate
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      }`}
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

                        if (
                          formField.expDate &&
                          new Date(formField.expDate) < new Date(newValue)
                        ) {
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
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Expiry Date
                  </label>
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
                      className="pr-10 min-h-[42px]"
                      disabled={true}
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
                    <Select
                      value={formField.resourceId?.toString() || ""}
                      onValueChange={handleAccumulationTypeChange}
                    >
                      <SelectTrigger className="min-h-[42px]">
                        <SelectValue placeholder="Select Accumulation Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {accumType.map((item) => (
                          <SelectItem
                            key={item.resourceId}
                            value={item.resourceId.toString()}
                          >
                            {item.resourceName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Event Change */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Event Change
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={formField.reAttrId ?? ""}
                      className="w-full bg-gray-100 border border-dashed border-gray-400 text-gray-600 cursor-not-allowed min-h-[42px]"
                      disabled
                    />
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
                      className="min-h-[42px]"
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
                      value={formField.calculateUnit || ""}
                      onChange={(e) =>
                        setFormField((prev) => ({
                          ...prev,
                          calculateUnit: Number(e.target.value),
                        }))
                      }
                      className="min-h-[42px]"
                    />
                  </div>
                </div>

                {/* Remarks (col-span-2) */}
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Remarks
                  </label>
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
                      className="w-full px-3 py-2 min-h-[42px]"
                    />
                  </div>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="w-full mt-12">
                <div className="grid grid-cols-3 border-b">
                  <button
                    type="button"
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors border-blue-600 text-blue-600`}
                  >
                    Expression Price
                  </button>
                </div>

                <div className="mt-6">
                  <div className="rounded-lg p-4 min-h-[450px]">
                    <ExpressionPriceUpdateComponent
                      data={formField.expressionPrice}
                      onChange={(newExpressionPrice) => {
                        setFormField((prev) => ({
                          ...prev,
                          expressionPrice: newExpressionPrice,
                        }));
                      }}
                      scriptToChange={scriptToChange}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-6 mt-8 flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handlePriceDialog(false, showPriceDialog.mode, null, null)
                  }
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPriceDialog;
