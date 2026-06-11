import React, { useCallback, useEffect, useState } from "react";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useAuthContext } from "@/auth";
import { useUsagePriceCreateContext } from "../../hooks";
// import BenefitValueTab from "./create-benefit/BenefitValue";
// import AdvanceBenefitComponent from "./create-benefit/AdvanceBenefit";
import { Dialog } from "@mui/material";
import BenefitValueTab from "./create-benefit/BenefitValuePrice";
// import AdvanceBenefitComponent from "./create-benefit/AdvanceBenefitPrice";
import BenefitValueUpdateTab from "./create-benefit/BenefitValueUpdate";
import AdvanceBenefitUpdateComponent from "./create-benefit/AdvancedBenefitUpdate";
import { XMLParser } from "fast-xml-parser";
// import AdvanceBenefitUpdateComponent from "./create-benefit/AdvancedBenefitUpdate";

interface CreateBenefitPriceDialogProps {
  onClose: () => void;
  show?: boolean;
  priceVerId: number | null;
  onUpdateSuccess?: () => void; // tambah ini
  priceId: number | null;
}
interface BalanceType {
  acctResId: number;
  acctResName: string;
}

interface AdvanceBenefit {
  scriptTempletId: number | null;
  jsonScriptPage: string | null;
  ruleScript: string;
  advancedBenefitRemarks: string;
}
interface BenefitFormData {
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
  advanceBenefit: AdvanceBenefit | null;
  balFlags: string | null;
  relativeExpiryTime: string | null;

  relativePeriodUnit: string | null;
}

interface FormErrors {
  benefitName: string;
  benefitValue: string;
  acctBalanceTypeId: string;
  reAttrId: string;
  calculationUnit: string;
}

const API_URL_PRICE_PLAN = apiConfig.service_price_plan;

