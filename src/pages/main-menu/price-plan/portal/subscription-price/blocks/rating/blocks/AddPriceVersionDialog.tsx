import { useCallApi } from "@/hooks";
import { useSubscriptionPriceCreateContext } from "../../../hooks";
import { useEffect, useState } from "react";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { z } from "zod";
import { subscriptionCreatePriceRatingSchema } from "../types/form";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ExpressionPrice from "./ExpressionPrice";
import AccountItemSearchSelect from "../../SelectSearchAccountItemType";
import { AcctConfService } from "@/common/api/account-config/endpoints";
import { PricePlanService } from "@/common/api/price-plan/endpoints";
import { NumericFormat } from "react-number-format";

export type SubscriptionCreatePriceRatingForm = z.infer<typeof subscriptionCreatePriceRatingSchema>;

const API_URL = apiConfig.service_price_plan;

const AddPriceVersionDialog = () => {
  const { setSelectedMapping, selectedMapping, fetchVersionsRatingForRatePlan, showPriceVersionDialog, handlePriceVersionDialog, selectedRatePlan, selectedEvent, selectedPriceVer, setSelectedPriceVer, priceVersionDate, setPriceVersionDate } = useSubscriptionPriceCreateContext();
  const { selectedOfferVerId } = usePortalData();

  const { PostData } = useCallApi();
  const { GET_REATTR } = PricePlanService();
  const { GET_ACCT_ITEM_TYPE } = AcctConfService();

  const methods = useForm<SubscriptionCreatePriceRatingForm>({
    resolver: zodResolver(subscriptionCreatePriceRatingSchema),
    mode: "onChange",
    defaultValues: {
      priceVerId: 0,
      offerVerId: selectedOfferVerId || 0,
      ratePlanId: selectedRatePlan || 0,
      mappingId: selectedMapping || null,
      effDate: "",
      expDate: null,
      reId: selectedEvent || 0,
      priceName: "",
      acctItemTypeId: undefined,
      price: undefined,
      payIndicator: null,
      rum: undefined,
      reAttr: undefined,
      comments: "",
      expressionPrice: {
        ruleComment: null,
        scriptTempletId: null,
        jsonScriptPage: null,
        ruleScript: null,
      },
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = methods;

  const [calculateUnit, setCalculateUnit] = useState<{ id: number; reAttrName: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEffDateDisabled, setIsEffDateDisabled] = useState(false);
  const [isExpDateDisabled, setIsExpDateDisabled] = useState(false);

  const expiryDate = (selectedPriceVer as any)?.expDate;

  const resetForm = () => {
    reset();
    setPriceVersionDate(null);
    setIsEffDateDisabled(false);
    setIsExpDateDisabled(false);
  };

  const getCalculateUnit = async () => {
    try {
      const response = await GET_REATTR();
      setCalculateUnit(response?.data ?? []);
    } catch (error) {
      console.error("Error fetching calculate unit data:", error);
    }
  };

  const getAccountItemType = async () => {
    try {
      const response = await GET_ACCT_ITEM_TYPE({
        search: "",
        page: 1,
        size: 200,
        sortBy: "BAL_TYPE",
        sortDirection: "ASC",
        spId: 0,
      });
    } catch (error) {
      console.error("Error fetching account type data:", error);
    }
  };

  const doCreatePriceVersion = async (formField: SubscriptionCreatePriceRatingForm) => {
    setIsSubmitting(true);
    try {
      const response = await PostData(`${API_URL}/price/create?reType=3`, formField);

      if (response?.status) {
        setSelectedMapping(null);
        await fetchVersionsRatingForRatePlan(selectedRatePlan || 0, selectedMapping);
        toast.success(response.message);
        handlePriceVersionDialog(false, "version", "create", null);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Error creating Rate Plan");
    } finally {
      setIsSubmitting(false);
      setSelectedPriceVer(null);
    }
  };

  const onSubmit = (data: SubscriptionCreatePriceRatingForm) => {
    const allNull = Object.values(data.expressionPrice ?? {}).every((value) => value == null);

    const cleaned = {
      ...data,
      expressionPrice: allNull ? null : data.expressionPrice,
    };

    doCreatePriceVersion(cleaned);
  };

  useEffect(() => {
    getAccountItemType();
    getCalculateUnit();
  }, []);

  useEffect(() => {
    if (!showPriceVersionDialog.show) {
      resetForm();
      return;
    }

    setValue("reId", selectedEvent || 0);
    setValue("ratePlanId", selectedRatePlan || 0);

    if (selectedPriceVer && showPriceVersionDialog.mode === "price") {
      setValue("priceVerId", selectedPriceVer.priceVerId ?? 0);
    }
  }, [showPriceVersionDialog, selectedEvent, selectedRatePlan, selectedPriceVer, setValue]);

  useEffect(() => {
    if (selectedMapping) {
      setValue("mappingId", selectedMapping);
    }
  }, [selectedMapping, setValue]);

  useEffect(() => {
    if (!showPriceVersionDialog.show || !priceVersionDate) {
      return;
    }

    if (showPriceVersionDialog.mode === "version") {
      setValue("effDate", priceVersionDate.expDate || "");
      setIsEffDateDisabled(true);
      return;
    }

    if (showPriceVersionDialog.mode === "price") {
      setValue("effDate", priceVersionDate.effDate || "");
      setValue("expDate", priceVersionDate.expDate || null);

      if (priceVersionDate.effDate) {
        setIsEffDateDisabled(true);
      }

      if (priceVersionDate.expDate) {
        setIsExpDateDisabled(true);
      }
    }
  }, [showPriceVersionDialog, priceVersionDate, setValue]);

  return (
    <Dialog open={showPriceVersionDialog.show} onOpenChange={(open) => handlePriceVersionDialog(open, showPriceVersionDialog.mode, showPriceVersionDialog.type, null)}>
      <DialogContent className="max-w-[1200px] max-h-[90vh] p-0 gap-0 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-gray-900">Price Version Rating - Create</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <DialogBody className="flex-1 overflow-y-auto px-6 py-6">
          <form id="add-price-version-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Effective Date
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="effDate"
                  {...register("effDate")}
                  className={`w-full transition-colors border border-gray-300 rounded-md text-sm p-2  ${errors.effDate ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "focus:border-blue-500 focus:ring-blue-200"}`}
                  disabled={isEffDateDisabled}
                  min={expiryDate ? expiryDate : undefined}
                  onChange={(e) => {
                    setValue("effDate", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });

                    const currentExpiry = watch("expDate");
                    if (currentExpiry && new Date(currentExpiry) < new Date(e.target.value)) {
                      setValue("expDate", null, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }
                  }}
                />
                {errors.effDate && (
                  <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.effDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">Expiry Date</label>
                <input type="date" {...register("expDate")} className="w-full transition-colors border border-gray-300 text-sm rounded-md p-2" disabled={isExpDateDisabled} min={watch("effDate") || undefined} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Price Name
                  <span className="text-red-500">*</span>
                </label>
                <Input className={`w-full transition-colors ${errors.priceName ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}`} type="text" {...register("priceName")} placeholder="Enter price name" />
                {errors.priceName && (
                  <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.priceName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <NumericFormat
                        value={field.value ?? ""}
                        className={`w-full px-3 py-2 text-sm border focus:outline-none transition-colors rounded-md ${errors.price ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
                        thousandSeparator="."
                        decimalSeparator=","
                        allowNegative={false}
                        onValueChange={(values) => {
                          field.onChange(values.floatValue ?? undefined);
                        }}
                        fixedDecimalScale={true}
                        placeholder="Input price"
                        getInputRef={field.ref}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    )}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <Input className="w-full mt-8 bg-gray-100 border border-dashed border-gray-400 text-gray-600 cursor-not-allowed" type="number" min="0" {...register("acctItemTypeId")} disabled />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Calculate Unit <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min={0}
                    onKeyDown={(e) => {
                      if (e.key === "." || e.key === "," || e.key === "-") {
                        e.preventDefault();
                      }
                    }}
                    {...register("rum", {
                      setValueAs: (value) => {
                        if (value === "" || value == null) {
                          return undefined;
                        }

                        return Number(value);
                      },
                    })}
                    placeholder="Input calculate unit"
                    className={`min-h-[40px] ${errors.rum ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"}`}
                  />
                  {errors.rum && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.rum.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Select Unit
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={watch("reAttr") != null ? String(watch("reAttr")) : ""}
                    onValueChange={(value) => {
                      setValue("reAttr", Number(value), {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                  >
                    <SelectTrigger className={`w-full border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-colors ${errors.reAttr ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}`}>
                      <SelectValue placeholder="Select unit type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                      {/* {calculateUnit.length > 0 ? (
                        calculateUnit.map((item) => (
                          <SelectItem
                            key={item.id}
                            value={item.id.toString()}
                            className="cursor-pointer"
                          >
                            {item.reAttrName}
                          </SelectItem>
                        ))
                      ) : ( */}
                      <SelectItem value="101" className="cursor-pointer">
                        Occurance
                      </SelectItem>
                      {/* )} */}
                    </SelectContent>
                  </Select>

                  {errors.reAttr && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.reAttr.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Result Account Item Type <span className="text-red-500">*</span>
                </label>
                <AccountItemSearchSelect
                  value={watch("acctItemTypeId")}
                  onChange={(value) => {
                    setValue("acctItemTypeId", value!, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  placeholder="Search account item type..."
                  error={!!errors.acctItemTypeId}
                  className="w-full text-sm border border-gray-300 rounded-md"
                />
                {errors.acctItemTypeId && (
                  <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.acctItemTypeId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Remarks</label>
              <textarea className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors resize-none" rows={3} {...register("comments")} placeholder="Enter Remarks" />
            </div>

            
          </form>
        </DialogBody>

        <DialogFooter className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => handlePriceVersionDialog(false, showPriceVersionDialog.mode, showPriceVersionDialog.type, null)} className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </Button>
          <Button form="add-price-version-form" variant="default" type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2">
            {isSubmitting ? (
              <>
                <RefreshCw className="animate-spin h-4 w-4" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPriceVersionDialog;
