import React, { useCallback, useEffect, useState } from "react";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useAuthContext } from "@/auth";
import { useUsagePriceCreateContext } from "../../hooks";
import BenefitValueTab from "./create-benefit/BenefitValue";
// import AdvancedBenefitComponent from "./create-benefit/AdvanceBenefit";
import { Dialog } from "@mui/material";
import AdvanceBenefitComponent from "./create-benefit/AdvancedBenefit";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";

interface CreateBenefitDialogProps {
  onClose: () => void;
  expDate?: string;
}
export interface BalanceType {
  acctResId: number;
  parentAcctResId: number;
  acctResName: string;
  stdCode: string;
}

interface advanceBenefit {
  scriptTempletId: number | null;
  jsonScriptPage: string | null;
  ruleScript: string;
  advancedBenefitRemarks: string;
}

interface BenefitFormData {
  ratePlanId: number;
  offerVerId: number;
  priceVerId: number | null;
  effectiveDate: string;
  expiryDate: string | null;
  benefitName: string;
  remarks: string | null;
  benefitValue: string;
  acctBalanceTypeId: number;
  reAttrId: number;
  calculationUnit: number;
  cycleFloorLimit: number | null;
  dailyFloorLimit: number | null;
  cycleCeilLimit: number | null;
  dailyCeilLimit: number | null;
  maximumDays: number | null;
  subscriberOnly: string | null;
  relativeEffectiveTime: string | null;
  absoluteEffectiveDate: string;
  absoluteExpiryDate: string | null;
  offsetOfAbsoluteExpiry: number | null;
  offsetOfEffectiveDate: number | null;
  offsetOfEffectiveDateUnit: string | null;
  durationOfAvailability: string | null;
  durationOfAvailabilityUnit: string | null;
  advanceBenefit: advanceBenefit | null;
  balFlags: string | null;
  relativeExpiryTime: string | null;
  mappingId: number | null;
  relativePeriodUnit: string | null;
}

interface FormErrors {
  effectiveDate: string;
  expiryDate: string;
  benefitName: string;
  benefitValue: string;
  acctBalanceTypeId: string;
  reAttrId: string;
}

const API_URL_PRICE_PLAN = apiConfig.service_price_plan;

