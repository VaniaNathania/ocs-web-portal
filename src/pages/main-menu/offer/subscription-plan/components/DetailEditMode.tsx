import React from "react";
import { Save, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MdKeyboardArrowDown } from "react-icons/md";
import SubscriptionPlanSection from "./SubscriptionPlanSection";

interface FormData {
  offer: {
    offerType: string;
    offerName: string;
    comments: string;
    offerCode: string;
    effDate: string;
    expDate: string;
    effType: string;
    prodType: string;
    spId: number;
    brandPricePlanId?: string;
  };
  servType: string;
  paidFlag: string;
  lifecycleType: string;
  offerCatgId: string;
  prodType: string;
}

interface DetailEditModeProps {
  formData: FormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  serviceType: any[];
  lifecycleType: any[];
  selectedEffType: string[];
  effTypeOpen: boolean;
  onInputChange: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
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

const DetailEditMode: React.FC<DetailEditModeProps> = ({
  formData,
  errors,
  isSubmitting,
  serviceType,
  lifecycleType,
  selectedEffType,
  effTypeOpen,
  onInputChange,
  onSubmit,
  onCancel,
  setSelectedEffType,
  setEffTypeOpen,
  rowData,
}) => {
  //  console.log(formData);
  return (
    <div>
      {/* Error display */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
          Please fill in all required fields
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Product Name */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
              <label className="w-40 text-sm font-medium text-gray-700">
                Main Product Name<span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="w-full">
                <Input
                  value={formData.offer.offerName}
                  onChange={(e) =>
                    onInputChange("offer.offerName", e.target.value)
                  }
                  disabled={isSubmitting}
                  placeholder="Enter product name"
                  className={errors["offer.offerName"] ? "border-red-500" : ""}
                />
                {errors["offer.offerName"] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors["offer.offerName"]}
                  </p>
                )}
              </div>
            </div>

            {/* Product Code */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
              <label className="w-40 text-sm font-medium text-gray-700">
                Main Product Code<span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="w-full">
                <Input
                  value={formData.offer.offerCode}
                  onChange={(e) =>
                    onInputChange("offer.offerCode", e.target.value)
                  }
                  disabled={isSubmitting}
                  placeholder="Enter code"
                  className={errors["offer.offerCode"] ? "border-red-500" : ""}
                />
                {errors["offer.offerCode"] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors["offer.offerCode"]}
                  </p>
                )}
              </div>
            </div>

            {/* Service Type */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
              <label className="w-40 text-sm font-medium text-gray-700">
                Service Type<span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="w-full">
                <Select
                  value={formData.servType || ""}
                  onValueChange={(value) => onInputChange("servType", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    className={`w-full ${errors["servType"] ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select Service Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceType.map((type) => (
                      <SelectItem
                        key={type.servType}
                        value={type.servType.toString()}
                      >
                        {type.servTypeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors["servType"] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors["servType"]}
                  </p>
                )}
              </div>
            </div>

            {/* Lifecycle Type */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
              <label className="w-40 text-sm font-medium text-gray-700">
                Lifecycle Type
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <Select
                value={formData.lifecycleType || ""}
                onValueChange={(value) => onInputChange("lifecycleType", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Lifecycle Type" />
                </SelectTrigger>
                <SelectContent>
                  {lifecycleType.map((type) => (
                    <SelectItem
                      key={type.lifecycleType}
                      value={type.lifecycleType.toString()}
                    >
                      {type.lifecycleTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Comments */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
              <label className="w-40 text-sm font-medium text-gray-700">
                Comments
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <textarea
                value={formData.offer.comments}
                onChange={(e) =>
                  onInputChange("offer.comments", e.target.value)
                }
                className="w-full input h-24 p-2"
                placeholder="Enter comments..."
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Effective Date */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
              <label className="w-40 text-sm font-medium text-gray-700">
                Effective Date<span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="w-full">
                <Input
                  type="date"
                  value={formData.offer.effDate}
                  onChange={(e) =>
                    onInputChange("offer.effDate", e.target.value)
                  }
                  disabled={isSubmitting}
                  className={errors["offer.effDate"] ? "border-red-500" : ""}
                />
                {errors["offer.effDate"] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors["offer.effDate"]}
                  </p>
                )}
              </div>
            </div>

            {/* Expired Date */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
              <label className="w-40 text-sm font-medium text-gray-700">
                Expired Date
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <Input
                type="date"
                value={formData.offer.expDate}
                onChange={(e) => onInputChange("offer.expDate", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Effective Type */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
              <label className="w-40 text-sm font-medium text-gray-700">
                Effective Type
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <Popover open={effTypeOpen} onOpenChange={setEffTypeOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full px-2 py-1 text-sm h-10 border border-gray-300 rounded-md flex items-center justify-between"
                  >
                    <span className="truncate w-[85%] text-left">
                      {selectedEffType.length === 0
                        ? "Select Effective Type"
                        : effectiveType
                            .filter((item) =>
                              selectedEffType.includes(item.value),
                            )
                            .map((item) => item.label)
                            .join(" | ")}
                    </span>
                    <MdKeyboardArrowDown className="h-4 w-4 opacity-50" />
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-[520px]">
                  <div className="flex flex-col gap-2">
                    {effectiveType.map((item) => (
                      <label
                        key={item.value}
                        className="flex items-center gap-2 text-md"
                      >
                        <Checkbox
                          checked={selectedEffType.includes(item.value)}
                          onCheckedChange={(checked) => {
                            setSelectedEffType((prev) =>
                              checked
                                ? [...prev, item.value]
                                : prev.filter((val) => val !== item.value),
                            );
                          }}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Paid Flag */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
              <label className="w-40 text-sm font-medium text-gray-700">
                Paid Flag<span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="w-full">
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="paidFlag"
                      value="N"
                      checked={formData.paidFlag === "N"}
                      onChange={(e) =>
                        onInputChange("paidFlag", e.target.value)
                      }
                      disabled={isSubmitting}
                      className="mr-2"
                    />
                    Prepaid
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="paidFlag"
                      value="Y"
                      checked={formData.paidFlag === "Y"}
                      onChange={(e) =>
                        onInputChange("paidFlag", e.target.value)
                      }
                      disabled={isSubmitting}
                      className="mr-2"
                    />
                    Postpaid
                  </label>
                </div>
                {errors["paidFlag"] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors["paidFlag"]}
                  </p>
                )}
              </div>
            </div>

            {/* Brand Price Plan */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
              <label className="w-40 text-sm font-medium text-gray-700">
                Brand Price Plan
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <Select
                value={formData.offer.brandPricePlanId}
                onValueChange={(value) =>
                  onInputChange("offer.brandPricePlanId", value)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Brand Price Plan" />
                </SelectTrigger>
                <SelectContent>
                  {/* Add your brand price plan options here */}
                </SelectContent>
              </Select>
            </div>

            {/* Product Line */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 items-start">
              <label className="w-40 text-sm font-medium text-gray-700">
                Product Line
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <Select
                value={formData.prodType || formData.offer.prodType}
                onValueChange={(value) => {
                  onInputChange("prodType", value);
                  onInputChange("offer.prodType", value);
                }}
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
              {errors["prodType"] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors["prodType"]}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-normal text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-normal text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                disabled={isSubmitting}
              >
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

export default DetailEditMode;
