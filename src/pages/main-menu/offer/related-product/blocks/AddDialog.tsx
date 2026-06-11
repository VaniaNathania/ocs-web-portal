import React, { useState, useEffect, useRef, useCallback } from "react";
import { Check, ChevronDown, RefreshCw, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumericFormat } from "react-number-format";
import { apiConfigOffer } from "@/config/api.config";
import { useRelatedProductOfferListContext } from "../hooks/useRelatedProductOfferListContext";
import { useDataGrid } from "@/components";
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
import RelatedProductSidebar from "../components/RelatedProductSideBar";
import RelatedProductActions from "../actions/RelatedProductActions";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { effectiveTypeOptions, getEffectiveTypeDisplayText, getSelectedEffectiveTypes } from "../components/types";

export interface FormData {
  offerId: string;
  servType: number;
  isPackage: string;
  spId: number | null;
  offer: {
    offerId: string;
    offerType: string;
    offerName: string;
    comments: string | null;
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
    spId: number | null;
    expOff: number | null;
    expTimeUnit: string | null;
    agreementEffType: string | null;
  };
  lifecycleType: number | null;
  offerCatgId: string;
  networkType: string;
}

export const initialStateAddDialog: FormData = {
  offerId: "",
  servType: 0,
  isPackage: "",
  spId: null,
  offer: {
    offerId: "",
    offerType: "3",
    offerName: "",
    comments: null,
    offerCode: "",
    saleListPrice: null,
    rentListPrice: null,
    effDate: "",
    expDate: "",
    effType: "B",
    autoContinueFlag: null,
    cycleQuantity: null,
    timeUnit: null,
    duplicateFlag: null,
    spId: null,
    expOff: null,
    expTimeUnit: null,
    agreementEffType: null,
  },
  lifecycleType: null,
  offerCatgId: "",
  networkType: "C",
};

const API_URL_OFFER = apiConfigOffer.offer;

