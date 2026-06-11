import React, { useState } from "react";
import { Check, ChevronDown, Save, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MdKeyboardArrowDown } from "react-icons/md";
import { FormData } from "../components/DetailSubCategorySideBar";
import { effectiveTypeOptions, getEffectiveTypeDisplayText, getSelectedEffectiveTypes } from "../components/types";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { NumericFormat } from "react-number-format";

interface DetailEditModeProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
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

const DetailEditMode: React.FC<DetailEditModeProps> = ({
  formData,
  setFormData,
  errors,
  setErrors,
  isSubmitting,
  serviceType,
  lifecycleType,
  effTypeOpen,
  onInputChange,
  onSubmit,
  onCancel,
  setEffTypeOpen,
}) => {
  const [serviceTypeOpen, setServiceTypeOpen] = React.useState(false);
  const [lifecycleTypeOpen, setLifecycleTypeOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [forceReset, setForceReset] = useState(0);
  const duplicateOrderTitles: Record<string, string> = {
    A: "Dont Allow to Duplicate Order",
    B: "Extend Effective period of original instance from sysdate",
    C: "Add Offer Instance, Don't Change Old Instance",
    D: "Add Offer Instance, Cancel Old Instance",
    E: "Extend Effective period of original instance from ExpDate",
    F: "Add Offer Instance, New Instance EffDate equal Old ExpDate",
  };

  return (
    <div>
      {/* Error display */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
          Please fill in all required fields
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Offer Name */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-700">
                Offer Name<span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="flex-1">
                <Input
                  value={formData.offer.offerName || ""}
                  onChange={(e) => onInputChange("offer.offerName", e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Enter offer name"
                  className={errors["offer.offerName"] ? "border-red-500" : ""}
                />
                {errors["offer.offerName"] && <p className="text-red-500 text-xs mt-1">{errors["offer.offerName"]}</p>}
              </div>
            </div>

            {/* Offer Code */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-700">
                Offer Code<span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="flex-1">
                <Input
                  value={formData.offer.offerCode || ""}
                  onChange={(e) => onInputChange("offer.offerCode", e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Enter offer code"
                  className={errors["offer.offerCode"] ? "border-red-500" : ""}
                />
                {errors["offer.offerCode"] && <p className="text-red-500 text-xs mt-1">{errors["offer.offerCode"]}</p>}
              </div>
            </div>

            {/* Effective Type */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-700">
                Effective Type<span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="flex-1">
                <Popover open={effTypeOpen} onOpenChange={setEffTypeOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full px-2 py-1 text-sm h-10 border rounded-md flex items-center justify-between ${
                        errors["offer.effType"] ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={isSubmitting}
                    >
                      <span className="text-gray-700 truncate w-[85%] overflow-hidden text-ellipsis whitespace-nowrap text-left">
                        {getEffectiveTypeDisplayText(formData.offer.effType)}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    <Command>
                      <CommandList
                        className="max-h-[300px] overflow-y-auto"
                        style={{ touchAction: "pan-y" }}
                        onWheel={(e) => {
                          e.currentTarget.scrollTop += e.deltaY;
                        }}
                      >
                        <CommandEmpty>No Effective Type found.</CommandEmpty>
                        <CommandGroup>
                          {effectiveTypeOptions.map((option) => {
                            const currentSelected = getSelectedEffectiveTypes(formData.offer.effType);
                            const isSelected = currentSelected.includes(option.value);

                            return (
                              <CommandItem
                                key={option.value}
                                value={option.label}
                                onSelect={() => {
                                  const current = getSelectedEffectiveTypes(formData.offer.effType);
                                  const newSelected = isSelected
                                    ? current.filter((t) => t !== option.value)
                                    : [...current, option.value];

                                  setFormData((prev) => ({
                                    ...prev,
                                    offer: {
                                      ...prev.offer,
                                      effType: newSelected.join("|"),
                                    },
                                  }));

                                  if (errors["offer.effType"]) {
                                    setErrors((prev) => ({
                                      ...prev,
                                      ["offer.effType"]: "",
                                    }));
                                  }
                                }}
                                className={`${isSelected ? "bg-accent font-semibold" : ""} text-xs`}
                              >
                                <span className="flex items-center gap-2">
                                  {isSelected && <Check className="w-4 h-4 text-green-600" />}
                                  {option.label}
                                </span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors["offer.effType"] && <p className="text-red-500 text-xs mt-1">{errors["offer.effType"]}</p>}
              </div>
            </div>

            {/* Service Type */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-700">
                Service Type<span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="flex-1">
                <Popover open={serviceTypeOpen} onOpenChange={setServiceTypeOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full px-2 py-1 text-sm max-h-[200px] border rounded-md flex items-center justify-between text-left ${errors.servType ? "border-red-500" : "border-gray-300"}`}
                      title={
                        loading || serviceType.length === 0
                          ? "Loading service types..."
                          : (() => {
                              const servTypeNumber = Number(formData.servType);
                              const selectedService = serviceType.find(
                                (service) => service.servType === servTypeNumber
                              );
                              return selectedService
                                ? `${selectedService.servTypeName} [${selectedService.networkTypeName}]`
                                : "Select Service Type";
                            })()
                      }
                      disabled={loading || serviceType.length === 0}
                    >
                      {loading || serviceType.length === 0
                        ? "Loading service types..."
                        : (() => {
                            const servTypeNumber = Number(formData.servType);
                            const selectedService = serviceType.find((service) => service.servType === servTypeNumber);
                            return selectedService
                              ? `${selectedService.servTypeName} [${selectedService.networkTypeName}]`
                              : "Select Service Type";
                          })()}
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    <Command>
                      <CommandInput placeholder="Search Service Type..." />
                      <CommandList className="max-h-[200px] overflow-y-auto pointer-events-auto">
                        <CommandEmpty>{loading ? "Loading..." : "No Service Type found."}</CommandEmpty>
                        <CommandGroup>
                          {serviceType.map((service) => (
                            <CommandItem
                              key={`${service.servType}-${service.networkType}`}
                              value={`${service.servTypeName} [${service.networkType}]`}
                              className="cursor-pointer text-xs flex items-center gap-2 truncate"
                              onSelect={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  servType: service.servType,
                                  servTypeName: service.servTypeName,
                                  networkType: service.networkType,
                                }));
                                setErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors.servType;
                                  return newErrors;
                                });
                                setServiceTypeOpen(false);
                              }}
                            >
                              <span
                                className="truncate w-full overflow-hidden text-ellipsis whitespace-nowrap"
                                title={`${service.servTypeName} [${service.networkTypeName}]`}
                              >
                                {service.servTypeName} [{service.networkTypeName}]
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors["servType"] && <p className="text-red-500 text-xs mt-1">{errors["servType"]}</p>}
              </div>
            </div>

            {/* Lifecycle Type */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-700">Lifecycle Type</label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="flex-1">
                <Popover open={lifecycleTypeOpen} onOpenChange={setLifecycleTypeOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full px-2 py-1 text-sm h-10 border rounded-md flex items-center justify-between text-left ${errors.lifecycleType ? "border-red-500" : "border-gray-300"}`}
                      disabled={loading}
                    >
                      {loading
                        ? "Loading Lifecycle Type..."
                        : (() => {
                            const selectedLifecycle = lifecycleType.find(
                              (lifecycle) => lifecycle.lifecycleType === Number(formData.lifecycleType)
                            );
                            return selectedLifecycle?.lifecycleTypeName || "Select lifecycle type";
                          })()}
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    <Command>
                      <CommandInput placeholder="Search lifecycle type..." />
                      <CommandList className="max-h-[300px] overflow-y-auto pointer-events-auto">
                        <CommandEmpty>{loading ? "Loading..." : "No lifecycle type found."}</CommandEmpty>
                        <CommandGroup>
                          {lifecycleType.map((lifecycle) => (
                            <CommandItem
                              key={lifecycle.lifecycleType}
                              value={lifecycle.lifecycleTypeName}
                              onSelect={() => {
                                // Fix: Jangan panggil onInputChange yang mungkin memicu validasi
                                setFormData((prev) => ({
                                  ...prev,
                                  lifecycleType: lifecycle.lifecycleType, // Set sebagai number
                                }));

                                // Clear error lifecycle type jika ada
                                if (errors.lifecycleType) {
                                  setErrors((prev) => {
                                    const newErrors = { ...prev };
                                    delete newErrors.lifecycleType;
                                    return newErrors;
                                  });
                                }

                                setLifecycleTypeOpen(false);
                              }}
                            >
                              {lifecycle.lifecycleTypeName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Sale Price */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-700">Sale Price</label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="flex-1">
                <NumericFormat
                  key={`sale-price-${forceReset}`}
                  value={formData.offer.saleListPrice ?? null}
                  thousandSeparator="."
                  decimalSeparator=","
                  allowNegative={false}
                  onValueChange={(values: any) => {
                    const newValue = values.floatValue === undefined ? null : values.floatValue;
                    onInputChange("offer.saleListPrice", newValue);
                  }}
                  placeholder="Input Sale Price"
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors["offer.saleListPrice"] ? "border-red-500" : "border-gray-300"}`}
                />
              </div>
            </div>

            {/* Rent Price */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-700">Rent Price</label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="flex-1">
                <NumericFormat
                  key={`rent-price-${forceReset}`}
                  value={formData.offer.rentListPrice ?? null}
                  thousandSeparator="."
                  decimalSeparator=","
                  allowNegative={false}
                  onValueChange={(values: any) => {
                    const newValue = values.floatValue === undefined ? null : values.floatValue;
                    onInputChange("offer.rentListPrice", newValue);
                  }}
                  placeholder="Input Rent Price"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
              </div>
            </div>

            {/* Duplicate Order */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-700">Duplicate Order</label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="flex-1">
                <Select
                  value={formData.offer.duplicateFlag || ""}
                  onValueChange={(value) => onInputChange("offer.duplicateFlag", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    title={
                      formData.offer.duplicateFlag
                        ? duplicateOrderTitles[formData.offer.duplicateFlag]
                        : "Select Duplicate Order"
                    }
                    className={`w-full px-2 py-1 h-10 rounded-md flex items-center justify-between ${
                      errors["offer.duplicateFlag"] ? "border border-red-500" : "border border-gray-300"
                    }`}
                  >
                    <SelectValue placeholder="Select Duplicate Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Dont Allow to Duplicate Order</SelectItem>
                    <SelectItem value="B">Extend Effective period of original instance from sysdate</SelectItem>
                    <SelectItem value="C">Add Offer Instance, Don't Change Old Instance</SelectItem>
                    <SelectItem value="D">Add Offer Instance, Cancel Old Instance</SelectItem>
                    <SelectItem value="E">Extend Effective period of original instance from ExpDate</SelectItem>
                    <SelectItem value="F">Add Offer Instance, New Instance EffDate equal Old ExpDate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Valid Period */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-700">
                Valid Period <span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="flex gap-2 w-full">
                {/* Effective Date */}
                <div className="w-1/2">
                  <input
                    type="date"
                    value={formData.offer.effDate || ""}
                    onChange={(e) => onInputChange("offer.effDate", e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors["offer.effDate"] ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors["offer.effDate"] && <p className="text-red-500 text-xs mt-1">{errors["offer.effDate"]}</p>}
                </div>

                <span className="mt-2">-</span>

                {/* Expired Date */}
                <div className="w-1/2">
                  <input
                    type="date"
                    value={formData.offer.expDate || ""}
                    onChange={(e) => onInputChange("offer.expDate", e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors["offer.expDate"] ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors["offer.expDate"] && <p className="text-red-500 text-xs mt-1">{errors["offer.expDate"]}</p>}
                </div>
              </div>
            </div>

            {/* Is Package - FIXED: Menggunakan formData.isPackage bukan formData.offer.isPackage */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-700">
                Is Package<span className="text-red-500">*</span>
              </label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="w-full">
                <div
                  className={`flex gap-4 p-2 border rounded-md ${errors.isPackage ? "border-red-500" : "border-gray-300"}`}
                >
                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="isPackage"
                      value="Y"
                      checked={formData.isPackage === "Y"}
                      onChange={(e) => onInputChange("isPackage", e.target.value)}
                      disabled={isSubmitting}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="isPackage"
                      value="N"
                      checked={formData.isPackage === "N"}
                      onChange={(e) => onInputChange("isPackage", e.target.value)}
                      disabled={isSubmitting}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
                {errors["isPackage"] && <p className="text-red-500 text-xs mt-1">{errors["isPackage"]}</p>}
              </div>
            </div>

            {/* Automatic Renewal */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-700">Automatic Renewal</label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="w-full">
                <div
                  className={`flex gap-4 p-2 border rounded-md ${errors["offer.autoContinueFlag"] ? "border-red-500" : "border-gray-300"}`}
                >
                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="autoContinueFlag"
                      value="Y"
                      checked={formData.offer.autoContinueFlag === "Y"}
                      onChange={(e) => onInputChange("offer.autoContinueFlag", e.target.value)}
                      disabled={isSubmitting}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="autoContinueFlag"
                      value="N"
                      checked={formData.offer.autoContinueFlag === "N"}
                      onChange={(e) => onInputChange("offer.autoContinueFlag", e.target.value)}
                      disabled={isSubmitting}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>
            </div>

            {/* Order Time Limit - FIXED: Menggunakan expTimeUnit terpisah */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-700">Order Time Limit</label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="w-full flex gap-2">
                <div className="flex-[2]">
                  <NumericFormat
                    key={`exp-off-${forceReset}`}
                    value={formData.offer.expOff ?? null}
                    thousandSeparator="."
                    decimalSeparator=","
                    allowNegative={false}
                    onValueChange={(values) => onInputChange("offer.expOff", values.floatValue ?? null)}
                    placeholder="Input Order Time Limit"
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors["offer.expOff"] ? "border-red-500" : "border-gray-300"}`}
                  />
                </div>

                <div className="flex-[1]">
                  <Select
                    value={formData.offer.expTimeUnit || ""}
                    onValueChange={(value) => {
                      onInputChange("offer.expTimeUnit", value === "ALL" ? "" : value);
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Time Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Time Unit</SelectItem>
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
            </div>

            {/* Agreement Period */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-700">Agreement Period</label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="w-full flex gap-2">
                <div className="flex-[2]">
                  <NumericFormat
                    key={`cycle-quantity-${forceReset}`}
                    value={formData.offer.cycleQuantity ?? null}
                    thousandSeparator="."
                    decimalSeparator=","
                    allowNegative={false}
                    onValueChange={(values) => onInputChange("offer.cycleQuantity", values.floatValue ?? 0)}
                    placeholder="Input Agreement Period"
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors["offer.cycleQuantity"] ? "border-red-500" : "border-gray-300"}`}
                  />
                </div>

                <div className="flex-[1]">
                  <Select
                    value={formData.offer.timeUnit || ""}
                    onValueChange={(value) => {
                      onInputChange("offer.timeUnit", value === "All" ? "" : value);
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Time Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Time Unit</SelectItem>
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
            </div>

            {/* Agreement Effective Type */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-700">Agreement Effective Type</label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="w-full">
                <Select
                  value={formData.offer.agreementEffType || ""}
                  onValueChange={(value) => onInputChange("offer.agreementEffType", value)}
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
            </div>

            {/* Remarks/Comments */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-700">Remarks</label>
              <span className="text-sm font-medium text-gray-700">:</span>
              <div className="w-full">
                <textarea
                  value={formData.offer.comments || ""}
                  onChange={(e) => onInputChange("offer.comments", e.target.value)}
                  className="w-full min-h-[80px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter remarks..."
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="p-4 mt-4 -mx-6 px-6 -mb-6">
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DetailEditMode;