const CreateBenefitDialog: React.FC<CreateBenefitDialogProps> = ({ onClose, expDate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { PostData, GetData } = useCallApi();
  const { selectedOfferVerId } = usePortalData();
  const { ratePlans, acctType, reAttr, selectedRatePlan, selectedEvent, selectedMapping } = useUsagePriceCreateContext();
  const [periodType, setPeriodType] = useState<"absolute" | "relative">("absolute");

  const [formField, setFormField] = useState<BenefitFormData>({
    mappingId: selectedMapping || null,
    ratePlanId: selectedRatePlan || 0,
    offerVerId: selectedOfferVerId || 0,
    priceVerId: null,
    effectiveDate: expDate || "",
    expiryDate: "",
    benefitName: "",
    remarks: null,
    benefitValue: "",
    acctBalanceTypeId: 0,
    reAttrId: 0,
    calculationUnit: 0,
    cycleFloorLimit: null,
    dailyFloorLimit: null,
    cycleCeilLimit: null,
    dailyCeilLimit: null,
    maximumDays: null,
    subscriberOnly: null,
    relativePeriodUnit: null,
    relativeEffectiveTime: null,
    absoluteEffectiveDate: "",
    absoluteExpiryDate: null,
    offsetOfAbsoluteExpiry: null,
    offsetOfEffectiveDate: null,
    offsetOfEffectiveDateUnit: null,
    durationOfAvailability: null,
    balFlags: null,
    relativeExpiryTime: null,
    durationOfAvailabilityUnit: null,
    advanceBenefit: null,
  });

  useEffect(() => {
    //  console.log(formField);
  }, [formField]);

  const [errors, setErrors] = useState<FormErrors>({
    effectiveDate: "",
    expiryDate: "",
    benefitName: "",
    benefitValue: "",
    acctBalanceTypeId: "",
    reAttrId: "",
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      effectiveDate: "",
      expiryDate: "",
      benefitName: "",
      benefitValue: "",
      acctBalanceTypeId: "",
      reAttrId: "",
    };

    // Effective Date
    if (!formField.effectiveDate) {
      newErrors.effectiveDate = "Effective date is required";
      setErrors(newErrors);
      toast.error("Effective Date is required");
      return false;
    }

    // Benefit Name
    if (!formField.benefitName?.trim()) {
      newErrors.benefitName = "Benefit name is required";
      setErrors(newErrors);
      toast.error("Benefit Name is required");
      return false;
    }

    // Benefit Value
    if (!formField.benefitValue?.trim()) {
      newErrors.benefitValue = "Benefit value is required";
      setErrors(newErrors);
      toast.error("Benefit Value is required");
      return false;
    }

    // Account Balance Type
    if (!formField.acctBalanceTypeId || formField.acctBalanceTypeId === 0) {
      newErrors.acctBalanceTypeId = "Account balance type is required";
      setErrors(newErrors);
      toast.error("Account Balance Type is required");
      return false;
    }

    if (!formField.calculationUnit || formField.calculationUnit === 0) {
      newErrors.acctBalanceTypeId = "Calculation Unit is required";
      toast.error("Calculation Unit is required");
      return false;
    }

    // Resource Attribute
    if (!formField.reAttrId || formField.reAttrId === 0) {
      newErrors.reAttrId = "Currency is required";
      setErrors(newErrors);
      toast.error("Currency is required");
      return false;
    }

    // Expiry Date must be >= Effective Date
    if (formField.expiryDate) {
      const eff = new Date(formField.effectiveDate);
      const exp = new Date(formField.expiryDate);

      if (exp < eff) {
        newErrors.expiryDate = "Expiry date cannot be earlier than effective date";

        setErrors(newErrors);
        toast.error("Expiry date cannot be earlier than effective date");
        return false; // 🔥 STOP SUBMIT
      }
    }

    setErrors(newErrors);
    return true;
  };

  const doCreateBenefit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const response = await PostData(`${API_URL_PRICE_PLAN}/price/benefit/create`, formField);

      if (response?.status) {
        toast.success("Benefit successfully created!");
        onClose();
      } else {
        toast.error(response?.message || "Failed to create benefit");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "An error occurred while creating benefit");
    } finally {
      setIsSubmitting(false);
    }
  }, [formField, PostData, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      doCreateBenefit();
    }
  };

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          backgroundColor: "white",
          borderRadius: 2,
          height: "90vh",
        },
      }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Benefit</h2>
      </div>

      {/* Content */}
      <div className="px-10 py-5 overflow-y-auto" style={{ maxHeight: "calc(90vh - 140px)" }}>
        <form onSubmit={handleSubmit}>
          {/* Basic Information - 2 Columns */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Effective Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective Date <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.effectiveDate ? "border-red-500" : "border-gray-300"}`}
                  type="date"
                  value={formField.effectiveDate}
                  onChange={(e) => {
                    setFormField({
                      ...formField,
                      effectiveDate: e.target.value,
                    });
                    setErrors({ ...errors, effectiveDate: "" });
                  }}
                  // disabled={true}
                />

                {errors.effectiveDate && <span className="text-red-500 text-sm mt-1">{errors.effectiveDate}</span>}
              </div>

              {/* Benefit Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benefit Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.benefitName ? "border-red-500" : "border-gray-300"}`}
                  type="text"
                  autoComplete="off"
                  value={formField.benefitName}
                  onChange={(e) => {
                    setFormField({
                      ...formField,
                      benefitName: e.target.value,
                    });
                    setErrors({ ...errors, benefitName: "" });
                  }}
                />
                {errors.benefitName && <span className="text-red-500 text-sm mt-1">{errors.benefitName}</span>}
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  value={formField.remarks ?? ""}
                  onChange={(e) => {
                    setFormField({
                      ...formField,
                      remarks: e.target.value,
                    });
                  }}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.expiryDate ? "border-red-500" : "border-gray-300"}`}
                  type="date"
                  value={formField.expiryDate ?? ""}
                  onChange={(e) => {
                    setFormField({
                      ...formField,
                      expiryDate: e.target.value,
                    });
                    setErrors({ ...errors, expiryDate: "" });
                  }}
                />
                {errors.expiryDate && <span className="text-red-500 text-sm mt-1">{errors.expiryDate}</span>}
              </div>

              {/* Price Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Type</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="configType" value="0" className="text-blue-600" />
                    <span className="text-sm">Advanced</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex space-x-8">
                <button
                  type="button"
                  onClick={() => handleTabChange(0)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 0 ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  Benefit Value
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange(1)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 1 ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  Advanced Benefit
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 0 && <BenefitValueTab formField={formField} setFormField={setFormField} errors={errors} setErrors={setErrors} acctType={acctType} reAttr={reAttr} periodType={periodType} setPeriodType={setPeriodType} />}

            {activeTab === 1 && (
              <div className="text-gray-500 text-sm">
                <AdvanceBenefitComponent
                  data={formField.advanceBenefit}
                  onChange={(data) =>
                    setFormField((prev) => ({
                      ...prev,
                      advanceBenefit: data,
                    }))
                  }
                />
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </>
          ) : (
            "OK"
          )}
        </button>
      </div>
    </Dialog>
  );
};

export default CreateBenefitDialog;
