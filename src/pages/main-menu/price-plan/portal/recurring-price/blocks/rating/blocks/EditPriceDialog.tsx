import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { useRecurringPriceContext } from "../../../hooks";
import useRecurrringRatingContext from "../hooks/useRecurringRatingContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ExpressionPrice from "./sub-block/ExpressionPrice";
import SkeletonPrice from "./SkeletonPrice";
import { z } from "zod";
import {
  defaultExpressionPrice,
  recurringUpdateRatingSchema,
  updateRecurringSchema,
} from "../types/form";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ExpressionPriceComponent from "./sub-block/ExpressionPriceUpdate";
import { XMLParser } from "fast-xml-parser";
import PayIndicatorMultiSelect from "../../PayIndicatorMultiSelect";
import { AcctConfService } from "@/common/api/account-config/endpoints";
import { NumericFormat } from "react-number-format";
import { PriceType } from "./AddPriceDialog";
import { SearchSelect } from "@/components/common/SearchSelect";

const API_URL = apiConfig.service_price_plan;
// export type RecurringUpdateRatingFormType = z.infer<
//   typeof recurringUpdateRatingSchema
// >;
export type RecurringUpdateRatingFormType = z.infer<
  ReturnType<typeof updateRecurringSchema>
>;

const EditPriceDialog = () => {
  const {  selectedOfferVerId  } = usePortalData();
  const { GetData, PutData } = useCallApi();
  const {
    selectedRatePlan,
    selectedMapping,
    setSelectedMapping,
    fetchVersionsRatingForRatePlan,
  } = useRecurringPriceContext();
  const {
    selectedPriceVersion,
    showPriceDialog,
    handlePriceDialog,
    selectedPrice,
  } = useRecurrringRatingContext();

  const { GET_ACCT_ITEM_TYPE } = AcctConfService();

  const [priceType, setPriceType] = useState<PriceType>("base");
  const [scriptToChange, setScriptToChange] = useState<string>("");
  const recurringUpdateRatingSchema = useMemo(
    () => updateRecurringSchema(priceType),
    [priceType]
  );

  const methods = useForm<RecurringUpdateRatingFormType>({
    resolver: zodResolver(recurringUpdateRatingSchema),
    defaultValues: {
      priceName: "",
      payIndicator: "000",
      resultAccountItemType: undefined,
      remarks: "",
      roundMode: 0,
      price: "",
      calculateUnit: undefined,
      creditLimit: null,
      rpPriceUnit: undefined,
      newConnection: "",
      termination: "",
      normal: "",
      inAdvance: "",
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

  const [detailData, setDetailData] = useState<DetailRecurringRating | null>(
    null
  );

  const [accountTypes, setAccountTypes] = useState<
    { acctResId: number; acctResName: string }[]
  >([]);
  const [scriptTemplate, setScriptTemplate] = useState<
    { scriptTempletId: string; scriptTempletName: string }[]
  >([]);

  const [isEffDateDisabled, setIsEffDateDisabled] = useState(false);
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
    }
  };

  const GetScriptTemplate = async () => {
    try {
      const response = await GetData(`${API_URL}/script-templet/list`, {});
      setScriptTemplate(response?.data);
    } catch (error) {
      console.error("Error fetching script template data:", error);
    }
  };

  const defaultBaseForm = () => {
    setValue("price", null);
    setValue("roundMode", null);
    setValue("calculateUnit", 0);
    setValue("rpPriceUnit", null);
    setValue("newConnection", "");
    setValue("termination", "");
    setValue("normal", "");
    setValue("inAdvance", "");
  };

  const GetDataDetail = async () => {
    setIsLoading(true);
    try {
      const response = await GetData(
        `${API_URL}/price/recurring/detail/${selectedPrice}`,
        {}
      );

      if (response.status) {
        const detail: DetailRecurringRating = response.data;
        setDetailData(detail);

        const {
          priceName,
          effDate,
          expDate,
          valueString,
          acctItemTypeId,
          calculateUnit,
          comments,
          rpPriceUnit,
          creditLimit,
          payIndicator,
          scriptTempletId,
          ruleScript,
          ruleComments,
          scriptPage,
          newConnection,
          termination,
          normal,
          inAdvance,
          roundMode,
        } = detail;
        // console.log(detail)
        // --- ⬇️ Parse scriptPage into jsonScriptPage
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

        // --- ⬇️ Set value to form
        setValue("priceName", priceName);
        setValue("payIndicator", payIndicator);
        setValue("resultAccountItemType", acctItemTypeId);
        setValue("creditLimit", creditLimit!);
        setValue("calculateUnit", calculateUnit!);
        setValue("remarks", comments);
        setValue("roundMode", roundMode);
        setValue("price", valueString);
        setValue("rpPriceUnit", rpPriceUnit);
        setValue("newConnection", newConnection);
        setValue("termination", termination);
        setValue("normal", normal);
        setValue("inAdvance", inAdvance);

        // --- ⬇️ Set Expression Price
        setValue("expressionPrice.scriptTempletId", scriptTempletId);
        setValue("expressionPrice.ruleScript", ruleScript);
        setValue(
          "expressionPrice.jsonScriptPage",
          jsonScriptPage === "" ? null : jsonScriptPage
        );
        setValue("expressionPrice.advancedBenefitRemarks", ruleComments);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Something went wrong while fetching price detail");
    } finally {
      setIsLoading(false);
    }
  };

  const DoUpdatePrice = async (formField: RecurringUpdateRatingFormType) => {
    if (!formField.expressionPrice && priceType === "advanced") {
      toast.error("Please add expression price");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await PutData(
        `${API_URL}/price/recurring/update/${selectedPrice}`,
        formField
      );

      if (response?.status) {
        toast.success(response.message);
        handlePriceDialog(
          false,
          showPriceDialog.mode,
          showPriceDialog.type,
          null,
          null
        );
        await fetchVersionsRatingForRatePlan(
          selectedRatePlan || 0,
          selectedMapping
        );
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

  const onSubmit = async (data: RecurringUpdateRatingFormType) => {
    // console.log(data);
    const allNull = Object.values(data.expressionPrice ?? {}).every(
      (v) => v == null
    );
    const cleaned = {
      ...data,
      expressionPrice: allNull ? null : data.expressionPrice,
    };

    await DoUpdatePrice(cleaned);
  };

  useEffect(() => {
    GetScriptTemplate();
  }, []);

  useEffect(() => {
    if (selectedPrice) {
      GetDataDetail();
    }
  }, [selectedPrice]);

  useEffect(() => {
    if (!showPriceDialog.show) {
      ResetForm();
    } else {
      // setFormField((prev) => ({
      //   ...prev,
      //   priceVerId: selectedPriceVersion?.priceVerId ?? 0,
      //   offerVerId: dataPricePlanDetail?.offerVerList[0].offerVerId ?? 0,
      //   ratePlanId: selectedRatePlan ?? 0,
      // }));
    }
  }, [showPriceDialog.show, selectedRatePlan, selectedPriceVersion]);

  useEffect(() => {
    const rpUnit = watch("rpPriceUnit");
    if (rpUnit === null) {
      setPriceType("advanced");
      setActiveTab("advanced");
    }
  }, [watch("rpPriceUnit")]);

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
    <Dialog
      open={showPriceDialog.show}
      onOpenChange={(open) =>
        handlePriceDialog(
          open,
          showPriceDialog.mode,
          showPriceDialog.type,
          null,
          null
        )
      }
    >
      <DialogContent className="max-w-[1300px] h-full overflow-y-auto p-5">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Price Version Rating - Update
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
          <div className="overflow-y-auto px-5 pt-4 pb-2 flex-1 min-h-[570px]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Effective Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Effective Date
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    className={
                      "w-full border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    }
                    type="date"
                    value={detailData?.effDate}
                    placeholder="Select effective date"
                    disabled={true}
                    min={expiryDate ? expiryDate : undefined}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Expiry Date
                  </label>
                  <Input
                    className={
                      "w-full border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    }
                    type="date"
                    value={detailData?.expDate || ""}
                    placeholder="Select expiry date"
                    disabled={true}
                    min={detailData?.effDate || undefined}
                  />
                </div>

                {/* Price Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Price Name
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    className={`w-full transition-colors ${
                      errors.priceName
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    type="text"
                    {...register("priceName", {
                      required: "Price name is required",
                    })}
                    placeholder="Enter price name"
                  />
                  {errors.priceName && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.priceName.message}
                    </p>
                  )}
                </div>

                {/* Account Item Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Result Account Item Type{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="resultAccountItemType"
                    render={({ field }) => (
                      <>
                        <Select
                          value={field.value?.toString() ?? ""}
                          onValueChange={(val) => field.onChange(Number(val))}
                        >
                          <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-colors">
                            <SelectValue placeholder="Select account item type" />
                          </SelectTrigger>
                          <SearchSelect
                            onSearch={(query: string) =>
                              GetAccountItemType(query)
                            }
                            onSelect={(value) =>
                              field.onChange(value ? Number(value) : null)
                            }
                            selectedValue={field.value?.toString()}
                          >
                            {accountTypes.map((item) => (
                              <SelectItem
                                key={item.acctResId}
                                value={item.acctResId.toString()}
                              >
                                {item.acctResName}
                              </SelectItem>
                            ))}
                          </SearchSelect>
                        </Select>

                        {errors.resultAccountItemType && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.resultAccountItemType.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* Two Column Layout for Price and Calculate Unit */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Credit Limit
                  </label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Pay Indicator
                    </label>
                    <PayIndicatorMultiSelect
                      value={watch("payIndicator") ?? "000"}
                      onChange={(value) => setValue("payIndicator", value)}
                      placeholder="Select pay indicators..."
                    />
                    {errors.payIndicator && (
                      <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
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
                      <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-colors">
                        <SelectValue placeholder="Select account item type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                        <SelectItem value="advanced" className="cursor-pointer">
                          Advanced
                        </SelectItem>
                        <SelectItem value="base" className="cursor-pointer">
                          Base
                        </SelectItem>
                        <SelectItem
                          value="priceMapping"
                          className="cursor-pointer"
                        >
                          Price Mapping
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Remarks
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors resize-none"
                  rows={3}
                  {...register("remarks")}
                  placeholder="Enter remarks"
                />
              </div>

              {/* Base Price Type Section - Add this after the remarks section */}
              {priceType === "base" && (
                <div className="space-y-6 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Base Price Configuration
                  </h3>

                  {/* Round Mode, Price, Calculate Unit */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Round Mode
                        <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        control={control}
                        name="roundMode"
                        render={({ field }) => (
                          <>
                            <Select
                              value={String(watch("roundMode") ?? "")}
                              onValueChange={(value) => {
                                setValue("roundMode", Number(value));
                              }}
                            >
                              <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-colors">
                                <SelectValue placeholder="--Please Select--" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                                <SelectItem
                                  value="1"
                                  className="cursor-pointer"
                                >
                                  Rounding
                                </SelectItem>
                                <SelectItem
                                  value="2"
                                  className="cursor-pointer"
                                >
                                  Floor
                                </SelectItem>
                                <SelectItem
                                  value="3"
                                  className="cursor-pointer"
                                >
                                  Ceil
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.roundMode && (
                              <p className="text-xs text-red-500">
                                {errors.roundMode.message}
                              </p>
                            )}
                          </>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
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
                            onValueChange={(values) =>
                              field.onChange(values.floatValue ?? null)
                            }
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
                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {errors.price.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Calculate Unit
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        className="w-full transition-colors border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                        type="number"
                        min="0"
                        value={watch("calculateUnit") || ""}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? 0
                              : parseInt(e.target.value);
                          setValue("calculateUnit", isNaN(value) ? 0 : value);
                        }}
                        placeholder="Enter calculation unit"
                      />
                      {errors.calculateUnit && (
                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {errors.calculateUnit.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Select Cycle/Day {"(calculate unit)"}
                        <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={watch("rpPriceUnit") ?? ""}
                        onValueChange={(value) => {
                          setValue("rpPriceUnit", value);
                        }}
                      >
                        <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-colors">
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
                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {errors.rpPriceUnit.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Billing Scenarios */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-800">
                      Billing Scenarios
                    </h4>

                    {/* New Connection */}
                    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          New Connection
                        </label>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        If customers purchase this product in the middle of this
                        cycle, how do you handle the amount charged?
                      </p>
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
                          <label
                            htmlFor="new_connection_no_charge"
                            className="text-sm text-gray-700"
                          >
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
                          <label
                            htmlFor="new_connection_actual_days"
                            className="text-sm text-gray-700"
                          >
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
                          <label
                            htmlFor="new_connection_full_cycle"
                            className="text-sm text-gray-700"
                          >
                            Charge for the entire billing cycle
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Termination */}
                    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Termination
                        </label>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        If customers cancel this product in the middle of this
                        cycle, how do you handle the amount charged?
                      </p>
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
                          <label
                            htmlFor="termination_no_charge"
                            className="text-sm text-gray-700"
                          >
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
                          <label
                            htmlFor="termination_actual_days"
                            className="text-sm text-gray-700"
                          >
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
                          <label
                            htmlFor="termination_full_cycle"
                            className="text-sm text-gray-700"
                          >
                            Charge for the entire billing cycle
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Normal */}
                    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Normal
                        </label>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        If customers purchase and cancel this product in the
                        middle of this cycle, how do you handle the amount
                        charged?
                      </p>
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
                          <label
                            htmlFor="normal_no_charge"
                            className="text-sm text-gray-700"
                          >
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
                          <label
                            htmlFor="normal_actual_days"
                            className="text-sm text-gray-700"
                          >
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
                          <label
                            htmlFor="normal_full_cycle"
                            className="text-sm text-gray-700"
                          >
                            Charge for the entire billing cycle
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* In Advance */}
                    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          In Advance
                        </label>
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
                          <label
                            htmlFor="in_advance_yes"
                            className="text-sm text-gray-700"
                          >
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
                          <label
                            htmlFor="in_advance_no"
                            className="text-sm text-gray-700"
                          >
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
                          className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === "advanced"
                              ? "border-blue-600 text-blue-600"
                              : "border-transparent text-gray-600 hover:text-blue-600"
                          }`}
                        >
                          Advanced
                        </button>
                      )}

                      {priceType === "priceMapping" && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("priceMapping")}
                          className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === "priceMapping"
                              ? "border-blue-600 text-blue-600"
                              : "border-transparent text-gray-600 hover:text-blue-600"
                          }`}
                        >
                          Price Mapping
                        </button>
                      )}
                    </div>

                    <div className="mt-4">
                      {priceType === "advanced" && activeTab === "advanced" && (
                        <div className="rounded-lg p-4 min-h-[400px]">
                          <ExpressionPriceComponent
                            scriptToChange={scriptToChange}
                          />
                        </div>
                      )}

                      {priceType === "priceMapping" &&
                        activeTab === "priceMapping" && (
                          <div className="border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-500">
                              Coming Soon for Price Mapping
                            </p>
                          </div>
                        )}
                    </div>
                  </FormProvider>
                </div>
              ) : null}
            </form>
          </div>
        )}

        {/* Action Buttons */}
        <DialogFooter className="pt-4 mt-5 flex justify-end gap-5">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              handlePriceDialog(
                false,
                showPriceDialog.mode,
                showPriceDialog.type,
                null,
                null
              )
            }
            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
          >
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
