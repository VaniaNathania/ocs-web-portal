import { apiConfig } from "@/config/api.config";
import { useSubscriptionPriceCreateContext } from "../../../hooks";
import { useCallApi } from "@/hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { z } from "zod";
import { subscriptionUpdatePriceRatingSchema } from "../types/form";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AccountItemSearchSelect from "../../SelectSearchAccountItemType";
import { AcctConfService } from "@/common/api/account-config/endpoints";
import { PricePlanService } from "@/common/api/price-plan/endpoints";
import { NumericFormat } from "react-number-format";

const API_URL = apiConfig.service_price_plan;

// Helper function untuk inject values ke script template

export type SubscriptionUpdatePriceRatingForm = z.infer<typeof subscriptionUpdatePriceRatingSchema>;

interface ExpressionPrice {
  scriptTempletId?: number | null;
  ruleComment?: string | null;
  ruleScript?: string | null;
  jsonScriptPage?: string | null;
}

const EditPriceDialog = () => {
  const { setSelectedMapping, showEditPriceDialog, handleEditPriceDialog, selectedPriceVer, selectedPrice, selectedRatePlan, selectedMapping, selectedEvent, priceVersionDate, fetchVersionsRatingForRatePlan, formatedValue } = useSubscriptionPriceCreateContext();
  const { dataPricePlan, dataPricePlanDetail } = usePortalData();

  const { GetData, PutData } = useCallApi();
  const { GET_REATTR } = PricePlanService();
  const { GET_ACCT_ITEM_TYPE } = AcctConfService();

  const methods = useForm<SubscriptionUpdatePriceRatingForm>({
    resolver: zodResolver(subscriptionUpdatePriceRatingSchema),
    mode: "onChange",
    defaultValues: {
      effDate: "",
      expDate: "",
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
    formState: { errors },
    control,
  } = methods;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEffDateDisabled, setIsEffDateDisabled] = useState(false);
  const [isExpDateDisabled, setIsExpDateDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [accountTypes, setAccountTypes] = useState<{ id: number; acctItemTypeName: string }[]>([]);
  const [calculateUnit, setCalculateUnit] = useState<{ id: number; reAttrName: string }[]>([]);

  const [detailPrice, setDetailPrice] = useState<any | null>(null);

  const effectiveDate = (selectedPriceVer as any)?.effDate;
  const expiryDate = (selectedPriceVer as any)?.expDate;

  const resetForm = () => {
    reset();
    setDetailPrice(null);
  };

  const getCalculateUnit = async () => {
    try {
      const response = await GET_REATTR();

      setCalculateUnit(response?.data);
    } catch (error) {
      console.error("Error fetching calculate unit data:", error);
    }
  };

  const getAccountItemType = async () => {
    try {
      const response = await GET_ACCT_ITEM_TYPE({
        page: 1,
        size: 50,
        sortBy: "BAL_TYPE",
        sortDirection: "ASC",
        spId: 0,
      });

      setAccountTypes(response?.data);
    } catch (error) {
      console.error("Error fetching account type data:", error);
    }
  };

  // Robust expression price processing logic dari file 1

  // Updated fetchDefaultValue dengan robust logic
  const fetchDefaultValue = useCallback(
    async (selectedPrice: number) => {
      setIsLoading(true);

      try {
        const minDelay = new Promise((resolve) => setTimeout(resolve, 300));

        // Fetch main price data
        const fetchMainData = GetData(
  `${API_URL}/price/detail/${selectedPrice}`,
  {},
);

const mainResponse = await fetchMainData;

await minDelay;

        // Handle main price data
        if (mainResponse.status) {
          const detail = mainResponse.data;
          setDetailPrice(detail);

          setValue("effDate", detail?.effDate);
          setValue("expDate", detail?.expDate);
          setValue("priceName", detail?.priceName);
          setValue("acctItemTypeId", detail?.acctItemTypeId);
          setValue("price", Number(detail?.value));
          setValue("payIndicator", detail?.payIndicator);
          setValue("rum", detail?.rum);
          setValue("reAttr", detail?.reAttr);
          setValue("comments", detail?.remarks);
        }

        // Process expression price data dengan robust logic
      } catch (error) {
        console.error("Error fetching price data:", error);
        toast.error("Something went wrong while fetching data");

        // Set default values untuk expression price pada error
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
    [setValue],
  );

  const doUpdatePrice = async (formField: SubscriptionUpdatePriceRatingForm, priceId: number) => {
    setIsSubmitting(true);
    try {
      const response = await PutData(`${API_URL}/price/update/${priceId}?reType=3`, formField);

      if (response?.status) {
        setSelectedMapping(null);
        await fetchVersionsRatingForRatePlan(selectedRatePlan || 0, selectedMapping);
        toast.success(response?.message);
        handleEditPriceDialog(false, null);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Error creating Rate Plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: SubscriptionUpdatePriceRatingForm) => {
    // Check apakah semua field expression price null
    const allNull = Object.values(data.expressionPrice ?? {}).every((v) => v == null || v === "");

    const cleaned = {
      ...data,
      expressionPrice: allNull ? null : data.expressionPrice,
    };

    doUpdatePrice(cleaned, selectedPrice ?? 0);
  };

  const isValidDate = (str: string) => {
    return !!str && str !== "-" && !isNaN(Date.parse(str));
  };

  useEffect(() => {
    getAccountItemType();
    getCalculateUnit();
  }, []);

  useEffect(() => {
    if (!showEditPriceDialog) {
      resetForm();
    }
  }, [showEditPriceDialog]);

  useEffect(() => {
    if (selectedPrice) {
      fetchDefaultValue(selectedPrice);
    }
  }, [selectedPrice, fetchDefaultValue]);

  return (
    <Dialog open={showEditPriceDialog} onOpenChange={(open) => handleEditPriceDialog(open, null)}>
      <DialogContent className="max-w-[1200px] p-0 gap-0 bg-white rounded-lg shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-gray-900">Edit Price</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

         <DialogBody className="flex-1 overflow-y-auto px-6 py-6">
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
            <form id="edit-price-version-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Effective Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Effective Date
                    <span className="text-red-500">*</span>
                  </label>
                  <Input className={"w-full border-gray-300 focus:border-blue-500 focus:ring-blue-200"} type="date" value={detailPrice?.effDate} placeholder="Select effective date" disabled min={expiryDate || undefined} />
                  {errors.effDate && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.effDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">Expiry Date</label>
                  <Input className={"w-full border-gray-300 focus:border-blue-500 focus:ring-blue-200"} type="date" value={detailPrice?.expDate || ""} placeholder="Select expiry date" disabled={true} min={detailPrice?.effDate || undefined} />
                  {errors.expDate && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.expDate.message}
                    </p>
                  )}
                </div>

                {/* Price Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Price Name
                    <span className="text-red-500">*</span>
                  </label>
                  <Input className={`w-full transition-colors ${errors.priceName ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"}`} type="text" {...register("priceName")} placeholder="Enter price name" />
                  {errors.priceName && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.priceName.message}
                    </p>
                  )}
                </div>

                {/* Two Column Layout for Price and Calculate Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price */}
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
                  <Input className="w-full mt-8 bg-gray-100 border border-dashed border-gray-400 text-gray-600 cursor-not-allowed" type="number" min="0" value={watch("acctItemTypeId") || ""} disabled />
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
                          if (!value) return null;
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

                {/* Account Item Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Result Account Item Type <span className="text-red-500">*</span>
                  </label>

                  <AccountItemSearchSelect
                    value={watch("acctItemTypeId")}
                    onChange={(value) =>
                      setValue("acctItemTypeId", value!, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
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

              {/* Comments */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Remarks</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors resize-none" rows={3} {...register("comments")} placeholder="Enter remarks" />
              </div>

            </form>
          )}
        </DialogBody>
          <DialogFooter className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
            <Button type="button" variant="outline" onClick={() => handleEditPriceDialog(false, null)} className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </Button>
            <Button form="edit-price-version-form" variant="default" type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2">
              {isSubmitting ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4" />
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
