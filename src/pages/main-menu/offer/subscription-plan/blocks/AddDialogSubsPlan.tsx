import React, { useState, useEffect, useRef, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumericFormat } from "react-number-format";
import { apiConfigOffer } from "@/config/api.config";
import { useSubscriptionPlanOfferListContext } from "../hooks/useSubscriptionPlanOfferListContext";
import { useCallApi } from "@/hooks";
import { getAuth } from "@/auth";
import { toast } from "sonner";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { KeenIcon, useDataGrid } from "@/components";

interface AddDialogSubsPlanProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface lifecycleType {
  lifecycleType: number;
  lifecycleTypeName: string;
  comments: string;
  spId: string;
  extAttr: string;
}

export interface SubsPlanProps {
  subsPlanRequestDto: {
    subsPlanId: number;
    indepProdSpecId: number;
    priority: number | null;
    effDate: string;
    expDate: string;
    saleFlag: string;
    spId: number | null;
    isBundleFlag: string;
    subsPlanCode: string;
    subsPlanName: string;
  };
  offerRequestDto: {
    offerId: number | null;
    offerType: string;
    offerName: string;
    comments: string;
    offerCode: string;
    saleListPrice: number | null;
    rentListPrice: number | null;
    effDate: string;
    expDate: string;
    effType: string;
    autoContinueFlag: string | null;
    cycleQuantity: number | null;
    timeUnit: string | null;
    duplicateFlag: string | null;
    spId: number;
    expOff: number | null;
    expTimeUnit: string | null;
    agreementEffType: string | null;
    prodType: string;
    createdDate?: string; // Add this optional field
  };
  offerVerRequestDto: {
    offerVerId: number;
    offerId: number | null;
    effDate: string;
    expDate: string;
    spId: number;
    state: string;
    refOfferVerId: number;
    offerName: string;
    offerCode: string;
  };
  lifecycleType: string | null;
  lifecyleFlag: string | null; // Fixed: This should be lifecycleFlag
  staffJobId: number;
  actionState: string;
  checkPeriod: boolean;
  spId: number;
  offerId: number | null;
}

export const initialStateAddSubsplan: SubsPlanProps = {
  subsPlanRequestDto: {
    subsPlanId: 0,
    indepProdSpecId: 0, // Fixed: Set default value to 4 like in successful payload
    priority: null,
    effDate: "",
    expDate: "",
    saleFlag: "",
    spId: 0,
    isBundleFlag: "N", // Fixed: Set default value to "N"
    subsPlanCode: "",
    subsPlanName: "",
  },
  offerRequestDto: {
    offerId: null,
    offerType: "7",
    offerName: "",
    comments: "",
    offerCode: "",
    saleListPrice: null,
    rentListPrice: null,
    effDate: "",
    expDate: "",
    effType: "",
    autoContinueFlag: null,
    cycleQuantity: null,
    timeUnit: null,
    duplicateFlag: null,
    spId: 0,
    expOff: null,
    expTimeUnit: null,
    agreementEffType: null,
    prodType: "",
  },
  offerVerRequestDto: {
    offerVerId: 0,
    offerId: null,
    effDate: "",
    expDate: "",
    spId: 0,
    state: "A",
    refOfferVerId: 0,
    offerName: "",
    offerCode: "",
  },
  lifecycleType: null,
  lifecyleFlag: null,
  staffJobId: 0,
  actionState: "NEW",
  checkPeriod: false,
  spId: 0,
  offerId: null,
};

const API_URL_OFFER = apiConfigOffer.offer;

