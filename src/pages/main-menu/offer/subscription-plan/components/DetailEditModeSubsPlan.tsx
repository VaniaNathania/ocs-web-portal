import React, { useState } from "react";
import { Save, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MdKeyboardArrowDown } from "react-icons/md";
import SubscriptionPlanSection from "./SubscriptionPlanSection";
import { NumericFormat } from "react-number-format";
import { DetailDataProps } from "./DetailCategoryContent/DetailCategoryContentSubsPlan";
import { SubsPlanProps } from "../blocks/AddDialogSubsPlan";

interface DetailEditModeSubsPlanProps {
  formDataSubsPlan?: SubsPlanProps | null;
  errors: Record<string, string>;
  isSubmitting: boolean;
  lifecycleType: any[];
  selectedEffType: string[];
  effTypeOpen: boolean;
  onInputChange: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  onCancel: () => void;
  setSelectedEffType: React.Dispatch<React.SetStateAction<string[]>>;
  setEffTypeOpen: React.Dispatch<React.SetStateAction<boolean>>;
  rowData: any;
}

const effectiveType = [
  { label: "Special Day", value: "A" },
  { label: "Instant", value: "B" },
  { label: "Next Day", value: "C" },
  { label: "Next Week", value: "D" },
  { label: "Next Month", value: "E" },
  { label: "Next Billing Cycle", value: "F" },
  { label: "The Cycle After Next Cycle", value: "G" },
  { label: "Special Time", value: "H" },
];

