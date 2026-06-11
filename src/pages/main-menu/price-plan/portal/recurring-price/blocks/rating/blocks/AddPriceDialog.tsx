import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { useRecurringPriceContext } from "../../../hooks";
import useRecurrringRatingContext from "../hooks/useRecurringRatingContext";
import { toast } from "sonner";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ExpressionPrice from "./sub-block/ExpressionPrice";
import { z } from "zod";
import { createRecurringSchema, defaultExpressionPrice, recurringCreateRatingSchema } from "../types/form";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PayIndicatorMultiSelect from "../../PayIndicatorMultiSelect";
import { AcctConfService } from "@/common/api/account-config/endpoints";
import { NumericFormat } from "react-number-format";
import { SearchSelect } from "@/components/common/SearchSelect";

const API_URL = apiConfig.service_price_plan;
export type RecurringCreateRatingFormType = z.infer<ReturnType<typeof createRecurringSchema>>;
export type PriceType = "base" | "advanced" | "priceMapping";

const AddPriceDialog = () => {
  const { selectedOfferVerId } = usePortalData();
  const { GetData, PostData } = useCallApi();
  const { selectedRatePlan, selectedMapping, setSelectedMapping, fetchVersionsRatingForRatePlan } = useRecurringPriceContext();

  const { selectedPriceVersion, showPriceDialog, handlePriceDialog } = useRecurrringRatingContext();

  const { GET_ACCT_ITEM_TYPE } = AcctConfService();

  const [priceType, setPriceType] = useState<PriceType>("base");

  const recurringRatingSchema = useMemo(() => createRecurringSchema(priceType), [priceType]);

  const methods = useForm<RecurringCreateRatingFormType>({
    resolver: zodResolver(recurringRatingSchema),
    defaultValues: {
      priceVerId: selectedPriceVersion?.priceVerId ?? 0,
      offerVerId: selectedOfferVerId ?? 0,
      ratePlanId: selectedRatePlan ?? 0,
      mappingId: selectedMapping,
      effDate: "",
      expDate: "",
      priceName: "",
      payIndicator: "000",
      resultAccountItemType: undefined,
      remarks: "",
      roundMode: undefined,
      price: "",
      calculateUnit: undefined,
      creditLimit: null,
      rpPriceUnit: "",
      newConnection: "A",
      termination: "A",
      normal: "A",
      inAdvance: "N",
      expressionPrice: {
        advancedBenefitRemarks: null,
        jsonScriptPage: null,
        ruleScript: null,
        scriptTempletId: null,
      },
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = methods;

  const [accountTypes, setAccountTypes] = useState<{ acctResId: number; acctResName: string }[]>([]);
  const [scriptTemplate, setScriptTemplate] = useState<{ scriptTempletId: string; scriptTempletName: string }[]>([]);

  const [isEffDateDisabled, setIsEffDateDisabled] = useState(false);
  const [isExpDateDisabled, setIsExpDateDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<PriceType>(priceType);

  const effectiveDate = (selectedPriceVersion as any)?.effDate;
  const expiryDate = (selectedPriceVersion as any)?.expDate;

  const ResetForm = useCallback(() => {
    reset();
  }, [reset]);

  const GetAccountItemType = async (filter: string) => {
    try {
      setIsLoading(true);
      const response = await GET_ACCT_ITEM_TYPE({
        page: 1,
        size: 250,
        sortBy: "BAL_TYPE",
        sortDirection: "ASC",
        acctItemTypeName: filter,
        spId: 0,
      });

      setAccountTypes(response?.data);
    } catch (error) {
      console.error("Error fetching account type data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultBaseForm = () => {
    setValue("price", null);
    setValue("roundMode", null);
    setValue("calculateUnit", 0);
    setValue("rpPriceUnit", "");
    setValue("newConnection", "A");
    setValue("termination", "A");
    setValue("normal", "A");
    setValue("inAdvance", "N");
  };

  const doCreatePrice = async (formField: RecurringCreateRatingFormType) => {
    if (!formField.expressionPrice && priceType === "advanced") {
      toast.error("Please add expression price");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await PostData(`${API_URL}/price/recurring/create`, formField);

      if (response?.status) {
        toast.success(response.message);
        handlePriceDialog(false, showPriceDialog.mode, showPriceDialog.type, null, null);
        await fetchVersionsRatingForRatePlan(selectedRatePlan || 0, selectedMapping);
        setSelectedMapping(null);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: RecurringCreateRatingFormType) => {
    const allNull = Object.values(data.expressionPrice ?? {}).every((v) => v == null);
    const cleaned = {
      ...data,
      expressionPrice: allNull ? null : data.expressionPrice,
    };
    await doCreatePrice(cleaned);
  };

  useEffect(() => {
    if (!showPriceDialog.show) {
      ResetForm();
    } else {
      setValue("priceVerId", selectedPriceVersion?.priceVerId ?? 0);
      setValue("offerVerId", selectedOfferVerId ?? 0);
      setValue("ratePlanId", selectedRatePlan ?? 0);
      setValue("mappingId", selectedMapping);
    }
  }, [showPriceDialog.show, selectedOfferVerId, selectedRatePlan, selectedPriceVersion, selectedMapping]);

  useEffect(() => {
    if (showPriceDialog.show && showPriceDialog.mode === "create" && selectedPriceVersion?.expDate) {
      setValue("effDate", selectedPriceVersion.expDate ?? "");
      setIsEffDateDisabled(true);
    } else if (showPriceDialog.show && showPriceDialog.mode === "create") {
      setIsEffDateDisabled(false);
    }
  }, [showPriceDialog.show, showPriceDialog.mode, selectedPriceVersion]);

  useEffect(() => {
    if (showPriceDialog.show && selectedPriceVersion && showPriceDialog.type) {
      if (showPriceDialog.type === "version") {
        setValue("effDate", selectedPriceVersion.expDate || "");
        setIsEffDateDisabled(true);
      } else if (showPriceDialog.type === "price") {
        setValue("effDate", selectedPriceVersion.effDate || "");
        setValue("expDate", selectedPriceVersion.expDate || "");

        if (selectedPriceVersion.effDate) {
          setIsEffDateDisabled(true);
        }
        if (selectedPriceVersion.expDate) {
          setIsExpDateDisabled(true);
        }
      }
    }
  }, [showPriceDialog, selectedPriceVersion]);

  useEffect(() => {
    if (priceType === "base") {
      setValue("expressionPrice", null);
    }

    if (priceType === "advanced") {
      setValue("expressionPrice", defaultExpressionPrice);
      defaultBaseForm();
    }

    if (priceType === "priceMapping") {
      setValue("expressionPrice", null);
      defaultBaseForm();
    }
  }, [priceType]);

  return (
    <Dialog open={showPriceDialog.show} onOpenChange={(open) => handlePriceDialog(open, showPriceDialog.mode, showPriceDialog.type, null, null)}>
      <DialogContent className="max-w-[1300px] max-h-[95vh] overflow-y-auto p-5 flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">Price Version Rating - Create</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-5 pt-4 pb-2 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Effective Date */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                  Effective Date
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  id="effDate"
                  {...register("effDate")}
                  className={`w-full transition-colors ${errors.effDate ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
                  disabled={isEffDateDisabled}
                  min={expiryDate ? expiryDate : undefined}
                  onChange={(e) => {
                    setValue("effDate", e.target.value);
                    const currentExpiry = watch("expDate");
                    if (currentExpiry && new Date(currentExpiry) < new Date(e.target.value)) {
                      setValue("expDate", null);
                    }
                  }}
                />
                {errors.effDate && (
                  <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.effDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700">Expiry Date</label>
                <Input
                  type="date"
                  {...register("expDate")}
                  className={`w-full transition-colors ${errors.expDate ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
                  disabled={isExpDateDisabled}
                  min={watch("effDate") || undefined}
                />
                {errors.expDate && (
                  <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.expDate.message}
                  </p>
                )}
              </div>

              {/* Price Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                  Price Name
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  className={`w-full transition-colors ${errors.priceName ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
                  type="text"
                  {...register("priceName", {
                    required: "Price Name is required",
                  })}
                  placeholder="Enter price name"
                />
                {errors.priceName && (
                  <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.priceName.message}
                  </p>
                )}
              </div>

              {/* Account Item Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Result Account Item Type <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="resultAccountItemType"
                  render={({ field }) => (
                    <>
                      <Select value={field.value?.toString() ?? ""} onValueChange={(val) => field.onChange(Number(val))}>
                        <SelectTrigger className="w-full transition-colors border-gray-200 focus:border-blue-500 focus:ring-blue-200">
                          <SelectValue placeholder="Select account item type" />
                        </SelectTrigger>
                        <SearchSelect onSearch={(query: string) => GetAccountItemType(query)} onSelect={(value) => field.onChange(value ? Number(value) : null)} selectedValue={field.value?.toString()}>
                          {accountTypes.map((item) => (
                            <SelectItem key={item.acctResId} value={item.acctResId.toString()}>
                              {item.acctResName}
                            </SelectItem>
                          ))}
                        </SearchSelect>
                      </Select>

                      {errors.resultAccountItemType && <p className="mt-1 text-xs text-red-500">{errors.resultAccountItemType.message}</p>}
                    </>
                  )}
                />
              </div>

              {/* Two Column Layout for Price and Calculate Unit */}
              <div className="space-y-2">
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700">Credit Limit</label>
                <Controller
                  name="creditLimit"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      {...field}
                      value={field.value ?? ""}
                      onValueChange={(values) => {
                        field.onChange(values.floatValue ?? null);
                      }}
                      onChange={() => {}}
                      thousandSeparator=","
                      decimalSeparator="."
                      prefix="$ "
                      decimalScale={2}
                      allowNegative={false}
                      placeholder="Enter Credit Limit"
                      className="w-full input transition-colors border-gray-20 focus:border-blue-500 focus:ring-blue-200"
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Pay Indicator</label>
                  <PayIndicatorMultiSelect value={watch("payIndicator") ?? "000"} onChange={(value) => setValue("payIndicator", value)} placeholder="Select pay indicators..." />
                  {errors.payIndicator && (
                    <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.payIndicator.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Price Type
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={priceType || ""}
                    onValueChange={(value) => {
                      const typed = value as PriceType;
                      setPriceType(typed);
                      setActiveTab(typed);
                    }}
                  >
                    <SelectTrigger className="w-full transition-colors border-gray-200 focus:border-blue-500 focus:ring-blue-200">
                      <SelectValue placeholder="Select account item type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                      <SelectItem value="advanced" className="cursor-pointer">
                        Advanced
                      </SelectItem>
                      <SelectItem value="base" className="cursor-pointer">
                        Base
                      </SelectItem>
                      <SelectItem value="priceMapping" className="cursor-pointer">
                        Price Mapping
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Remarks</label>
              <textarea
                className="w-full px-3 py-2 transition-colors border border-gray-200 rounded-md resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                rows={3}
                {...register("remarks")}
                placeholder="Enter remarks"
              />
            </div>

            {/* Base Price Type Section - Add this after the remarks section */}
            {priceType === "base" && (
              <div className="pt-6 space-y-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Base Price Configuration</h3>

                {/* Round Mode, Price, Calculate Unit */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      Round Mode <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={String(watch("roundMode") || "")}
                      onValueChange={(value) => {
                        setValue("roundMode", Number(value));
                      }}
                    >
                      <SelectTrigger className="w-full transition-colors border-gray-200 focus:border-blue-500 focus:ring-blue-200">
                        <SelectValue placeholder="--Please Select--" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                        <SelectItem value="1" className="cursor-pointer">
                          Rounding
                        </SelectItem>
                        <SelectItem value="2" className="cursor-pointer">
                          Floor
                        </SelectItem>
                        <SelectItem value="3" className="cursor-pointer">
                          Ceil
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.roundMode && (
                      <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.roundMode.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      Price
                      <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          {...field}
                          value={field.value ?? ""}
                          onValueChange={(values) => field.onChange(values.floatValue ?? "")}
                          thousandSeparator=","
                          decimalSeparator="."
                          decimalScale={2}
                          fixedDecimalScale={false}
                          allowNegative={false}
                          placeholder="Enter Price"
                          className="w-full input transition-colors border-gray-20 focus:border-blue-500 focus:ring-blue-200"
                        />
                      )}
                    />
                    {errors.price && (
                      <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      Calculate Unit <span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="w-full transition-colors border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      type="number"
                      min="0"
                      value={watch("calculateUnit") || ""}
                      onChange={(e) => {
                        const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                        setValue("calculateUnit", isNaN(value) ? 0 : value);
                      }}
                      placeholder="Enter calculation unit"
                    />
                    {errors.calculateUnit && (
                      <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.calculateUnit.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      Select Cycle/Day {"(calculate unit)"}
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={watch("rpPriceUnit") ?? ""}
                      onValueChange={(value) => {
                        setValue("rpPriceUnit", value ?? "");
                      }}
                    >
                      <SelectTrigger className="w-full transition-colors border-gray-200 focus:border-blue-500 focus:ring-blue-200">
                        <SelectValue placeholder="--Please Select--" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                        <SelectItem value="C" className="cursor-pointer">
                          Cycle
                        </SelectItem>
                        <SelectItem value="D" className="cursor-pointer">
                          Day
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.rpPriceUnit && (
                      <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.rpPriceUnit.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Billing Scenarios */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800 text-md">Billing Scenarios</h4>

                  {/* New Connection */}
                  <div className="p-4 space-y-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">New Connection</label>
                    </div>
                    <p className="mb-3 text-sm text-gray-600">If customers purchase this product in the middle of this cycle, how do you handle the amount charged?</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="new_connection_no_charge"
                          name="newConnectionBilling"
                          value="N"
                          checked={watch("newConnection") === "N"}
                          onChange={(e) => {
                            setValue("newConnection", e.target.value);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="new_connection_no_charge" className="text-sm text-gray-700">
                          Do not charge for this cycle
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="new_connection_actual_days"
                          name="newConnectionBilling"
                          value="A"
                          checked={watch("newConnection") === "A"}
                          onChange={(e) => {
                            setValue("newConnection", e.target.value);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="new_connection_actual_days" className="text-sm text-gray-700">
                          Calculate by actual usage days
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="new_connection_full_cycle"
                          name="newConnectionBilling"
                          value="E"
                          checked={watch("newConnection") === "E"}
                          onChange={(e) => {
                            setValue("newConnection", e.target.value);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="new_connection_full_cycle" className="text-sm text-gray-700">
                          Charge for the entire billing cycle
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Termination */}
                  <div className="p-4 space-y-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Termination</label>
                    </div>
                    <p className="mb-3 text-sm text-gray-600">If customers cancel this product in the middle of this cycle, how do you handle the amount charged?</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="termination_no_charge"
                          name="terminationBilling"
                          value="N"
                          checked={watch("termination") === "N"}
                          onChange={(e) => {
                            setValue("termination", e.target.value);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="termination_no_charge" className="text-sm text-gray-700">
                          Do not charge for this cycle
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="termination_actual_days"
                          name="terminationBilling"
                          value="A"
                          checked={watch("termination") === "A"}
                          onChange={(e) => {
                            setValue("termination", e.target.value);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="termination_actual_days" className="text-sm text-gray-700">
                          Calculate by actual usage days
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="termination_full_cycle"
                          name="terminationBilling"
                          value="E"
                          checked={watch("termination") === "E"}
                          onChange={(e) => {
                            setValue("termination", e.target.value);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="termination_full_cycle" className="text-sm text-gray-700">
                          Charge for the entire billing cycle
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Normal */}
                  <div className="p-4 space-y-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Normal</label>
                    </div>
                    <p className="mb-3 text-sm text-gray-600">If customers purchase and cancel this product in the middle of this cycle, how do you handle the amount charged?</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="normal_no_charge"
                          name="normalBilling"
                          value="N"
                          checked={watch("normal") === "N"}
                          onChange={(e) => {
                            setValue("normal", e.target.value);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="normal_no_charge" className="text-sm text-gray-700">
                          Do not charge for this cycle
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="normal_actual_days"
                          name="normalBilling"
                          value="A"
                          checked={watch("normal") === "A"}
                          onChange={(e) => {
                            setValue("normal", e.target.value);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="normal_actual_days" className="text-sm text-gray-700">
                          Calculate by actual usage days
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="normal_full_cycle"
                          name="normalBilling"
                          value="E"
                          checked={watch("normal") === "E"}
                          onChange={(e) => {
                            setValue("normal", e.target.value);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="normal_full_cycle" className="text-sm text-gray-700">
                          Charge for the entire billing cycle
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* In Advance */}
                  <div className="p-4 space-y-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">In Advance</label>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="in_advance_yes"
                          name="inAdvance"
                          value="Y"
                          checked={watch("inAdvance") === "Y"}
                          onChange={(e) => {
                            setValue("inAdvance", e.target.value);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="in_advance_yes" className="text-sm text-gray-700">
                          Yes
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="in_advance_no"
                          name="inAdvance"
                          value="N"
                          checked={watch("inAdvance") === "N"}
                          onChange={(e) => {
                            setValue("inAdvance", e.target.value);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="in_advance_no" className="text-sm text-gray-700">
                          No
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {priceType === "advanced" || priceType === "priceMapping" ? (
              <div className="w-full mt-10">
                <FormProvider {...methods}>
                  <div className="grid grid-cols-3 border-b">
                    {priceType === "advanced" && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("advanced")}
                        className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "advanced" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-blue-600"}`}
                      >
                        Expression Price
                      </button>
                    )}

                    {priceType === "priceMapping" && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("priceMapping")}
                        className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "priceMapping" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-blue-600"}`}
                      >
                        Price Mapping
                      </button>
                    )}
                  </div>

                  <div className="mt-4">
                    {priceType === "advanced" && activeTab === "advanced" && (
                      <div className="rounded-lg p-4 h-[400px]">
                        <ExpressionPrice />
                      </div>
                    )}

                    {priceType === "priceMapping" && activeTab === "priceMapping" && (
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <p className="text-gray-500">Coming Soon for Price Mapping</p>
                      </div>
                    )}
                  </div>
                </FormProvider>
              </div>
            ) : null}
          </form>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="flex justify-end gap-5 pt-4 mt-5">
          <Button type="button" variant="outline" onClick={() => handlePriceDialog(false, showPriceDialog.mode, showPriceDialog.type, null, null)} className="px-6 py-2 text-gray-700 transition-colors border-gray-300 hover:bg-gray-50">
            Cancel
          </Button>
          <Button variant="default" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 text-white transition-colors bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
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

export default AddPriceDialog;