const UpdateBenefiPricetDialog: React.FC<CreateBenefitPriceDialogProps> = ({ onClose, priceVerId, onUpdateSuccess, priceId, show = true }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentPriceVerId, setCurrentPriceVerId] = useState<number>(0);
  const [selectedAccumulationType, setSelectedAccumulationType] = useState<number>(0);
  const [scriptToChange, setScriptToChange] = useState<string>("");

  const { PostData, GetData, PutData } = useCallApi();
  const { ratePlans, acctType, reAttr, selectedRatePlan, selectedEvent } = useUsagePriceCreateContext();

  const [periodType, setPeriodType] = useState<"absolute" | "relative">("absolute");

  const [formData, setFormData] = useState<any>({
    effectiveDate: "",
    expiryDate: null,
  });

  const [formField, setFormField] = useState<BenefitFormData>({
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
    if (!priceId) return;

    const doFetchData = async () => {
      try {
        const response = await GetData(`${API_URL_PRICE_PLAN}/price/detail/${priceId}`, {});

        const data = response?.data;

        if (!data) {
          console.error("No data received from API");
          return;
        }

        // Set form data untuk effective dan expiry date
        setFormData((prev: any) => ({
          ...prev,
          effectiveDate: data?.effectiveDate || "",
          expiryDate: data?.expiryDate || "",
        }));

        // Process advanced benefit data - UPDATED LOGIC matching expression price
        let advancedBenefitData: AdvanceBenefit | null = null;

        if (data.scriptTempletId || data.ruleRemarks || data.rule || data.scriptPage) {
          const { scriptTempletId, ruleRemarks, scriptPage, rule: existingRuleScript } = data;

          setScriptToChange(scriptPage || "");

          try {
            // Parse XML scriptPage for template-based scenario
            const parser = new XMLParser({
              ignoreAttributes: false,
              attributeNamePrefix: "",
            });
            const parsed = parser.parse(scriptPage || "<Properties/>");

            const props = parsed?.Properties?.Property || [];
            const items = parsed?.Properties?.value?.group?.item || [];
            const arrProps = Array.isArray(props) ? props : [props];
            const arrItems = Array.isArray(items) ? items : [items];

            // Get map id -> value for template-based
            const values: Record<string, string> = {};
            arrProps.forEach((p: any) => {
              const item = arrItems.find((i: any) => i.id === p.id);
              values[p.id] = (item?.value ?? p.defaultValue ?? "").toString();
            });

            // Create jsonScriptPage - only for template-based
            const jsonScriptPage = scriptTempletId ? JSON.stringify([{ "": values }]) : "";

            // Logic for ruleScript
            let ruleScript = "";

            if (scriptTempletId) {
              // Template-based: get from script template and inject values
              try {
                const tmplRes = await GetData(`${API_URL_PRICE_PLAN}/script-templet/${scriptTempletId}`, {});
                const tmpl = tmplRes?.data;

                if (tmpl?.templetTypeScript) {
                  ruleScript = tmpl.templetTypeScript;
                  // Inject values into template
                  Object.entries(values).forEach(([k, v]) => {
                    const regex = new RegExp(`&${k}&`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
                    ruleScript = ruleScript.replace(regex, v);
                  });
                }
              } catch (tmplErr) {
                console.error("Failed to fetch script template:", tmplErr);
                // Fallback: use existing ruleScript
                ruleScript = existingRuleScript || "";
              }
            } else {
              // Direct script: get directly from ruleScript field
              ruleScript = existingRuleScript || "";
            }

            // Create advanced benefit object
            advancedBenefitData = {
              scriptTempletId: scriptTempletId || null,
              jsonScriptPage,
              ruleScript,
              advancedBenefitRemarks: ruleRemarks || "",
            };
          } catch (parseError) {
            console.error("Error parsing script page:", parseError);
            advancedBenefitData = {
              scriptTempletId: scriptTempletId || null,
              jsonScriptPage: "",
              ruleScript: existingRuleScript || "",
              advancedBenefitRemarks: ruleRemarks || "",
            };
          }
        }

        setFormField((prev) => ({
          ...prev,
          benefitName: data?.benefitName || "",
          remarks: data?.remarks || null,
          benefitValue: data?.benefitValue || "",
          acctBalanceTypeId: data?.acctBalanceTypeId || 0,
          reAttrId: data?.reAttr || 0,
          calculationUnit: data?.calculationUnit || 0,
          cycleFloorLimit: data?.cycleFloorLimit ?? null,
          dailyFloorLimit: data?.dailyFloorLimit ?? null,
          cycleCeilLimit: data?.cycleCeilLimit ?? null,
          dailyCeilLimit: data?.dailyCeilLimit ?? null,
          maximumDays: data?.maximumDays ?? null,
          subscriberOnly: data?.subscriberOnly ?? null,
          relativeEffectiveTime: data?.relativeEffectiveTime ?? null,
          absoluteEffectiveDate: data?.absoluteEffectiveDate ?? "",
          absoluteExpiryDate: data?.absoluteExpiryDate ?? null,
          offsetOfAbsoluteExpiry: data?.offsetOfAbsoluteExpiry ?? null,
          offsetOfEffectiveDate: data?.offsetOfEffectiveDate ?? null,
          offsetOfEffectiveDateUnit: data?.offsetOfEffectiveDateUnit ?? null,
          durationOfAvailability: data?.durationOfAvailability ?? null,
          durationOfAvailabilityUnit: data?.durationOfAvailabilityUnit ?? null,
          balFlags: data?.balFlags ?? null,
          relativeExpiryTime: data?.relativeExpiryTime || null,
          relativePeriodUnit: data?.relativePeriodUnit ?? null,
          advanceBenefit: advancedBenefitData,
        }));

        const isRelative = !!data?.offsetOfEffectiveDate || !!data?.offsetOfEffectiveDateUnit || !!data?.durationOfAvailability || !!data?.durationOfAvailabilityUnit || !!data?.relativeExpiryTime || !!data?.relativePeriodUnit;

        setPeriodType(isRelative ? "relative" : "absolute");
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load benefit data");
      }
    };

    doFetchData();
  }, [priceId]);

  const [errors, setErrors] = useState<FormErrors>({
    benefitName: "",
    benefitValue: "",
    acctBalanceTypeId: "",
    reAttrId: "",
    calculationUnit: "",
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      benefitName: "",
      benefitValue: "",
      acctBalanceTypeId: "",
      reAttrId: "",
      calculationUnit: "",
    };

    let valid = true;

    if (!formField.benefitName) {
      newErrors.benefitName = "Benefit name is required";
      toast.error("Benefit Name is required");
      valid = false;
    }

    if (!formField.benefitValue) {
      newErrors.benefitValue = "Benefit value is required";
      toast.error("Benefit Value is required");
      valid = false;
    }

    if (!formField.acctBalanceTypeId || formField.acctBalanceTypeId === 0) {
      newErrors.acctBalanceTypeId = "Account balance type is required";
      toast.error("Account Balance Type is required");
      valid = false;
    }

    if (!formField.calculationUnit || formField.calculationUnit === 0) {
      newErrors.calculationUnit = "Calculation unit is required";
      toast.error("Calculation Unit is required");
      valid = false;
    }

    if (!formField.reAttrId || formField.reAttrId === 0) {
      newErrors.reAttrId = "Currency is required";
      toast.error("Currency is required");
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const doCreateBenefit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const response = await PutData(`${API_URL_PRICE_PLAN}/price/benefit/update/${priceId}`, formField);

      if (response?.message) {
        toast.success("Benefit successfully created!");
        onUpdateSuccess?.();
        onClose();
      } else {
        toast.error("Failed to create benefit");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "An error occurred while creating benefit");
    } finally {
      setIsSubmitting(false);
    }
  }, [formField, onClose]);

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
      <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: "calc(90vh - 140px)" }}>
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="space-y-4 mb-6">
            {/* Effective Date & Expiry Date Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="w-full">
                <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                  <label className="form-label flex items-center gap-1 max-w-56">
                    Effective Date
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="grow flex flex-col">
                    <input className="w-full px-2 py-1 text-xs border rounded focus:outline-none transition-colors border-gray-200 bg-gray-50" type="date" value={formData.effectiveDate} disabled={true} />
                  </div>
                </div>
              </div>

              <div className="w-full">
                <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                  <label className="form-label flex items-center gap-1 max-w-56">Expiry Date</label>
                  <div className="grow flex flex-col">
                    <input className="w-full px-2 py-1 text-xs border rounded focus:outline-none transition-colors border-gray-200 bg-gray-50" type="date" value={formData.expiryDate} disabled={true} />
                  </div>
                </div>
              </div>
            </div>

            {/* Benefit Name */}
            <div className="w-full">
              <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                <label className="form-label flex items-center gap-1 max-w-56">
                  Benefit Name
                  <span className="text-red-500">*</span>
                </label>
                <div className="grow flex flex-col">
                  <input
                    className={`input ${errors.benefitName ? "border-red-500" : ""}`}
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
              </div>
            </div>

            {/* Remarks */}
            <div className="w-full">
              <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                <label className="form-label flex items-center gap-1 max-w-56">Remarks</label>
                <div className="grow flex flex-col">
                  <textarea
                    className="input resize-none"
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
            </div>

            {/* Price Type */}
            <div className="w-full">
              <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                <label className="form-label flex items-center gap-1 max-w-56">Price Type</label>
                <div className="grow flex flex-col">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="configType" value="0" className="form-radio" />
                      <span className="text-sm">Advanced</span>
                    </label>
                  </div>
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
            {activeTab === 0 && <BenefitValueUpdateTab formField={formField} setFormField={setFormField} errors={errors} setErrors={setErrors} acctType={acctType} reAttr={reAttr} periodType={periodType} setPeriodType={setPeriodType} />}

            {activeTab === 1 && (
              <div className="text-gray-500 text-sm">
                <AdvanceBenefitUpdateComponent
                  data={formField.advanceBenefit}
                  onChange={(data) =>
                    setFormField((prev) => ({
                      ...prev,
                      advanceBenefit: data,
                    }))
                  }
                  scriptToChange={scriptToChange}
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

export default UpdateBenefiPricetDialog;
