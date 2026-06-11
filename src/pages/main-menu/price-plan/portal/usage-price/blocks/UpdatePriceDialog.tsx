import React, { useCallback, useEffect, useState } from "react";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useUsagePriceCreateContext } from "../hooks";
import TimeSpanComponent from "./Rating.tsx/TimeSpanComponent";
import { XMLParser } from "fast-xml-parser";
import AccountItemSearchSelect from "../../subscription-price/blocks/SelectSearchAccountItemType";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@mui/material";
import { NumericFormat } from "react-number-format";
import RankUpComponent from "./Rating.tsx/update/RankUpComponent";
import AccumulationPriceComponent from "./Rating.tsx/update/AccumulationPrice";
import AccumulationCalculationComponent from "./Rating.tsx/update/AccumulationCalculation";
import ExpressionPriceComponent from "./Rating.tsx/update/ExpressionPrice";

interface EditPriceDialogProps {
  showEditDialog: boolean;
  priceId: string | null;
  priceVerId: number | null;
  handleEditDialog: (show: boolean, id: string | null) => void;
  onUpdateSuccess?: () => void;
  versionType: string | null;
}

interface TimeSpanUp {
  timeSpanId: number;
  calculationUnit: number;
  calculationMethod: string;
  price?: string;
  timeSpanName?: string;
  priority?: number;
}

interface AccumulationPrice {
  timeSpanUpId: number | null;
  calculateUnit: number;
  adjustMethod: string;
  acctItemTypeId: number | null;
  price: string;
  rangeEffVal: number;
  rangeExpVal: number;
}

interface AccumulationCalculation {
  acctItemTypeId: number;
  calculateUnit: number;
  timeSpanUpId: number;
}

interface RankUp {
  timeSpanUpId: number | null;
  calculationUnit: number;
  adjustMethod: string;
  price: string;
  rangeEffVal: number | null;
  rangeExpVal: number | null;
}

interface ExpressionPrice {
  scriptTempletId: number | null;
  jsonScriptPage: string | null;
  ruleScript: string;
  ruleComment: string;
}

interface PriceVersionFormData {
  priceName: string;
  acctItemTypeId: number | null;
  price: string;
  payIndicator: boolean | null;
  rum: number;
  reAttr: number | null;
  comments: string;
  timeSpanUp: TimeSpanUp[] | null;
  rankUp: RankUp[] | null;
  reType: string;
  accumulationPrice: AccumulationPrice[] | null;
  accumulationCalculation: AccumulationCalculation[] | null;
  expressionPrice: ExpressionPrice | null;
  offerVerId?: number | null;
  ratePlanId?: string | null;
}

const API_URL = apiConfig.service_price_plan;