const DetailEditModeSubsPlan: React.FC<DetailEditModeSubsPlanProps> = ({ formDataSubsPlan, errors, isSubmitting, lifecycleType, selectedEffType, effTypeOpen, onInputChange, onSubmit, onCancel, setSelectedEffType, setEffTypeOpen, rowData }) => {
  const [forceReset, setForceReset] = useState(0);

  return (
    <div>
      {/* Error display */}
      {Object.keys(errors).length > 0 && <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">Please fill in all required fields</div>}

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Plan Name */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-center">
              <label className="w-40 text-sm font-medium text-gray-700">
                Plan Name<span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="w-full">
                <Input
                  value={formDataSubsPlan?.offerRequestDto.offerName}
                  onChange={(e) =>
                    onInputChange("offerRequestDto", {
                      ...formDataSubsPlan?.offerRequestDto,
                      offerName: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  placeholder="Enter product name"
                  className={errors["offerRequestDto.offerName"] ? "border-red-500" : ""}
                />
                {errors["offerRequestDto.offerName"] && <p className="text-red-500 text-xs mt-1">{errors["offerRequestDto.offerName"]}</p>}
              </div>
            </div>

            {/* Lifecycle Type */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-center">
              <label className="w-40 text-sm font-medium text-gray-700">Lifecycle Type</label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <Select
                // value={formDataSubsPlan?.lifecycleType ? String(formDataSubsPlan?.lifecycleType) : ""}
                onValueChange={(value) => onInputChange("lifecycleType", value)}
                disabled
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Lifecycle Type" />
                </SelectTrigger>
                <SelectContent>
                  {lifecycleType.map((type) => (
                    <SelectItem key={type.lifecycleType} value={type.lifecycleType.toString()}>
                      {type.lifecycleTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Effective Date */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-center">
              <label className="w-40 text-sm font-medium text-gray-700">
                Effective Date<span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
                <input
                  type="date"
                  value={formDataSubsPlan?.offerRequestDto.effDate}
                  onChange={(e) =>
                    onInputChange("offerRequestDto", {
                      ...formDataSubsPlan?.offerRequestDto,
                      effDate: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  className={`border border-gray-300 p-1 px-2 py-2 rounded-md text-sm ${errors["offerRequestDto.effDate"] ? "border-red-500" : ""}`}
                />
                {errors["offerRequestDto.effDate"] && <p className="text-red-500 text-xs mt-1">{errors["offerRequestDto.effDate"]}</p>}
            </div>

            {/* Plan Code */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-center">
              <label className="w-40 text-sm font-medium text-gray-700">
                Plan Code<span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="w-full">
                <Input
                  value={formDataSubsPlan?.offerRequestDto.offerCode}
                  onChange={(e) =>
                    onInputChange("offerRequestDto", {
                      ...formDataSubsPlan?.offerRequestDto,
                      offerCode: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  placeholder="Enter code"
                  className={errors["offerRequestDto.offerCode"] ? "border-red-500" : ""}
                />
                {errors["offerRequestDto.offerCode"] && <p className="text-red-500 text-xs mt-1">{errors["offerRequestDto.offerCode"]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-center">
              <label className="w-40 text-sm font-medium text-gray-700">
                Agreement Effective Type<span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <Select
                value={formDataSubsPlan?.offerRequestDto.agreementEffType || ""}
                onValueChange={(value) =>
                  onInputChange("offerRequestDto", {
                    ...formDataSubsPlan?.offerRequestDto,
                    agreementEffType: value,
                  })
                }
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
            </div>

            {/* Remarks */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-center">
              <label className="w-40 text-sm font-medium text-gray-700">Remarks</label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <textarea
                value={formDataSubsPlan?.offerRequestDto.comments ?? "-"}
                onChange={(e) =>
                  onInputChange("offerRequestDto", {
                    ...formDataSubsPlan?.offerRequestDto,
                    comments: e.target.value,
                  })
                }
                className="w-full input h-24 p-2"
                placeholder="Enter comments..."
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Sale Type */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-center">
              <label className="w-40 text-sm font-medium text-gray-700">Sale Type</label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <Select
                value={formDataSubsPlan?.subsPlanRequestDto.saleFlag}
                onValueChange={(value) =>
                  onInputChange("subsPlanRequestDto", {
                    ...formDataSubsPlan?.subsPlanRequestDto,
                    saleFlag: value,
                  })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Brand Price Plan" />
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
            </div>

            {/* Agreement Period */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-center">
              <label className="w-40 text-sm font-medium text-gray-700">
                Agreement Period
                {formDataSubsPlan?.offerRequestDto.autoContinueFlag === "Y" && <span className="text-red-600">*</span>}
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>

              {/* Field input */}
              <div className="flex flex-col gap-1 w-full">
                <div className="flex gap-2">
                  {/* cycleQuantity */}
                  <div className="w-2/3">
                    <NumericFormat key={`cycle-quantity-${forceReset}`} value={formDataSubsPlan?.offerRequestDto.cycleQuantity ?? null} thousandSeparator="." decimalSeparator="," allowNegative={false} onValueChange={(values) => onInputChange("offerRequestDto", { ...formDataSubsPlan?.offerRequestDto, cycleQuantity: values.floatValue })} placeholder="Input Agreement Period" disabled={isSubmitting} className={`w-full input ${errors["offerRequestDto.cycleQuantity"] ? "border-red-500" : ""}`} />
                  </div>

                  {/* timeUnit */}
                  <div className="w-1/3">
                    <Select
                      value={formDataSubsPlan?.offerRequestDto.timeUnit || ""}
                      onValueChange={(value) =>
                        onInputChange("offerRequestDto", {
                          ...formDataSubsPlan?.offerRequestDto,
                          timeUnit: value,
                        })
                      }
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
                  </div>
                </div>

                {/* error text full width */}
                {(errors["offerRequestDto.cycleQuantity"] || errors["offerRequestDto.timeUnit"]) && <p className="text-red-500 text-xs w-full">{errors["offerRequestDto.cycleQuantity"] || errors["offerRequestDto.timeUnit"]}</p>}
              </div>
            </div>

            {/* Expired Date */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-center">
              <label className="w-40 text-sm font-medium text-gray-700">Expired Date</label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <input
                type="date"
                className="border border-gray-300 p-1 px-2 py-2 rounded-md text-sm"
                value={formDataSubsPlan?.offerRequestDto.expDate}
                onChange={(e) =>
                  onInputChange("offerRequestDto", {
                    ...formDataSubsPlan?.offerRequestDto,
                    expDate: e.target.value,
                  })
                }
                disabled={isSubmitting}
              />
            </div>

            {/* Priority */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-center">
              <label className="w-40 text-sm font-medium text-gray-700">
                Priority<span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="w-full">
                <Input
                  value={formDataSubsPlan?.subsPlanRequestDto.priority || ""}
                  onChange={(e) =>
                    onInputChange("subsPlanRequestDto", {
                      ...formDataSubsPlan?.subsPlanRequestDto,
                      priority: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                  placeholder="Enter priority"
                  className={errors["subsPlanRequestDto.priority"] ? "border-red-500" : ""}
                />
                {errors["subsPlanRequestDto.priority"] && <p className="text-red-500 text-xs mt-1">{errors["subsPlanRequestDto.priority"]}</p>}
              </div>
            </div>

            {/* Renewal */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-center">
              <label className="w-40 text-sm font-medium text-gray-700">Renewal</label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="inline-block">
                <div className={`flex gap-4 p-2 border rounded-md ${errors["offerRequestDto.autoContinueFlag"] ? "border-red-500" : "border-gray-300"}`}>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      name="autoContinueFlag"
                      value="Y"
                      checked={formDataSubsPlan?.offerRequestDto.autoContinueFlag === "Y"}
                      onChange={(e) =>
                        onInputChange("offerRequestDto", {
                          ...formDataSubsPlan?.offerRequestDto,
                          autoContinueFlag: e.target.checked ? "Y" : "",
                        })
                      }
                      disabled={isSubmitting}
                      className="mr-2"
                    />
                    Automatic Renewal
                  </label>
                </div>
                {errors["offerRequestDto.autoContinueFlag"] && <p className="text-red-500 text-xs mt-1">{errors["offerRequestDto.autoContinueFlag"]}</p>}
              </div>
            </div>

            {/* Product Line */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-center">
              <label className="w-40 text-sm font-medium text-gray-700">Product Line</label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <Select
                value={formDataSubsPlan?.offerRequestDto?.prodType || ""}
                onValueChange={(value) =>
                  onInputChange("offerRequestDto", {
                    ...formDataSubsPlan?.offerRequestDto,
                    prodType: value,
                  })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Product Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="F">Fixed</SelectItem>
                  <SelectItem value="M">Mobile</SelectItem>
                </SelectContent>
              </Select>
              {errors["prodType"] && <p className="text-red-500 text-xs mt-1">{errors["prodType"]}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-normal text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2" disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-sm font-normal text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Subscription Plan Section */}
      {/* <SubscriptionPlanSection rowData={rowData} /> */}
    </div>
  );
};

export default DetailEditModeSubsPlan;