const AddDialogSubsPlan: React.FC<AddDialogSubsPlanProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<SubsPlanProps>(initialStateAddSubsplan);
  const {
    showAddDialogSubsPlan,
    handleAddDialogSubsPlan,
    selectedCategoryId,
    refreshCategorySidebar,
    setRefreshOfferListSidebar,
    selectedIndepProdSpecId,
    closeAddDialogSubsPlan,
    refreshDataGrid,
    fetchSubscriptionPlans,
    refreshSubsPlanSection,
    setShowAddDialogSubsPlan,
    showDetailView,
    selectedDetailSideBar,
    selectedCategory,
  } = useSubscriptionPlanOfferListContext();
  const { PostData, GetData } = useCallApi();
  // const { reload } = useDataGrid();
  const parsedUser = getAuth()?.user;
  const [forceReset, setForceReset] = useState(0);
  const [lifecycleType, setLifecycleType] = useState<lifecycleType[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [verCopyForm, setVerCopyForm] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verOpen, setVerOpen] = useState(false);

  const fetchVersionCopy = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchSubscriptionPlans(String(selectedIndepProdSpecId));
      setVerCopyForm(result ?? []);
    } catch (error: any) {
      console.error("❌ fetchVersionCopy error:", error);
      setError(error?.message ?? "Failed to fetch version copy form");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialStateAddSubsplan);
    setErrors({});
    setAlert({ show: false, message: "" });
  };

  useEffect(() => {
    if (showAddDialogSubsPlan) {
      setFormData((prev) => ({
        ...prev,
        subsPlanRequestDto: {
          ...prev.subsPlanRequestDto,
          indepProdSpecId: selectedIndepProdSpecId || Number(selectedCategoryId) || 0,
        },
      }));

      fetchLifecycleType(formData.offerRequestDto.spId);
    }
  }, [showAddDialogSubsPlan, selectedIndepProdSpecId, selectedCategoryId]);

  function setNestedValue(obj: any, path: string[], value: any): any {
    if (path.length === 1) {
      return { ...obj, [path[0]]: value };
    }
    const [head, ...rest] = path;
    return {
      ...obj,
      [head]: setNestedValue(obj?.[head] ?? {}, rest, value),
    };
  }

  const handleInputChange = (field: string, value: any) => {
    const path = field.split(".");

    setFormData((prev) => setNestedValue(prev, path, value));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const fetchLifecycleType = async (spId: number) => {
    try {
      const response = await GetData(`${API_URL_OFFER}/offer/common/qry-lifecycle-type`, {
        lifecycleType: "",
        spId: spId,
      });
      if (response?.data) {
        setLifecycleType(response?.data);
      }
    } catch (error) {
      toast.error("Error GET Service Type data");
    }
  };

  const validateForm = () => {
    const requiredFields = [
      { key: "offerRequestDto.offerName", label: "Plan Name", getValue: () => formData.offerRequestDto.offerName },
      { key: "offerRequestDto.offerCode", label: "Plan Code", getValue: () => formData.offerRequestDto.offerCode },
      { key: "offerRequestDto.effDate", label: "Effective Date", getValue: () => formData.offerRequestDto.effDate },
      { key: "subsPlanRequestDto.priority", label: "Priority", getValue: () => formData.subsPlanRequestDto.priority },
      { key: "offerVerRequestDto.effDate", label: "Version Date", getValue: () => formData.offerVerRequestDto.effDate },
    ];

    const newErrors: Record<string, string> = {};
    let isValid = true;

    requiredFields.forEach(({ key, label, getValue }) => {
      const value = getValue();
      const isEmpty = value === "" || value === null || value === undefined;

      if (isEmpty) {
        newErrors[key] = `${label} is required`;
        isValid = false;
      }
    });

    if (formData.offerRequestDto.autoContinueFlag === "Y") {
      if (!formData.offerRequestDto.cycleQuantity) {
        newErrors["offerRequestDto.cycleQuantity"] = "Agreement Period is required";
        isValid = false;
      }
      if (!formData.offerRequestDto.timeUnit) {
        newErrors["offerRequestDto.timeUnit"] = "Time Unit is required";
        isValid = false;
      }
    }

    if (!formData.subsPlanRequestDto.saleFlag) {
      setFormData((prev) => ({
        ...prev,
        subsPlanRequestDto: { ...prev.subsPlanRequestDto, saleFlag: "0" },
        offerRequestDto: { ...prev.offerRequestDto, saleFlag: "0" },
      }));
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setAlert({ show: false, message: "" });

      try {
        const payload = {
          spId: formData.spId,
          checkPeriod: formData.checkPeriod,
          actionState: formData.actionState,
          staffJobId: formData.staffJobId,
          lifecycleType: formData.lifecycleType,
          lifecycleFlag: formData.lifecyleFlag,
          subsPlanRequestDto: {
            indepProdSpecId: formData.subsPlanRequestDto.indepProdSpecId,
            priority: formData.subsPlanRequestDto.priority,
            effDate: formData.subsPlanRequestDto.effDate,
            isBundleFlag: formData.subsPlanRequestDto.isBundleFlag,
            subsPlanCode: formData.subsPlanRequestDto.subsPlanCode,
            subsPlanName: formData.subsPlanRequestDto.subsPlanName,
            saleFlag: formData.subsPlanRequestDto.saleFlag || "0",
            ...(formData.subsPlanRequestDto.expDate && { expDate: formData.subsPlanRequestDto.expDate }),
          },

          offerRequestDto: {
            offerType: formData.offerRequestDto.offerType,
            offerName: formData.offerRequestDto.offerName,
            offerCode: formData.offerRequestDto.offerCode,
            effDate: formData.offerRequestDto.effDate,
            spId: formData.spId,
            createdDate: new Date().toISOString().split("T")[0],
            ...(formData.offerRequestDto.expDate && { expDate: formData.offerRequestDto.expDate }),
            ...(formData.offerRequestDto.comments && { comments: formData.offerRequestDto.comments }),
            ...(formData.offerRequestDto.prodType && { prodType: formData.offerRequestDto.prodType }),
            ...(formData.offerRequestDto.autoContinueFlag && {
              autoContinueFlag: formData.offerRequestDto.autoContinueFlag,
            }),
            ...(formData.offerRequestDto.agreementEffType && {
              agreementEffType: formData.offerRequestDto.agreementEffType,
            }),
            ...(formData.offerRequestDto.cycleQuantity && { cycleQuantity: formData.offerRequestDto.cycleQuantity }),
            ...(formData.offerRequestDto.timeUnit && { timeUnit: formData.offerRequestDto.timeUnit }),
          },
          offerVerRequestDto: {
            effDate: formData.offerVerRequestDto.effDate,
            ...(formData.offerVerRequestDto.expDate && { expDate: formData.offerVerRequestDto.expDate }),
          },
        };

        const response = await PostData(`${API_URL_OFFER}/offer/subs-plan/add-subs-plan-and-ver`, payload);

        if (response?.status) {
          toast.success("Subscription Plan created successfully!");
          resetForm();

          setShowAddDialogSubsPlan(false);

          await new Promise((resolve) => setTimeout(resolve, 100));

          if (selectedIndepProdSpecId) {
            await fetchSubscriptionPlans(selectedIndepProdSpecId.toString());
          }

          refreshSubsPlanSection();

          setRefreshOfferListSidebar(selectedCategoryId);
        } else {
          const errorMessage = response?.message || "Failed to create Main Product. Please try again.";
          toast.error(errorMessage);
          setAlert({
            show: true,
            message: errorMessage,
          });
          console.error("❌ API returned error:", response);
        }
      } catch (error: any) {
        const errorMessage = error?.message || "Something went wrong. Please try again.";
        console.error("❌ Error creating main product:", error);
        toast.error(errorMessage);
        setAlert({
          show: true,
          message: errorMessage,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, selectedIndepProdSpecId, PostData]
  );

  const handleDialogClose = (open: boolean) => {
    if (!open && !isSubmitting) {
      setShowAddDialogSubsPlan(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      setShowAddDialogSubsPlan(false);
    }
  };

  return (
    <Dialog open={showAddDialogSubsPlan} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-6xl w-full p-3 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg">Add Subscription Plan</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <DialogBody className="max-h-[75vh] overflow-y-auto">
          {alert.show && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{alert.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="form-label pb-2">
                    Plan Name<span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.offerRequestDto.offerName}
                    onChange={(e) => {
                      handleInputChange("offerRequestDto.offerName", e.target.value);
                      // Fixed: Also update subsPlanName when offerName changes
                      handleInputChange("subsPlanRequestDto.subsPlanName", e.target.value);
                    }}
                    disabled={isSubmitting}
                    placeholder="Enter Offer name"
                    className={errors["offerRequestDto.offerName"] ? "border-red-500" : ""}
                  />
                  {errors["offerRequestDto.offerName"] && (
                    <p className="text-red-500 text-xs mt-1">{errors["offerRequestDto.offerName"]}</p>
                  )}
                </div>

                {/* Life Cycle Type */}
                <div className="flex-col space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Lifecycle Type</label>
                  <div className="flex flex-row">
                    <Select
                      value={formData.lifecycleType || ""}
                      onValueChange={(value) => {
                        handleInputChange("lifecycleType", value);
                      }}
                      disabled
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Lifecycle Type" />
                      </SelectTrigger>
                      <SelectContent side="bottom" className="max-h-60 overflow-y-auto">
                        {lifecycleType.map((type) => (
                          <SelectItem key={type.lifecycleType} value={type.lifecycleType.toString()}>
                            {type.lifecycleTypeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Tombol Clear */}
                    {formData.lifecycleType && (
                      <button
                        type="button"
                        onClick={() => handleInputChange("lifecycleType", null)}
                        className="p-2 rounded-md hover:bg-gray-100 transition"
                        title="Clear"
                      >
                        <KeenIcon icon="cross" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Effective Date */}
                <div>
                  <label className="form-label pb-2">
                    Effective Date<span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.offerRequestDto.effDate}
                    onChange={(e) => {
                      handleInputChange("offerRequestDto.effDate", e.target.value);
                      handleInputChange("subsPlanRequestDto.effDate", e.target.value);
                    }}
                    disabled={isSubmitting}
                    className={errors["offerRequestDto.effDate"] ? "border-red-500" : ""}
                  />
                  {errors["offerRequestDto.effDate"] && (
                    <p className="text-red-500 text-xs mt-1">{errors["offerRequestDto.effDate"]}</p>
                  )}
                </div>

                {/* Plan Code */}
                <div>
                  <label className="form-label pb-2">
                    Plan Code<span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.offerRequestDto.offerCode}
                    onChange={(e) => {
                      handleInputChange("offerRequestDto.offerCode", e.target.value);
                      // Fixed: Also update subsPlanCode when offerCode changes
                      handleInputChange("subsPlanRequestDto.subsPlanCode", e.target.value);
                    }}
                    disabled={isSubmitting}
                    placeholder="Enter code"
                    className={errors["offerRequestDto.offerCode"] ? "border-red-500" : ""}
                  />
                  {errors["offerRequestDto.offerCode"] && (
                    <p className="text-red-500 text-xs mt-1">{errors["offerRequestDto.offerCode"]}</p>
                  )}
                </div>

                {/* Agreement efftype */}
                <div className="flex-col">
                  <label className="form-label pb-2">Agreement Effective Type</label>
                  <div className="flex flex-row">
                    <Select
                      value={formData.offerRequestDto.agreementEffType || ""}
                      onValueChange={(value) => {
                        handleInputChange("offerRequestDto.agreementEffType", value);
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Agreement Effective Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Next Day</SelectItem>
                        <SelectItem value="2">Next Month</SelectItem>
                        <SelectItem value="3">Next Billing Cycle</SelectItem>
                        <SelectItem value="4">Today 0:00</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Tombol Clear */}
                    {formData.offerRequestDto.agreementEffType && (
                      <button
                        type="button"
                        onClick={() => handleInputChange("offerRequestDto.agreementEffType", null)}
                        className="p-2 rounded-md hover:bg-gray-100 transition"
                        title="Clear"
                      >
                        <KeenIcon icon="cross" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="form-label pb-2">Remarks</label>
                  <textarea
                    value={formData.offerRequestDto.comments}
                    onChange={(e) => handleInputChange("offerRequestDto.comments", e.target.value)}
                    className="w-full input h-10 p-2"
                    placeholder="Enter comments..."
                    disabled={isSubmitting}
                  />
                </div>

                {/* Version Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version Date <span className="text-red-500">*</span>
                  </label>

                  {/* Dua input sejajar */}
                  <div className="flex gap-2">
                    {/* Effective Date */}
                    <div className="w-1/2">
                      <input
                        type="date"
                        value={formData.offerVerRequestDto.effDate}
                        onChange={(e) => handleInputChange("offerVerRequestDto.effDate", e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors["offerVerRequestDto.effDate"] ? "border-red-500" : "border-gray-300"}`}
                        disabled={isSubmitting}
                      />
                      {errors["offerVerRequestDto.effDate"] && (
                        <p className="text-red-500 text-xs mt-1">{errors["offerVerRequestDto.effDate"]}</p>
                      )}
                    </div>

                    <label className="mt-2">-</label>

                    {/* Expired Date */}
                    <div className="w-1/2">
                      <input
                        type="date"
                        value={formData.offerVerRequestDto.expDate}
                        onChange={(e) => handleInputChange("offerVerRequestDto.expDate", e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors["offerVerRequestDto.expDate"] ? "border-red-500" : "border-gray-300"}`}
                        disabled={isSubmitting}
                      />
                      {errors["offerVerRequestDto.expDate"] && (
                        <p className="text-red-500 text-xs mt-1">{errors["offerVerRequestDto.expDate"]}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Sale Type */}
                <div className="flex-col">
                  <label className="form-label pb-2">Sale Type</label>
                  <div className="flex flex-row">
                    <Select
                      value={formData.subsPlanRequestDto.saleFlag}
                      onValueChange={(value) => {
                        handleInputChange("subsPlanRequestDto.saleFlag", value);
                        handleInputChange("offerRequestDto.saleFlag", value);
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Sale Flag" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0" className="cursor-pointer">
                          Sold Unlimitedly
                        </SelectItem>
                        <SelectItem value="1" className="cursor-pointer">
                          Sold Separately
                        </SelectItem>
                        <SelectItem value="2" className="cursor-pointer">
                          Sold in Bundle
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Tombol Clear */}
                    {formData.subsPlanRequestDto.saleFlag && (
                      <button
                        type="button"
                        onClick={() => handleInputChange("subsPlanRequestDto.saleFlag", null)}
                        className="p-2 rounded-md hover:bg-gray-100 transition"
                        title="Clear"
                      >
                        <KeenIcon icon="cross" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Agreement Period */}
                <div>
                  <label className="form-label pb-2">
                    Agreement Period
                    {formData.offerRequestDto.autoContinueFlag === "Y" && <span className="text-red-600">*</span>}
                  </label>
                  <div className="flex gap-2">
                    <div className="w-2/3">
                      <NumericFormat
                        key={`cycle-quantity-${forceReset}`}
                        value={formData.offerRequestDto.cycleQuantity ?? null}
                        thousandSeparator="."
                        decimalSeparator=","
                        allowNegative={false}
                        onValueChange={(values) =>
                          handleInputChange("offerRequestDto.cycleQuantity", values.floatValue ?? 0)
                        }
                        placeholder="Input Agreement Period"
                        disabled={isSubmitting}
                        className={`w-full input ${errors["offerRequestDto.cycleQuantity"] ? "border-red-500" : ""}`}
                      />
                    </div>
                    <div className="flex flex-row w-1/3">
                      <Select
                        value={formData.offerRequestDto.timeUnit || ""}
                        onValueChange={(value) => {
                          handleInputChange("offerRequestDto.timeUnit", value);
                        }}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className={errors["offerRequestDto.timeUnit"] ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select Time Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Y">Year</SelectItem>
                          <SelectItem value="M">Month</SelectItem>
                          <SelectItem value="W">Week</SelectItem>
                          <SelectItem value="D">Day</SelectItem>
                          <SelectItem value="H">Hour</SelectItem>
                          <SelectItem value="C">Billing Cycle</SelectItem>
                          <SelectItem value="S">Exact Time</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* Tombol Clear */}
                      {formData.offerRequestDto.timeUnit && (
                        <button
                          type="button"
                          onClick={() => handleInputChange("offerRequestDto.timeUnit", null)}
                          className="p-2 rounded-md hover:bg-gray-100 transition"
                          title="Clear"
                        >
                          <KeenIcon icon="cross" />
                        </button>
                      )}
                    </div>
                  </div>
                  {(errors["offerRequestDto.cycleQuantity"] || errors["offerRequestDto.timeUnit"]) && (
                    <p className="text-red-500 text-xs w-full">
                      {errors["offerRequestDto.cycleQuantity"] || errors["offerRequestDto.timeUnit"]}
                    </p>
                  )}
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="form-label pb-2">Expiry Date</label>
                  <Input
                    type="date"
                    value={formData.offerRequestDto.expDate}
                    onChange={(e) => {
                      handleInputChange("offerRequestDto.expDate", e.target.value);
                      // Fixed: Also update subsPlanRequestDto expDate
                      handleInputChange("subsPlanRequestDto.expDate", e.target.value);
                    }}
                    disabled={isSubmitting}
                    className={errors["offerRequestDto.expDate"] ? "border-red-500" : ""}
                  />
                  {/* {errors["offerRequestDto.expDate"] && <p className="text-red-500 text-xs mt-1">{errors["offerRequestDto.expDate"]}</p>} */}
                </div>

                {/* Priority */}
                <div>
                  <label className="form-label pb-2">
                    Priority<span className="text-red-500">*</span>
                  </label>
                  <NumericFormat
                    key={`priority-${forceReset}`}
                    value={formData.subsPlanRequestDto.priority ?? null}
                    thousandSeparator="."
                    decimalSeparator=","
                    allowNegative={false}
                    onValueChange={(values) => {
                      const newValue = values.floatValue === undefined ? null : values.floatValue;
                      handleInputChange("subsPlanRequestDto.priority", newValue);
                    }}
                    placeholder="Input Priority"
                    disabled={isSubmitting}
                    className={`w-full input ${errors["subsPlanRequestDto.priority"] ? "border-red-500" : ""}`}
                  />
                  {errors["subsPlanRequestDto.priority"] && (
                    <p className="text-red-500 text-xs mt-1">{errors["subsPlanRequestDto.priority"]}</p>
                  )}
                </div>

                {/* Renewal */}
                <div>
                  <label className="form-label pb-2">Renewal</label>
                  <div className="inline-block">
                    <div
                      className={`flex gap-4 p-2 border rounded-md ${errors["offerRequestDto.autoContinueFlag"] ? "border-red-500" : "border-gray-300"}`}
                    >
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          name="autoContinueFlag"
                          value="Y"
                          checked={formData.offerRequestDto.autoContinueFlag === "Y"}
                          onChange={(e) =>
                            handleInputChange("offerRequestDto.autoContinueFlag", e.target.checked ? "Y" : "")
                          }
                          disabled={isSubmitting}
                          className="mr-2"
                        />
                        Automatic Renewal
                      </label>
                    </div>
                    {errors["offerRequestDto.autoContinueFlag"] && (
                      <p className="text-red-500 text-xs mt-1">{errors["offerRequestDto.autoContinueFlag"]}</p>
                    )}
                  </div>
                </div>

                {/* Product Line */}
                <div className="flex-col">
                  <label className="form-label pb-2">Product Line</label>
                  <div className="flex flex-row">
                    <Select
                      value={formData.offerRequestDto.prodType}
                      onValueChange={(value) => {
                        // if (value === "clear") {
                        //   handleInputChange("offerRequestDto.prodType", null);
                        // } else {
                        handleInputChange("offerRequestDto.prodType", value);
                        // }
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Product Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="F">Fix</SelectItem>
                        <SelectItem value="M">Mobile</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Tombol Clear */}
                    {formData.offerRequestDto.prodType && (
                      <button
                        type="button"
                        onClick={() => handleInputChange("offerRequestDto.prodType", null)}
                        className="p-2 rounded-md hover:bg-gray-100 transition"
                        title="Clear"
                      >
                        <KeenIcon icon="cross" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Version Copy From */}
                <div className="flex-col">
                  <label className="form-label pb-2">Version Copy From</label>
                  <div className="flex flex-row">
                    <Popover
                      open={verOpen}
                      onOpenChange={(open) => {
                        setVerOpen(open);
                        if (open && verCopyForm?.length === 0 && !loading) {
                          fetchVersionCopy();
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={`w-full flex items-center justify-between input text-left ${errors.offerId ? "border-red-500" : ""}`}
                          disabled={loading}
                        >
                          {loading
                            ? "Loading subscription plans..."
                            : (() => {
                                const selected = verCopyForm?.find((p) => p.offerId === formData.offerId);
                                return selected ? selected.offerName : "Select Subscription Plan";
                              })()}

                          <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                        </button>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        <Command>
                          <CommandInput placeholder="Search subscription plan..." />
                          <CommandList className="max-h-[200px] overflow-y-auto pointer-events-auto">
                            <CommandEmpty>{loading ? "Loading..." : "No subscription plan found."}</CommandEmpty>
                            <CommandGroup>
                              {verCopyForm?.map((plan) => (
                                <CommandItem
                                  key={plan.subsPlanId}
                                  value={plan.offerName}
                                  onSelect={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      offerId: plan.offerId, // untuk header
                                      offerName: plan.offerName, // untuk display
                                      offerVerRequestDto: {
                                        ...prev.offerVerRequestDto,
                                        offerId: plan.offerId,
                                      },
                                    }));
                                    setErrors((prev) => ({ ...prev, offerId: "" }));
                                    setVerOpen(false);
                                  }}
                                >
                                  <span>{plan.offerName}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Button Clear terpisah */}
                    {formData.offerId && (
                      <button
                        type="button"
                        className="p-2 rounded-md hover:bg-gray-100 transition"
                        title="Clear"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            offerId: null,
                            offerName: null,
                            offerVerRequestDto: {
                              ...prev.offerVerRequestDto,
                              offerId: null,
                            },
                          }));
                        }}
                      >
                        <KeenIcon icon="cross" />
                      </button>
                    )}
                  </div>

                  {errors.subsPlanId && <span className="text-red-500 text-xs mt-1">{errors.subsPlanId}</span>}
                  {error && (
                    <span className="text-red-500 text-xs mt-1">Error loading subscription plans: {error}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default AddDialogSubsPlan;