const EditPriceDialog: React.FC<EditPriceDialogProps> = ({
  showEditDialog,
  priceId,
  priceVerId,
  handleEditDialog,
  onUpdateSuccess,
  versionType,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [effDate, setEffDate] = useState("");
  const [expDate, setExpDate] = useState("");
  const { PostData, GetData, PutData } = useCallApi();
  const {
    selectedRatePlan,
    reAttr,
    getPriceVersion,
    selectedMapping,
    formatedValue,
  } = useUsagePriceCreateContext();

  // ADDED: scriptToChange state seperti di Document 2
  const [scriptToChange, setScriptToChange] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // States untuk tracking editing di setiap tab
  const [isEditingTimeSpan, setIsEditingTimeSpan] = useState(false);
  const [isEditingRankUp, setIsEditingRankUp] = useState(false);
  const [isEditingAccumulationPrice, setIsEditingAccumulationPrice] =
    useState(false);
  const [isEditingAccumulationCalc, setIsEditingAccumulationCalc] =
    useState(false);

  const isAnyTabEditing =
    isEditingTimeSpan ||
    isEditingRankUp ||
    isEditingAccumulationPrice ||
    isEditingAccumulationCalc;

  const [formField, setFormField] = useState<PriceVersionFormData>({
    priceName: "",
    acctItemTypeId: null,
    price: "",
    payIndicator: null,
    rum: 0,
    reAttr: null,
    comments: "",
    timeSpanUp: null,
    rankUp: null,
    accumulationPrice: null,
    accumulationCalculation: null,
    expressionPrice: null,
    reType: "1",
  });

  const fetchAllPriceData = useCallback(
    async (priceId: string) => {
      try {
        // Execute all API calls in parallel
        const [
          detailRes,
          rankUpRes,
          timeSpanListRes,
          timeSpanDetailRes,
          accumulationCalculationRes,
          accumulationPriceRes,
          expressionPriceRes,
        ] = await Promise.all([
          GetData(`${API_URL}/price/detail/${priceId}`, {}),
          GetData(`${API_URL}/rankprice/rank-up/${priceId}`, {}),
          GetData(`${API_URL}/rankprice/TimeSpanName/list`, {}),
          GetData(`${API_URL}/rankprice/time-span/${priceId}`, {}),
          GetData(`${API_URL}/rankprice/acm-calc/${priceId}`, {}),
          GetData(`${API_URL}/rankprice/acm-up/${priceId}`, {}),
          GetData(`${API_URL}/rankprice/expression-price/${priceId}`, {}),
        ]);

        const priceDetail = detailRes?.data;

        // Process rank up data dengan priority
        const rankUpData =
          rankUpRes?.data?.map((item: any) => ({
            timeSpanUpId: item.timeSpanUpPriority,
            calculationUnit: item.calculateUnit,
            adjustMethod: item.adjustMethod,
            price: item.price,
            rangeEffVal: item.effValue,
            rangeExpVal: item.expValue,
            isConfirmed: true,
          })) || null;

        // Process time span data
        let timeSpanData = null;
        const timeSpanList = timeSpanListRes?.data || [];
        const timeSpanDetail = timeSpanDetailRes?.data;

        if (Array.isArray(timeSpanDetail)) {
          timeSpanData = timeSpanDetail.map((item: any) => {
            const matched = timeSpanList.find(
              (ts: any) => ts.timeSpanName === item.timeSpanUpName,
            );

            return {
              timeSpanId: matched ? matched.id : 0,
              calculationMethod: item.calculationMethod,
              price: item.price.toString(),
              calculationUnit: item.calculateUnit,
              priority: item.priority,
              timeSpanName: item.timeSpanUpName,
              isConfirmed: true,
            };
          });
        }

        // Process accumulation calculation data dengan priority
        const accumulationCalculationData =
          accumulationCalculationRes?.data?.map((item: any) => ({
            acctItemTypeId: item.acctItemTypeId,
            calculateUnit: item.calculateUnit,
            timeSpanUpId: item.timeSpanUpPriority,
            isConfirmed: true,
          })) || null;

        // Process accumulation price data dengan priority
        const accumulationPriceData =
          accumulationPriceRes?.data?.map((item: any) => ({
            timeSpanUpId: item.timeSpanUpPriority,
            calculateUnit: item.calculateUnit,
            adjustMethod: item.adjustMethod,
            acctItemTypeId: item.acctItemTypeId,
            price: item.price,
            rangeEffVal: item.effValue,
            rangeExpVal: item.expValue,
            isConfirmed: true,
          })) || null;

        // UPDATED: Process expression price data - SAMA SEPERTI DOCUMENT 2
        let exprData: ExpressionPrice | null = null;

        // Handle jika response adalah array, ambil item pertama
        const expressionData = Array.isArray(expressionPriceRes?.data)
          ? expressionPriceRes.data[0]
          : expressionPriceRes?.data;

        // ADDED: Set scriptToChange state
        setScriptToChange(expressionData?.scriptPage || "");

        if (expressionData) {
          const {
            scriptTempletId,
            ruleComments,
            scriptPage,
            ruleScript: existingRuleScript,
          } = expressionData;

          try {
            const parser = new XMLParser({
              ignoreAttributes: false,
              attributeNamePrefix: "",
            });
            const parsed = parser.parse(scriptPage || "<Properties/>");

            const props = parsed?.Properties?.Property || [];
            const items = parsed?.Properties?.value?.group?.item || [];
            const arrProps = Array.isArray(props) ? props : [props];
            const arrItems = Array.isArray(items) ? items : [items];

            const values: Record<string, string> = {};
            arrProps.forEach((p: any) => {
              const item = arrItems.find((i: any) => i.id === p.id);
              values[p.id] = (item?.value ?? p.defaultValue ?? "").toString();
            });

            const jsonScriptPage = scriptTempletId
              ? JSON.stringify([{ "": values }])
              : null;

            let ruleScript = "";

            if (scriptTempletId) {
              try {
                const tmplRes = await GetData(
                  `${API_URL}/script-templet/${scriptTempletId}`,
                  {},
                );
                const tmpl = tmplRes?.data;

                if (tmpl?.templetTypeScript) {
                  ruleScript = tmpl.templetTypeScript;
                  Object.entries(values).forEach(([k, v]) => {
                    const regex = new RegExp(
                      `&${k}&`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                      "g",
                    );
                    ruleScript = ruleScript.replace(regex, v);
                  });
                }
              } catch (tmplErr) {
                console.error("Failed to fetch script template:", tmplErr);
                ruleScript = existingRuleScript || "";
              }
            } else {
              ruleScript = existingRuleScript || "";
            }

            exprData = {
              scriptTempletId,
              ruleComment: ruleComments,
              ruleScript,
              jsonScriptPage,
            };
          } catch (parseError) {
            exprData = {
              scriptTempletId,
              ruleComment: ruleComments,
              ruleScript: existingRuleScript || "",
              jsonScriptPage: null,
            };
          }
        }

        return {
          priceDetail,
          rankUpData,
          timeSpanData,
          accumulationCalculationData,
          accumulationPriceData,
          expressionPriceData: exprData,
        };
      } catch (error) {
        console.error("Failed to fetch price data:", error);
        throw error;
      }
    },
    [GetData],
  );

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formField.priceName.trim()) {
      newErrors.priceName = "Price Name is required";
    }

    if (!formField.price || Number(formField.price) <= 0) {
      newErrors.price = "Price is required";
    }

    if (
      formField.rum === undefined ||
      formField.rum === null ||
      formField.rum <= 0
    ) {
      newErrors.rum = "Calculation unit is required";
    }

    if (!formField.reAttr) {
      newErrors.reAttr = "Select unit is required";
    }

    if (!formField.acctItemTypeId) {
      newErrors.acctItemTypeId = "Account item type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchPriceDetail = async () => {
      if (!priceId || !showEditDialog) return;

      setIsLoadingData(true);
      try {
        const {
          priceDetail,
          rankUpData,
          timeSpanData,
          accumulationCalculationData,
          accumulationPriceData,
          expressionPriceData,
        } = await fetchAllPriceData(priceId);

        if (priceDetail) {
          setEffDate(priceDetail.effDate || "");
          setExpDate(priceDetail.expDate || "");
        }

        setFormField((prev) => ({
          ...prev,
          priceName: priceDetail?.priceName || "",
          price: priceDetail?.value || "",
          rum: priceDetail?.rum || 0,
          payIndicator: priceDetail?.payIndicator || null,
          reAttr: priceDetail?.reAttr || null,
          acctItemTypeId: priceDetail?.acctItemTypeId || 0,
          comments: priceDetail?.remarks || "",
          timeSpanUp: timeSpanData,
          rankUp: rankUpData,
          accumulationPrice: accumulationPriceData,
          accumulationCalculation: accumulationCalculationData,
          expressionPrice: expressionPriceData,
        }));
      } catch (error) {
        console.error("Failed to fetch price detail:", error);
        toast.error("Failed to load price data");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchPriceDetail();
  }, [showEditDialog, priceId, fetchAllPriceData]);

  const doUpdateAccumulationPrice = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...formField,
        timeSpanUp: formField.timeSpanUp?.length ? formField.timeSpanUp : null,
        rankUp: formField.rankUp?.length ? formField.rankUp : null,
        accumulationPrice: formField.accumulationPrice?.length
          ? formField.accumulationPrice
          : null,
        accumulationCalculation: formField.accumulationCalculation?.length
          ? formField.accumulationCalculation
          : null,
      };

      const response = await PutData(
        `${API_URL}/price/update/${priceId}?reType=1`,
        submitData,
      );

      if (response?.message) {
        toast.success("Price successfully updated!");
        await getPriceVersion(selectedRatePlan, selectedMapping);
        onUpdateSuccess?.();
        handleEditDialog(false, null);
      } else {
        toast.error("Failed to update price");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while updating price",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formField,
    PutData,
    priceId,
    onUpdateSuccess,
    handleEditDialog,
    getPriceVersion,
    selectedRatePlan,
    selectedMapping,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    doUpdateAccumulationPrice();
  };

  const resetForm = () => {
    setFormField({
      priceName: "",
      acctItemTypeId: null,
      price: "",
      payIndicator: null,
      rum: 0,
      reAttr: null,
      comments: "",
      timeSpanUp: null,
      rankUp: null,
      accumulationPrice: null,
      accumulationCalculation: null,
      expressionPrice: null,
      reType: "1",
    });
    setCurrentTab(0);
    setIsEditingTimeSpan(false);
    setIsEditingRankUp(false);
    setIsEditingAccumulationPrice(false);
    setIsEditingAccumulationCalc(false);
    // ADDED: Reset scriptToChange
    setScriptToChange("");
  };

  const handleClose = () => {
    handleEditDialog(false, null);
    resetForm();
  };

  const handleTabChange = (index: number) => {
    setCurrentTab(index);
  };

  return (
    <Dialog open={showEditDialog} onOpenChange={handleClose}>
      <DialogContent className="px-6 py-6 max-w-screen-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 border-b border-gray-200">
            Update Price Version
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Effective Date and Expiry Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Effective Date<span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-3 py-2 border rounded-md bg-gray-50 border-gray-200"
                type="date"
                value={effDate}
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <input
                className="w-full px-3 py-2 border rounded-md bg-gray-50 border-gray-200"
                type="date"
                value={expDate}
                disabled
              />
            </div>
          </div>

          {/* Price Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              Price Name
              <span className="text-red-500">*</span>
            </label>
            <input
              className={`w-full px-3 py-2 border rounded-md focus:outline-none transition-colors ${
                errors.priceName
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-blue-500"
              }`}
              type="text"
              value={formField.priceName}
              disabled={isAnyTabEditing}
              onChange={(e) => {
                setFormField({
                  ...formField,
                  priceName: e.target.value,
                });
                setErrors({ ...errors, priceName: "" });
              }}
              placeholder="Enter price name"
            />
            {errors.priceName && (
              <p className="text-red-500 text-xs">{errors.priceName}</p>
            )}
          </div>

          {/* Price and Calculate Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Price<span className="text-red-500">*</span>
              </label>
              <NumericFormat
                className="w-full px-3 py-2 border border-gray-200 focus:border-blue-500 focus:ring-blue-200 focus:outline-none transition-colors rounded-md"
                thousandSeparator=","
                decimalSeparator="."
                allowNegative={false}
                value={
                  formField.price !== undefined && formField.price !== ""
                    ? formField.price
                    : ""
                }
                onValueChange={(values) => {
                  setFormField({
                    ...formField,
                    price: values.value || "0",
                  });
                }}
                decimalScale={5}
                fixedDecimalScale={true}
                placeholder="0.00000"
                required
                disabled={isAnyTabEditing}
              />
              {errors.price && (
                <p className="text-red-500 text-xs">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Calculate Unit <span className="text-red-500">*</span>
              </label>
              <NumericFormat
                className="w-full px-3 py-2 border border-gray-200 focus:border-blue-500 focus:outline-none rounded-md"
                thousandSeparator=","
                decimalScale={0}
                allowNegative={false}
                value={formField.rum}
                onValueChange={(values) => {
                  setFormField({
                    ...formField,
                    rum: values.floatValue || 0,
                  });
                }}
                placeholder="0"
                required
                disabled={isAnyTabEditing}
              />
              {errors.rum && (
                <p className="text-red-500 text-xs">{errors.rum}</p>
              )}
            </div>
          </div>

          {/* Select Unit and Account Item Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Select Unit <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                  errors.reAttr
                    ? "border-red-300"
                    : "border-gray-200 focus:border-blue-500"
                }`}
                value={formField.reAttr?.toString() || ""}
                onChange={(e) => {
                  setFormField((prev) => ({
                    ...prev,
                    reAttr: parseInt(e.target.value) || null,
                  }));
                  setErrors({ ...errors, reAttr: "" });
                }}
                disabled={isAnyTabEditing}
              >
                <option value="">Select unit</option>
                {reAttr?.length ? (
                  reAttr.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.reAttrName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No units available
                  </option>
                )}
              </select>
              {errors.reAttr && (
                <p className="text-red-500 text-xs">{errors.reAttr}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Result Account Item Type <span className="text-red-500">*</span>
              </label>
              <AccountItemSearchSelect
                value={formField.acctItemTypeId}
                onChange={(val: number | null) => {
                  setFormField({
                    ...formField,
                    acctItemTypeId: val,
                  });
                  setErrors({ ...errors, acctItemTypeId: "" });
                }}
                placeholder="Search account item type..."
                className="w-full"
                error={!!errors.acctItemTypeId}
                disabled={isAnyTabEditing}
              />
              {errors.acctItemTypeId && (
                <p className="text-red-500 text-xs">{errors.acctItemTypeId}</p>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Remarks</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:outline-none resize-none"
              rows={3}
              value={formField.comments}
              onChange={(e) => {
                setFormField({
                  ...formField,
                  comments: e.target.value,
                });
              }}
              placeholder="Enter remarks"
              disabled={isAnyTabEditing}
            />
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex space-x-8">
                {versionType === "price" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTabChange(0)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        currentTab === 0
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                      disabled={isAnyTabEditing && currentTab !== 0}
                    >
                      Time Span Up
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange(1)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        currentTab === 1
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                      disabled={isAnyTabEditing && currentTab !== 1}
                    >
                      Rank Price
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange(2)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        currentTab === 2
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                      disabled={isAnyTabEditing && currentTab !== 2}
                    >
                      Accumulation Price
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange(3)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        currentTab === 3
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                      disabled={isAnyTabEditing && currentTab !== 3}
                    >
                      Accumulation Calculation
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() =>
                    handleTabChange(versionType === "price" ? 4 : 0)
                  }
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    currentTab === (versionType === "price" ? 4 : 0)
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  disabled={isAnyTabEditing && currentTab !== 4}
                >
                  Expression Price
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Contents */}
          {versionType === "price" && currentTab === 0 && (
            <TimeSpanComponent
              data={formField.timeSpanUp || []}
              onChange={(data) =>
                setFormField({ ...formField, timeSpanUp: data })
              }
              onEditingChange={setIsEditingTimeSpan}
            />
          )}

          {versionType === "price" && currentTab === 1 && (
            <RankUpComponent
              data={formField.rankUp || []}
              onChange={(data) => setFormField({ ...formField, rankUp: data })}
              timeSpanUp={formField.timeSpanUp}
              priceId={priceId}
              onEditingChange={setIsEditingRankUp}
            />
          )}

          {versionType === "price" && currentTab === 2 && (
            <AccumulationPriceComponent
              data={formField.accumulationPrice || []}
              onChange={(data) =>
                setFormField({ ...formField, accumulationPrice: data })
              }
              timeSpanUp={formField.timeSpanUp}
              priceId={priceId}
              onEditingChange={setIsEditingAccumulationPrice}
            />
          )}

          {versionType === "price" && currentTab === 3 && (
            <AccumulationCalculationComponent
              data={formField.accumulationCalculation || []}
              onChange={(data) =>
                setFormField({
                  ...formField,
                  accumulationCalculation: data,
                })
              }
              timeSpanUp={formField.timeSpanUp}
              priceId={priceId}
              onEditingChange={setIsEditingAccumulationCalc}
            />
          )}

          {/* UPDATED: Expression Price dengan scriptToChange props */}
          {((versionType === "price" && currentTab === 4) ||
            (versionType === "tax" && currentTab === 0)) && (
            <ExpressionPriceComponent
              data={formField.expressionPrice}
              onChange={(data) =>
                setFormField((prev) => ({
                  ...prev,
                  expressionPrice: data,
                }))
              }
              scriptToChange={scriptToChange}
            />
          )}

          {/* Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 -mx-6 -mb-6 mt-6">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isAnyTabEditing}
              className="px-6 py-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isAnyTabEditing}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <CircularProgress
                    size={20}
                    sx={{ mr: 1, color: "inherit" }}
                  />
                  Updating...
                </>
              ) : isAnyTabEditing ? (
                "Complete editing first"
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPriceDialog;
