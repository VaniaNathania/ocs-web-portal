import React, { useCallback, useEffect, useState } from "react";

import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useAuthContext } from "@/auth";
import { useUsagePriceCreateContext } from "../hooks";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RefreshCw } from "lucide-react";
import TimeSpanComponent from "./Rating.tsx/TimeSpanComponent";
import RankUpComponent from "./Rating.tsx/RankUpComponent";
import AccumulationPriceComponent from "./Rating.tsx/AccumulationPrice";
import AccumulationCalculationComponent from "./Rating.tsx/AccumulationCalculation";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import ExpressionPriceComponent from "./Rating.tsx/ExpressionPrice";
import AccountItemSearchSelect from "../../subscription-price/blocks/SelectSearchAccountItemType";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@mui/material";
import { NumericFormat } from "react-number-format";
// import ExpressionPriceComponent from "./Rating.tsx/price/ExpressionPrice";

interface CreatePriceVersionDialogProps {
  onClose: () => void;
  mappingId: number | null;
  expDate: any;
  versionType: string | null;
  showDialog: boolean;
}

interface TimeSpanUp {
  timeSpanId: number;
  calculationUnit: number;
  calculationMethod: string;
  price?: string;
  timeSpanName?: string;
  isConfirmed?: boolean;
}
interface AccumulationPrice {
  timeSpanUpId: number | null; // This will be the index of timeSpanUp array
  calculateUnit: number;
  adjustMethod: string;
  acctItemTypeId: number;
  price: string;
  rangeEffVal: number;
  rangeExpVal: number;
  isConfirmed?: boolean;
}
interface AccumulationCalculation {
  acctItemTypeId: number;
  calculateUnit: number | null;
  timeSpanUpId: number;
  isConfirmed?: boolean;
}
interface RankUp {
  timeSpanUpId: number | null;
  calculationUnit: number;
  adjustMethod: string;
  price: string;
  rangeEffVal: number;
  rangeExpVal: number;
  isConfirmed?: boolean;
}
interface ExpressionPrice {
  scriptTempletId: number | null;
  jsonScriptPage: string | null;
  ruleScript: string;
  ruleComment: string;
}

interface PriceVersionFormData {
  offerVerId: number;
  mappingId: number | null;
  reId: number;
  ratePlanId: number;
  effDate: string;
  expDate: string;
  priceName: string;
  acctItemTypeId: number | null;
  price: string;
  payIndicator: boolean | null;
  rum: number;
  reAttr: string;
  comments: string;
  timeSpanUp: TimeSpanUp[] | null;
  rankUp: RankUp[] | null;
  accumulationPrice: AccumulationPrice[] | null;
  accumulationCalculation: AccumulationCalculation[] | null;
  expressionPrice: ExpressionPrice | null;
}

interface FormErrors {
  effDate: string;
  priceName: string;
  expDate: string;
  acctItemTypeId: string;
  reAttr: string;
  price: string;
  rum: string;
}

const API_URL_PRICE_PLAN = apiConfig.service_price_plan;