const AddDialog = () => {
  const [formData, setFormData] = useState<FormData>(initialStateAddDialog);

  const { showAddDialog, handleAddDialog, selectedCategoryId, setRefreshOfferListSidebar } =
    useRelatedProductOfferListContext();
  const { reload } = useDataGrid();
  const { PostData } = useCallApi();
  const {
    serviceType,
    lifecycleType,
    fetchServiceTypeList,
    fetchLifecycleType,
    loading,
    error: serviceTypeError,
  } = RelatedProductActions();
  const [forceReset, setForceReset] = useState(0);
  const parsedUser = getAuth()?.user;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serviceTypeOpen, setServiceTypeOpen] = useState(false);
  const [lifecycleTypeOpen, setLifecycleTyeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [effTypeOpen, setEffTypeOpen] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const buildPayload = (data: FormData): FormData => {
    return {
      ...data,
      offerId: data.offerId || "",
      servType: data.servType || 290,
      isPackage: data.isPackage || "Y",
      spId: data.spId || 0,
      lifecycleType: data.lifecycleType || null,
      offerCatgId: data.offerCatgId || "5",
      networkType: data.networkType || "C",
      offer: {
        ...data.offer,
        agreementEffType: data.offer.agreementEffType || null,
        offerId: data.offer.offerId || "",
        offerType: data.offer.offerType || "3",
        offerName: data.offer.offerName || "",
        comments: data.offer.comments || null,
        offerCode: data.offer.offerCode || "",
        saleListPrice: data.offer.saleListPrice || null,
        rentListPrice: data.offer.rentListPrice || null,
        effDate: data.offer.effDate || "",
        expDate: data.offer.expDate || "",
        effType: data.offer.effType || "B",
        autoContinueFlag: data.offer.autoContinueFlag || null,
        cycleQuantity: data.offer.cycleQuantity ?? null,
        timeUnit: data.offer.timeUnit || null,
        duplicateFlag: data.offer.duplicateFlag || null,
        spId: data.offer.spId || null,
        expOff: data.offer.expOff ?? null,
        expTimeUnit: data.offer.expTimeUnit || null,
      },
    };
  };

  const resetForm = () => {
    setFormData({
      ...initialStateAddDialog,
      offer: {
        ...initialStateAddDialog.offer,
        saleListPrice: null, // Set ke empty string
        rentListPrice: null,
        expOff: null,
        cycleQuantity: null,
      },
    });
    setErrors({});
    setAlert({ show: false, message: "" });
    setForceReset((prev) => prev + 1);
  };

  useEffect(() => {
    if (showAddDialog === false) {
      resetForm();
    }

    if (showAddDialog) {
      setFormData((prev) => ({
        ...prev,
        offerCatgId: selectedCategoryId || "5",
      }));
    }
  }, [showAddDialog]);

  const handleInputChange = (field: string, value: string | number | null) => {
    if (field.startsWith("offer.")) {
      const offerField = field.replace("offer.", "");
      setFormData((prev) => ({
        ...prev,
        offer: {
          ...prev.offer,
          [offerField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const requiredFields = [
      { key: "offer.offerName", label: "Offer Name" },
      { key: "offer.offerCode", label: "Code" },
      { key: "offer.effDate", label: "Effective Date" },
      // { key: "offer.expDate", label: "Expiration Date" },
      { key: "offer.effType", label: "Effective Type" },
      { key: "isPackage", label: "Is Package" },
    ];

    const newErrors: Record<string, string> = {};
    let isValid = true;

    setAlert({ show: false, message: "" });

    requiredFields.forEach(({ key, label }) => {
      let value;
      if (key.startsWith("offer.")) {
        const offerField = key.replace("offer.", "");
        value = formData.offer[offerField as keyof typeof formData.offer];
      } else {
        value = formData[key as keyof FormData];
      }

      const isEmpty = value === "" || value === null || value === undefined;

      if (isEmpty) {
        newErrors[key] = `${label} is required`;
        isValid = false;
      }
    });

    if (!formData.servType || formData.servType === 0) {
      newErrors["servType"] = "Service Type is required";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      const firstError = Object.values(newErrors)[0];
      setAlert({
        show: true,
        message: firstError || "Please fill in all required fields",
      });
    }

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
        const payloadToSend = buildPayload(formData);

        const response = await PostData(`${API_URL_OFFER}/offer/depend/add-depend-prod-spec`, payloadToSend);

        if (response?.status) {
          resetForm();
          toast.success("Related Product created successfully!");

          setRefreshOfferListSidebar(selectedCategoryId);

          if (reload) {
            reload();
          }

          // const createActivity = {
          //   module: "Manage Related Product",
          //   description: `Create Related Product => ${formData.offer.offerName}`,
          //   action: "C",
          // };
          // doSaveLogActivity(createActivity);

          handleAddDialog(false);
        } else {
          const errorMessage = response?.message || "Failed to create Related Product. Please try again.";
          toast.error(errorMessage);
          setAlert({
            show: true,
            message: errorMessage,
          });
          console.error("❌ API returned error:", response);
        }
      } catch (error: any) {
        const errorMessage = error?.message || "Something went wrong. Please try again.";
        console.error("❌ Error creating related product:", error);
        toast.error(errorMessage);
        setAlert({
          show: true,
          message: errorMessage,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, handleAddDialog, PostData, reload, parsedUser]
  );

  return (
    <Dialog open={showAddDialog} onOpenChange={handleAddDialog}>
      <DialogContent className="max-w-7xl w-full p-3 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg">Create Related Product</DialogTitle>
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
                    Offer Name<span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.offer.offerName}
                    onChange={(e) => handleInputChange("offer.offerName", e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Enter Offer name"
                    className={errors["offer.offerName"] ? "border-red-500" : ""}
                  />
                  {errors["offer.offerName"] && (
                    <p className="text-red-500 text-xs mt-1">{errors["offer.offerName"]}</p>
                  )}
                </div>

                <div>
                  <label className="form-label pb-2">
                    Offer Code<span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.offer.offerCode}
                    onChange={(e) => handleInputChange("offer.offerCode", e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Enter code"
                    className={errors["offer.offerCode"] ? "border-red-500" : ""}
                  />
                  {errors["offer.offerCode"] && (
                    <p className="text-red-500 text-xs mt-1">{errors["offer.offerCode"]}</p>
                  )}
                </div>

                {/* Effective Type */}
                <div className="flex-1 min-w-0">
                  <label className="form-label pb-2">
                    Effective Type<span className="text-red-500">*</span>
                  </label>
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

                {/* Service Type */}
                <div className="flex-1 min-w-0">
                  <label className="form-label flex items-center gap-1 max-w-56">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grow flex flex-col">
                    <Popover
                      open={serviceTypeOpen}
                      onOpenChange={(open) => {
                        setServiceTypeOpen(open);
                        if (open && serviceType.length === 0 && !loading) {
                          fetchServiceTypeList();
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={`w-full flex items-center justify-between input text-left ${errors.servType ? "border-red-500" : ""}`}
                          disabled={loading}
                        >
                          {loading
                            ? "Loading service types..."
                            : (() => {
                                const selected = serviceType.find((service) => service.servType === formData.servType);
                                return selected
                                  ? `${selected.servTypeName} [${selected.networkTypeName}]`
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
                          <CommandInput placeholder="Search service type..." />
                          <CommandList className="max-h-[200px] overflow-y-auto pointer-events-auto">
                            <CommandEmpty>{loading ? "Loading..." : "No service type found."}</CommandEmpty>
                            <CommandGroup>
                              {serviceType.map((service) => (
                                <CommandItem
                                  key={`${service.servType}-${service.networkType}`} // ✅ unik
                                  value={`${service.servTypeName} [${service.networkType}]`}
                                  className="cursor-pointer text-xs flex items-center gap-2"
                                  onSelect={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      servType: service.servType,
                                      servTypeName: service.servTypeName,
                                      networkType: service.networkType,
                                    }));
                                    setErrors((prev) => ({
                                      ...prev,
                                      servType: "",
                                    }));
                                    setServiceTypeOpen(false);
                                  }}
                                >
                                  <span className="truncate w-full overflow-hidden text-ellipsis whitespace-nowrap" title={`${service.servTypeName} [${service.networkTypeName}]`}>
                                    {service.servTypeName} [{service.networkTypeName}]
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {errors.servType && <span className="text-red-500 text-xs mt-1">{errors.servType}</span>}
                    {serviceTypeError && (
                      <span className="text-red-500 text-xs mt-1">Error loading service types: {serviceTypeError}</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="form-label pb-2">Duplicate Order</label>
                  <Select
                    value={formData.offer?.duplicateFlag || ""}
                    onValueChange={(value) => handleInputChange("offer.duplicateFlag", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                    // className={`w-full px-2 py-1 h-10 rounded-md flex items-center justify-between ${
                    //   errors["offer.duplicateFlag"]
                    //     ? "border border-red-500"
                    //     : "border border-gray-300"
                    // }`}
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
                  {/* {errors["offer.duplicateFlag"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["offer.duplicateFlag"]}
                    </p>
                  )} */}
                </div>

                {/* Sale Price */}
                <div>
                  <label className="form-label pb-2">Sale Price</label>
                  <NumericFormat
                    key={`sale-price-${forceReset}`}
                    value={formData.offer.saleListPrice ?? null}
                    thousandSeparator="."
                    decimalSeparator=","
                    allowNegative={false}
                    onValueChange={(values) => {
                      const newValue = values.floatValue === undefined ? null : values.floatValue;
                      handleInputChange("offer.saleListPrice", newValue);
                    }}
                    placeholder="Input Sale Price"
                    disabled={isSubmitting}
                    className={`w-full input ${errors["offer.saleListPrice"] ? "border-red-500" : ""}`}
                  />
                </div>

                {/* Rent Price */}
                <div>
                  <label className="form-label pb-2">Rent Price</label>
                  <NumericFormat
                    key={`rent-price-${forceReset}`}
                    value={formData.offer.rentListPrice ?? null}
                    thousandSeparator="."
                    decimalSeparator=","
                    allowNegative={false}
                    onValueChange={(values) => {
                      const newValue = values.floatValue === undefined ? null : values.floatValue;
                      handleInputChange("offer.rentListPrice", newValue);
                    }}
                    placeholder="Input Rent Price"
                    disabled={isSubmitting}
                    className="w-full input"
                  />
                </div>
                {/* Lifecyle Type */}
                <div className="flex-1 min-w-0">
                  <label className="form-label flex items-center gap-1 max-w-56">Lifecycle Type</label>
                  <div className="grow flex flex-col">
                    <Popover
                      open={lifecycleTypeOpen}
                      onOpenChange={(open) => {
                        setLifecycleTyeOpen(open);
                        if (open && lifecycleType.length === 0 && !loading) {
                          fetchLifecycleType();
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={`w-full flex items-center justify-between input text-left ${errors.lifecycleType ? "border-red-500" : ""}`}
                          disabled={loading}
                        >
                          {loading
                            ? "Loading Lifecycle Type..."
                            : lifecycleType.find((lifecycle) => lifecycle.lifecycleType === formData.lifecycleType)
                                ?.lifecycleTypeName || "Select lifecycle type"}
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
                                    setFormData((prev) => ({
                                      ...prev,
                                      lifecycleType: lifecycle.lifecycleType,
                                    }));
                                    setErrors((prev) => ({
                                      ...prev,
                                      lifecycleType: "",
                                    }));
                                    setLifecycleTyeOpen(false);
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
                    {errors.lifecycleType && <span className="text-red-500 text-xs mt-1">{errors.lifecycleType}</span>}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  {/* Label untuk keduanya */}
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Period <span className="text-red-500">*</span>
                  </label>

                  {/* Dua input sejajar */}
                  <div className="flex gap-2">
                    {/* Effective Date */}
                    <div className="w-1/2">
                      <input
                        type="date"
                        value={formData.offer.effDate}
                        onChange={(e) => handleInputChange("offer.effDate", e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors["offer.effDate"] ? "border-red-500" : "border-gray-300"
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors["offer.effDate"] && (
                        <p className="text-red-500 text-xs mt-1">{errors["offer.effDate"]}</p>
                      )}
                    </div>

                    <label className="mt-2">-</label>

                    {/* Expired Date */}
                    <div className="w-1/2">
                      <input
                        type="date"
                        value={formData.offer.expDate}
                        onChange={(e) => handleInputChange("offer.expDate", e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors["offer.expDate"] ? "border-red-500" : "border-gray-300"
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors["offer.expDate"] && (
                        <p className="text-red-500 text-xs mt-1">{errors["offer.expDate"]}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Is Package */}
                <div>
                  <label className="form-label pb-2">
                    Is Package<span className="text-red-500">*</span>
                  </label>
                  <div className="inline-block">
                    <div
                      className={`flex gap-4 p-2 border rounded-md ${errors.isPackage ? "border-red-500" : "border-gray-300"}`}
                    >
                      <label className="flex items-center text-sm">
                        <input
                          type="radio"
                          name="isPackage"
                          value="Y"
                          checked={formData.isPackage === "Y"}
                          onChange={(e) => handleInputChange("isPackage", e.target.value)}
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
                          onChange={(e) => handleInputChange("isPackage", e.target.value)}
                          disabled={isSubmitting}
                          className="mr-2"
                        />
                        No
                      </label>
                    </div>
                    {errors["isPackage"] && <p className="text-red-500 text-xs mt-1">{errors["isPackage"]}</p>}
                  </div>
                </div>

                {/* Auto Continue Flag */}
                <div>
                  <label className="form-label pb-2">Automatic Renewal</label>
                  <div className="inline-block">
                    <div
                      className={`flex gap-4 p-2 border rounded-md ${errors["offer.autoContinueFlag"] ? "border-red-500" : "border-gray-300"}`}
                    >
                      <label className="flex items-center text-sm">
                        <input
                          type="radio"
                          name="autoContinueFlag"
                          value="Y"
                          checked={formData.offer.autoContinueFlag === "Y"}
                          onChange={(e) => handleInputChange("offer.autoContinueFlag", e.target.value)}
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
                          onChange={(e) => handleInputChange("offer.autoContinueFlag", e.target.value)}
                          disabled={isSubmitting}
                          className="mr-2"
                        />
                        No
                      </label>
                    </div>
                    {errors["offer.autoContinueFlag"] && (
                      <p className="text-red-500 text-xs mt-1">{errors["offer.autoContinueFlag"]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-label pb-2">Order Time Limit</label>
                  <div className="flex gap-2">
                    <div className="w-2/3">
                      <NumericFormat
                        key={`exp-off-${forceReset}`}
                        value={formData.offer.expOff ?? null}
                        thousandSeparator="."
                        decimalSeparator=","
                        allowNegative={false}
                        onValueChange={(values) => {
                          const newValue = values.floatValue === undefined ? null : values.floatValue;
                          handleInputChange("offer.expOff", newValue);
                        }}
                        placeholder="Input Order Time Limit"
                        disabled={isSubmitting}
                        className={`w-full input ${errors["offer.expOff"] ? "border-red-500" : ""}`}
                      />
                    </div>
                    <div className="w-1/3">
                      <Select
                        value={formData.offer.expTimeUnit || ""}
                        onValueChange={(value) => handleInputChange("offer.expTimeUnit", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
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
                  {/* {errors["offer.expOff"] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors["offer.expOff"]}
                    </p>
                  )} */}
                </div>

                <div>
                  <label className="form-label pb-2">Agreement Period</label>
                  <div className="flex gap-2">
                    <div className="w-2/3">
                      <NumericFormat
                        key={`cycle-quantity-${forceReset}`}
                        value={formData.offer.cycleQuantity ?? null}
                        thousandSeparator="."
                        decimalSeparator=","
                        allowNegative={false}
                        onValueChange={(values) => {
                          const newValue = values.floatValue === undefined ? null : values.floatValue;
                          handleInputChange("offer.cycleQuantity", newValue);
                        }}
                        placeholder="Input Agreement Period"
                        disabled={isSubmitting}
                        className={`w-full input ${errors["offer.cycleQuantity"] ? "border-red-500" : ""}`}
                      />
                    </div>
                    <div className="w-1/3">
                      <Select
                        value={formData.offer.timeUnit || ""}
                        onValueChange={(value) => handleInputChange("offer.timeUnit", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
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
                  {errors["offer.cycleQuantity"] && (
                    <p className="text-red-500 text-xs mt-1">{errors["offer.cycleQuantity"]}</p>
                  )}
                </div>

                <div>
                  <label className="form-label pb-2">Agreement Effective Type</label>
                  <Select
                    value={formData.offer.agreementEffType || ""}
                    onValueChange={(value) => handleInputChange("offer.agreementEffType", value)}
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

                {/* Comments */}
                <div>
                  <label className="form-label pb-2">Remarks</label>
                  <textarea
                    value={formData.offer.comments || ""}
                    onChange={(e) => handleInputChange("offer.comments", e.target.value)}
                    className="w-full input h-28 p-2"
                    placeholder="Enter remarks..."
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm} // Ganti handleCancel ke resetForm
                disabled={isSubmitting}
              >
                Reset
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

export default AddDialog;