const CreatePriceVersionDialog: React.FC<CreatePriceVersionDialogProps> = ({ onClose, mappingId, expDate, versionType, showDialog }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { pricePlanDetail } = useAuthContext();
  const { PostData } = useCallApi();
  const [activeTab, setActiveTab] = useState(0);
  const { ratePlans, acctType, reAttr, selectedRatePlan, selectedEvent, getPriceVersion, formatedValue } = useUsagePriceCreateContext();

  const { dataPricePlan, dataPricePlanDetail, selectedOfferVerId } = usePortalData();
  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };
  const [formField, setFormField] = useState<PriceVersionFormData>({
    offerVerId: selectedOfferVerId || 0,
    reId: selectedEvent || 0,
    ratePlanId: selectedRatePlan || 0,
    effDate: expDate,
    expDate: "",
    priceName: "",
    mappingId: mappingId || null,
    acctItemTypeId: null,
    price: "",
    payIndicator: null,
    rum: 0,
    reAttr: "",
    comments: "",
    timeSpanUp: null,
    rankUp: null,
    accumulationPrice: null,
    accumulationCalculation: null,
    expressionPrice: null,
  });

  const [errors, setErrors] = useState<FormErrors>({
    effDate: "",
    priceName: "",
    expDate: "",
    acctItemTypeId: "",
    reAttr: "",
    rum: "",
    price: "",
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      effDate: "",
      priceName: "",
      expDate: "",
      acctItemTypeId: "",
      reAttr: "",
      price: "",
      rum: "",
    };

    // Effective date wajib
    if (!formField.effDate) {
      newErrors.effDate = "Effective date is required";
    }

    // Price Name wajib
    if (!formField.priceName.trim()) {
      newErrors.priceName = "Price name is required";
    }

    // Price wajib
    if (!formField.price || Number(formField.price) <= 0) {
      newErrors.price = "Price is required";
    }

    // Calculate Unit wajib
    if (!formField.rum || formField.rum === 0) {
      newErrors.rum = "Calculate unit is required";
    }

    // Select Unit wajib
    if (!formField.reAttr) {
      newErrors.reAttr = "Select unit is required";
    }

    // Account Item Type wajib
    if (!formField.acctItemTypeId) {
      newErrors.acctItemTypeId = "Account item type is required";
    }

    // 🔥 VALIDASI BARU: expDate tidak boleh sebelum effDate
    if (formField.expDate) {
      const eff = new Date(formField.effDate);
      const exp = new Date(formField.expDate);

      if (exp < eff) {
        toast.error("Expiry date cannot be earlier than effective date");
        newErrors.expDate = "Expiry date cannot be earlier than effective date";
      }
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== "");
  };

  // Di CreatePriceVersionDialog.tsx, tambahkan utility function ini:

  const cleanFormDataForSubmit = (data: PriceVersionFormData) => {
    return {
      ...data,
      timeSpanUp:
        data.timeSpanUp?.map((item) => {
          const { isConfirmed, ...rest } = item;
          return rest;
        }) || null,
      rankUp:
        data.rankUp?.map((item) => {
          const { isConfirmed, ...rest } = item;
          return rest;
        }) || null,
      accumulationPrice:
        data.accumulationPrice?.map((item) => {
          const { isConfirmed, ...rest } = item;
          return rest;
        }) || null,
      accumulationCalculation:
        data.accumulationCalculation?.map((item) => {
          const { isConfirmed, ...rest } = item;
          return rest;
        }) || null,
      expDate: data.expDate === "" ? null : data.expDate,
    };
  };

  // Update doCreatePriceVersion:
  const doCreatePriceVersion = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const cleanedData = cleanFormDataForSubmit(formField);

      const response = await PostData(`${API_URL_PRICE_PLAN}/price/create?reType=1`, cleanedData);

      if (response?.message) {
        toast.success("Price version successfully created!");
        if (formField.ratePlanId) {
          await getPriceVersion(formField.ratePlanId, formField.mappingId);
        }
        onClose();
      } else {
        toast.error("Failed to create price version");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "An error occurred while creating price version");
    } finally {
      setIsSubmitting(false);
    }
  }, [formField, PostData, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      doCreatePriceVersion();
    }
  };

  const resetForm = () => {
    setFormField({
      offerVerId: selectedOfferVerId || 0,
      reId: selectedEvent || 0,
      ratePlanId: selectedRatePlan || 0,
      effDate: expDate,
      expDate: "",
      priceName: "",
      mappingId: mappingId || null,
      acctItemTypeId: null,
      price: "",
      payIndicator: null,
      rum: 0,
      reAttr: "",
      comments: "",
      timeSpanUp: null,
      rankUp: null,
      accumulationPrice: null,
      accumulationCalculation: null,
      expressionPrice: null,
    });
    setErrors({
      effDate: "",
      priceName: "",
      expDate: "",
      acctItemTypeId: "",
      reAttr: "",
      rum: "",
      price: "",
    });
    setActiveTab(0); // reset ke tab pertama
  };
  const [isEditingTimeSpan, setIsEditingTimeSpan] = useState(false); // State baru
  const [isEditingRankUp, setIsEditingRankUp] = useState(false); // Untuk tab lain juga
  const [isEditingAccumulationPrice, setIsEditingAccumulationPrice] = useState(false);
  const [isEditingAccumulationCalc, setIsEditingAccumulationCalc] = useState(false);
  const isAnyTabEditing = isEditingTimeSpan || isEditingRankUp || isEditingAccumulationPrice || isEditingAccumulationCalc;

  useEffect(() => {
    resetForm();
  }, []);
  const handleClose = () => {
    onClose();
    resetForm();
  };
  return (
    <Dialog open={showDialog} onOpenChange={handleClose}>
      <DialogContent className="px-6 py-6 max-w-screen-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 border-b border-gray-200">Create New Price Version</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Effective Date and Expiry Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Effective Date
                <span className="text-red-500">*</span>
              </label>
              <input
                className={`w-full px-3 py-2 border rounded-md focus:outline-none transition-colors ${errors.effDate ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
                type="date"
                disabled={!!expDate || isAnyTabEditing}
                value={formField.effDate}
                onChange={(e) => {
                  setFormField({
                    ...formField,
                    effDate: e.target.value,
                  });
                  setErrors({ ...errors, effDate: "" });
                }}
                required
                placeholder="Select effective date"
              />
              {errors.effDate && (
                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.effDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">Expiry Date</label>
              <input
                className={`w-full px-3 py-2 border rounded-md focus:outline-none transition-colors ${errors.expDate ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
                type="date"
                value={formField.expDate}
                onChange={(e) => {
                  setFormField({
                    ...formField,
                    expDate: e.target.value,
                  });
                  setErrors({ ...errors, expDate: "" });
                }}
                disabled={isAnyTabEditing}
                placeholder="Select expiry date"
              />
              {errors.expDate && (
                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.expDate}
                </p>
              )}
            </div>
          </div>

          {/* Price Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              Price Name
              <span className="text-red-500">*</span>
            </label>
            <input
              className={`w-full px-3 py-2 border rounded-md focus:outline-none transition-colors ${errors.priceName ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
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
              <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.priceName}
              </p>
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
                value={formField.price !== undefined && formField.price !== "" ? formField.price : ""}
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
                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.price}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Calculate Unit<span className="text-red-500">*</span>
              </label>
              <NumericFormat
                className="w-full px-3 py-2 border border-gray-200 focus:border-blue-500 focus:ring-blue-200 focus:outline-none transition-colors rounded-md"
                thousandSeparator=","
                decimalSeparator="."
                decimalScale={0}
                allowNegative={false}
                value={formField.rum}
                onValueChange={(values) => {
                  setFormField({
                    ...formField,
                    rum: values.floatValue || 0,
                  });
                }}
                placeholder="$0.00"
                required
                disabled={isAnyTabEditing}
              />
              {errors.rum && <p className="text-red-500 text-xs">{errors.rum}</p>}
            </div>
          </div>

          {/* Select Unit and Account Item Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Select Unit<span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full px-3 py-2 border rounded-md focus:outline-none transition-colors ${errors.reAttr ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
                value={formField.reAttr?.toString() || ""}
                onChange={(e) => {
                  setFormField({
                    ...formField,
                    reAttr: e.target.value,
                  });
                  setErrors({ ...errors, reAttr: "" });
                }}
                disabled={isAnyTabEditing}
              >
                <option value="">Select unit</option>
                {reAttr.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.reAttrName}
                  </option>
                ))}
              </select>
              {errors.reAttr && (
                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.reAttr}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Result Account Item Type <span className="text-red-500">*</span>
              </label>

              {/* GANTI SELECT INI */}
              <AccountItemSearchSelect
                value={formField.acctItemTypeId}
                onChange={(val: number | null) => {
                  setFormField({
                    ...formField,
                    acctItemTypeId: val, // ganti ini, jangan ke `comments`
                  });
                }}
                placeholder="Search account item type..."
                className="w-full"
                error={!!errors.acctItemTypeId}
                disabled={isAnyTabEditing}
              />

              {/* Tambahkan error message jika ada */}
              {errors.acctItemTypeId && (
                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.acctItemTypeId}
                </p>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Remarks</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors resize-none"
              rows={3}
              disabled={isAnyTabEditing}
              value={formField.comments}
              onChange={(e) => {
                setFormField({
                  ...formField,
                  comments: e.target.value,
                });
              }}
              placeholder="Enter remarks"
            />
          </div>
          <div className="mb-6">
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex space-x-8">
                {versionType === "price" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTabChange(0)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 0 ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                      disabled={isAnyTabEditing && activeTab !== 0}
                    >
                      Time Span Up
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange(1)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 1 ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                      disabled={isAnyTabEditing && activeTab !== 1}
                    >
                      Rank Price
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange(2)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 2 ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                      disabled={isAnyTabEditing && activeTab !== 2}
                    >
                      Accumulation Price
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange(3)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 3 ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                      disabled={isAnyTabEditing && activeTab !== 3}
                    >
                      Accumulation Calculation
                    </button>
                  </>
                )}

                {/* selalu tampil untuk price dan tax */}
                <button
                  type="button"
                  onClick={() => handleTabChange(versionType === "price" ? 4 : 0)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === (versionType === "price" ? 4 : 0) ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                  disabled={isAnyTabEditing && activeTab !== 4}
                >
                  Expression Price
                </button>
              </nav>
            </div>
          </div>
          {versionType === "price" && activeTab === 0 && <TimeSpanComponent data={formField.timeSpanUp || []} onChange={(data) => setFormField({ ...formField, timeSpanUp: data })} onEditingChange={setIsEditingTimeSpan} />}

          {versionType === "price" && activeTab === 1 && (
            <RankUpComponent data={formField.rankUp || []} onChange={(data) => setFormField({ ...formField, rankUp: data })} timeSpanUp={formField.timeSpanUp} onEditingChange={setIsEditingRankUp} />
          )}

          {versionType === "price" && activeTab === 2 && (
            <AccumulationPriceComponent
              data={formField.accumulationPrice || []}
              onChange={(data) => setFormField({ ...formField, accumulationPrice: data })}
              timeSpanUp={formField.timeSpanUp}
              onEditingChange={setIsEditingAccumulationPrice}
            />
          )}

          {versionType === "price" && activeTab === 3 && (
            <AccumulationCalculationComponent
              data={formField.accumulationCalculation || []}
              onChange={(data) =>
                setFormField({
                  ...formField,
                  accumulationCalculation: data,
                })
              }
              timeSpanUp={formField.timeSpanUp}
              onEditingChange={setIsEditingAccumulationCalc}
            />
          )}

          {/* Expression Price tampil untuk price & tax */}
          {(versionType === "price" && activeTab === 4) || (versionType === "tax" && activeTab === 0) ? (
            <ExpressionPriceComponent
              data={formField.expressionPrice}
              onChange={(data) =>
                setFormField((prev) => ({
                  ...prev,
                  expressionPrice: data,
                }))
              }
            />
          ) : null}

          {/* Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 -mx-6 -mb-6 mt-6">
            <Button
              type="button"
              onClick={onClose}
              disabled={isAnyTabEditing} // Disable cancel juga saat editing
              className="px-6 py-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isAnyTabEditing} // Disable saat submitting ATAU editing
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: "inherit" }} />
                  Creating...
                </>
              ) : isAnyTabEditing ? (
                "Complete editing first"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePriceVersionDialog;
