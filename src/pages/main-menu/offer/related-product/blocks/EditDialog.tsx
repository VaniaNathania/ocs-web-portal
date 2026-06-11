import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, ArrowLeft, ChevronDown, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RelationshipTabContent from "../../main-product/components/DetailCategoryContent/RelationShipTabContent";
import SalesConditionTabContent from "../components/DetailCategoryContent/SalesConditionTabContent";
import BelongPackageTabContent from "../components/DetailCategoryContent/BelongPackageContent";
import BelongInOfferTabContent from "../components/DetailCategoryContent/BelongOfferGroupContent";
import ScriptRuleTabContent from "../components/DetailCategoryContent/ScriptRuleTabContent";
import { Input } from "@/components/ui/input";
import { FormData, initialStateAddDialog } from "./AddDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MdKeyboardArrowDown } from "react-icons/md";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRelatedProductOfferListContext } from "../hooks/useRelatedProductOfferListContext";
import RelatedProductActions from "../actions/RelatedProductActions";
import { NumericFormat } from "react-number-format";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import { useDataGrid } from "@/components";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { getAuth } from "@/auth";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  effectiveTypeOptions,
  getEffectiveTypeDisplayText,
  getSelectedEffectiveTypes,
} from "../components/types";
import FeatureTabContent from "../../main-product/components/DetailCategoryContent/FeatureTabContent";

const API_URL_OFFER = apiConfigOffer.offer;

const tabs = [
  { id: "detail", label: "Detail" },
  { id: "feature", label: "Feature" },
  { id: "relationship", label: "Relationship" },
  { id: "sales-condition", label: "Sales Condition" },
  { id: "belong-package", label: "Belong in Package" },
  { id: "belong-offer", label: "Belong in Offer Group" },
  { id: "script-rule", label: "Script Rule" },
];

const EditDialog: React.FC = () => {
  const {
    showEditDialog,
    selectedCategoryId,
    setShowEditDialog,
    handleEditDialog,
    categoryContent,
    selectedCategory,
    setRefreshOfferListSidebar,
  } = useRelatedProductOfferListContext();
  const {
    serviceType,
    lifecycleType,
    fetchServiceTypeList,
    fetchLifecycleType,
    loading,
    error: serviceTypeError,
  } = RelatedProductActions();
  const { PutData, GetData } = useCallApi();
  const { reload } = useDataGrid();
  const parsedUser = getAuth()?.user;
  const [detailContent, setDetailContent] = useState<any>(null);
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(
    null,
  );
  const [forceReset, setForceReset] = useState(0);
  const [activeTab, setActiveTab] = useState("detail");
  const [lifecycleTypeOpen, setLifecycleTyeOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialStateAddDialog);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [effTypeOpen, setEffTypeOpen] = useState(false);
  const [serviceTypeOpen, setServiceTypeOpen] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

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

  const fetchDetailCategoryContent = async (offerId: string) => {
    if (!offerId) {
      console.error("OfferId is required");
      return null;
    }

    setIsLoadingDetail(true);
    setDetailError(null);

    const params = {
      dependProdSpecId: offerId,
    };

    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/depend/qry-depend-prod-detail-by-offer-id`,
        params,
      );

      if (response?.status && response?.data) {
        let dataObject;
        if (Array.isArray(response.data)) {
          dataObject = response.data[0] || {};
        } else {
          dataObject = response.data;
        }

        return dataObject;
      } else {
        throw new Error("Data tidak ditemukan atau response tidak valid");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal fetch detail content";
      console.error("❌ Error fetching detail:", err);
      setDetailError(errorMessage);
      toast.error(`Gagal memuat detail: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      { key: "offer.offerName", label: "Offer Name" },
      { key: "offer.offerCode", label: "Code" },
      { key: "offer.effDate", label: "Effective Date" },
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

  const resetForm = () => {
    setFormData({
      ...initialStateAddDialog,
      offer: {
        ...initialStateAddDialog.offer,
        saleListPrice: null,
        rentListPrice: null,
        expOff: null,
        cycleQuantity: null,
      },
    });
    setErrors({});
    setAlert({ show: false, message: "" });
    setForceReset((prev) => prev + 1);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      const category = selectedCategory as any;

      const offerIdtoUse = formData.offerId || category?.offerId;

      const payloadToSend = {
        dependProdSpecId: Number(offerIdtoUse), //penting
        servType: Number(formData.servType), //penting
        isPackage: formData.isPackage, //penting
        spId: formData.spId,
        networkType: formData.networkType,
        lifecycleType: formData.lifecycleType,
        offer: {
          offerId: Number(offerIdtoUse), //penting
          offerType: formData.offer.offerType, //penting
          offerName: formData.offer.offerName,
          duplicateFlag: formData.offer.duplicateFlag,
          comments: formData.offer.comments,
          offerCode: formData.offer.offerCode,
          saleListPrice: formData.offer.saleListPrice,
          rentListPrice: formData.offer.rentListPrice,
          effDate: formData.offer.effDate,
          expDate: formData.offer.expDate,
          effType: formData.offer.effType,
          autoContinueFlag: formData.offer.autoContinueFlag,
          agreementEffType: formData.offer.agreementEffType,
          spId: formData.offer.spId,
          expOff: formData.offer.expOff,
          expTimeUnit: formData.offer.expTimeUnit,
          cycleQuantity: formData.offer.cycleQuantity,
          timeUnit: formData.offer.timeUnit,
        },
      };

      setIsSubmitting(true);
      setAlert({ show: false, message: "" });

      try {
        const response = await PutData(
          `${API_URL_OFFER}/offer/depend/mod-depend-prod-spec`,
          payloadToSend,
        );

        if (response?.status) {
          resetForm();
          toast.success("Related Product has been successfully updated!");

          setRefreshOfferListSidebar(selectedCategoryId);

          if (reload) {
            reload();
          }

          // const updateActivity = {
          //   module: "Manage Related Product",
          //   description: `Update Related Product => ${formData.offer.offerName}`,
          //   action: "U",
          // };
          // doSaveLogActivity(updateActivity);

          handleEditDialog(false, null);
        } else {
          const errorMessage =
            response?.message ||
            "Failed to update Related Product. Please try again.";
          toast.error(errorMessage);
          setAlert({
            show: true,
            message: errorMessage,
          });
          console.error("❌ API returned an error");
        }
      } catch (error: any) {
        const errorMessage =
          error?.message || "An error occurred. Please try again.";
        console.error("❌ API returned an error:", error);
        toast.error(errorMessage);
        setAlert({
          show: true,
          message: errorMessage,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, handleEditDialog, PutData, reload, parsedUser, selectedCategory],
  );

  const hasFetchedRef = useRef<number | null>(null);

  useEffect(() => {
    // console.log("show edit dialog: ", showEditDialog);
    // console.log("selected category: ", selectedCategory);

    const getAndSetFormData = async () => {
      if (showEditDialog && selectedCategory) {
        // console.log("mulai fetch data");
        const category = selectedCategory as any;
        const idToUse = category?.offerId || category?.id;

        // console.log("id to use: ", idToUse);

        if (!idToUse) {
          console.error("No valid ID found in selectedCategory");
          setDetailError("No valid ID found for fetching detail");
          return;
        }

        // console.log("selectedCategory:", selectedCategory);
        // console.log("idToUse:", idToUse);

        if (serviceType.length === 0) {
          fetchServiceTypeList();
        }

        if (lifecycleType.length === 0) {
          fetchLifecycleType();
        }

        try {
          // console.log("🌐 Calling fetchDetailCategoryContent...");
          const detail = await fetchDetailCategoryContent(idToUse);
          // console.log("✅ Detail fetched:", detail);

          if (!detail) return;

          // console.log("📝 Setting formData...");
          setFormData((prev) => ({
            ...prev,
            offerId: idToUse,
            offerCatgId: detail.offerCatgId || "5",
            isPackage: detail.isPackage || "Y",
            spId: detail.spId || null,
            servType: Number(detail.servType) || 290,
            lifecycleType: Number(detail.lifecycleType) || null,
            networkType: detail.networkType || "C",
            offer: {
              ...prev.offer,
              offerId: idToUse,
              offerName: detail.offerName || "",
              offerCode: detail.offerCode || "",
              offerType: detail.offerType || "3",
              saleListPrice: detail.saleListPrice || null,
              rentListPrice: detail.rentListPrice || null,
              effDate: detail.effDate || "",
              expDate: detail.expDate || "",
              effType: detail.effType || "B",
              autoContinueFlag: detail.autoContinueFlag || null,
              cycleQuantity: detail.cycleQuantity ?? null,
              timeUnit: detail.timeUnit || null,
              duplicateFlag: detail.duplicateFlag ?? null,
              spId: detail.spId || null,
              expOff: detail.expOff ?? null,
              expTimeUnit: detail.expTimeUnit || null,
              comments: detail.comments || null,
              agreementEffType: detail.agreementEffType || null,
            },
          }));
          ////  console.log("✅ formData SET!");
        } catch (error) {
          console.error("Error setting form data:", error);
        }
      } else {
        ////  console.log("⏭️ Skip fetch: showEditDialog or selectedCategory not ready");
      }
    };

    getAndSetFormData();
  }, [showEditDialog, selectedCategory]);

  useEffect(() => {
    if (!showEditDialog) {
      resetForm();
      setIsLoadingDetail(false);
      setDetailError(null);
    }
  }, [showEditDialog]);

  return (
    <Dialog
      open={showEditDialog}
      onOpenChange={() => handleEditDialog(false, null)}
    >
      <DialogContent className="max-w-6xl w-full p-3 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg">Edit Related Product</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        {!isLoadingDetail && (
          <div className="flex border-b bg-gray-50 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-normal border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-white"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <DialogBody className="max-h-[75vh] overflow-y-auto">
          {isLoadingDetail && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <div className="text-gray-500 text-sm">
                  Loading detail data...
                </div>
              </div>
            </div>
          )}

          {!isLoadingDetail && (
            <>
              {activeTab === "detail" && (
                <div>
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
                            onChange={(e) =>
                              handleInputChange(
                                "offer.offerName",
                                e.target.value,
                              )
                            }
                            disabled={isSubmitting}
                            placeholder="Enter Offer name"
                            className={
                              errors["offer.offerName"] ? "border-red-500" : ""
                            }
                          />
                          {errors["offer.offerName"] && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors["offer.offerName"]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="form-label pb-2">
                            Offer Code<span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={formData.offer.offerCode}
                            onChange={(e) =>
                              handleInputChange(
                                "offer.offerCode",
                                e.target.value,
                              )
                            }
                            disabled={isSubmitting}
                            placeholder="Enter code"
                            className={
                              errors["offer.offerCode"] ? "border-red-500" : ""
                            }
                          />
                          {errors["offer.offerCode"] && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors["offer.offerCode"]}
                            </p>
                          )}
                        </div>

                        {/* Effective Type */}
                        <div className="flex-1 min-w-0">
                          <label className="form-label pb-2">
                            Effective Type
                            <span className="text-red-500">*</span>
                          </label>
                          <Popover
                            open={effTypeOpen}
                            onOpenChange={setEffTypeOpen}
                          >
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className={`w-full px-2 py-1 text-sm h-10 border rounded-md flex items-center justify-between ${
                                  errors["offer.effType"]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                disabled={isSubmitting}
                              >
                                <span className="text-gray-700 truncate w-[85%] overflow-hidden text-ellipsis whitespace-nowrap text-left">
                                  {getEffectiveTypeDisplayText(
                                    formData.offer.effType,
                                  )}
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
                                  className="max-h-[300px] overflow-  y-auto"
                                  style={{ touchAction: "pan-y" }}
                                  onWheel={(e) => {
                                    e.currentTarget.scrollTop += e.deltaY;
                                  }}
                                >
                                  <CommandEmpty>
                                    No Effective Type found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {effectiveTypeOptions.map((option) => {
                                      const currentSelected =
                                        getSelectedEffectiveTypes(
                                          formData.offer.effType,
                                        );
                                      const isSelected =
                                        currentSelected.includes(option.value);

                                      return (
                                        <CommandItem
                                          key={option.value}
                                          value={option.label}
                                          onSelect={() => {
                                            const current =
                                              getSelectedEffectiveTypes(
                                                formData.offer.effType,
                                              );
                                            const newSelected = isSelected
                                              ? current.filter(
                                                  (t) => t !== option.value,
                                                )
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
                                            {isSelected && (
                                              <Check className="w-4 h-4 text-green-600" />
                                            )}
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

                          {errors["offer.effType"] && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors["offer.effType"]}
                            </p>
                          )}
                        </div>

                        {/* Service Type */}
                        <div className="flex-1 min-w-0">
                          <label className="form-label pb-2">
                            Service Type<span className="text-red-500">*</span>
                          </label>
                          <Popover
                            open={serviceTypeOpen}
                            onOpenChange={(open) => {
                              setServiceTypeOpen(open);
                              if (
                                open &&
                                serviceType.length === 0 &&
                                !loading
                              ) {
                                fetchServiceTypeList();
                              }
                            }}
                          >
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className={`w-full flex items-center justify-between input text-left ${errors.servType ? "border-red-500" : ""}`}
                                disabled={loading || serviceType.length === 0}
                              >
                                {loading || serviceType.length === 0
                                  ? "Loading service types..."
                                  : (() => {
                                      const servTypeNumber = Number(
                                        formData.servType,
                                      );
                                      const selectedService = serviceType.find(
                                        (service) =>
                                          service.servType === servTypeNumber,
                                      );
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
                                  <CommandEmpty>
                                    {loading
                                      ? "Loading..."
                                      : "No Service Type found."}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {serviceType.map((service) => (
                                      <CommandItem
                                        key={service.servType}
                                        value={`${service.servTypeName} [${service.networkTypeName}]`}
                                        className="cursor-pointer text-xs flex items-center gap-2"
                                        onSelect={() => {
                                          setFormData((prev) => ({
                                            ...prev,
                                            servType: service.servType,
                                          }));
                                          setErrors((prev) => ({
                                            ...prev,
                                            servType: "",
                                          }));
                                          setServiceTypeOpen(false);
                                        }}
                                      >
                                        <span
                                          className="truncate w-full overflow-hidden text-ellipsis whitespace-nowrap"
                                          title={`${service.servTypeName} [${service.networkTypeName}]`}
                                        >
                                          {service.servTypeName} [
                                          {service.networkTypeName}]
                                        </span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {errors["servType"] && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors["servType"]}
                            </p>
                          )}
                          {serviceTypeError && (
                            <span className="text-red-500 text-xs mt-1">
                              Error loading service types: {serviceTypeError}
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="form-label pb-2">
                            Duplicate Order
                          </label>
                          <Select
                            value={formData.offer.duplicateFlag || ""}
                            onValueChange={(value) =>
                              handleInputChange("offer.duplicateFlag", value)
                            }
                            disabled={isSubmitting}
                          >
                            <SelectTrigger
                              className={`w-full px-2 py-1 h-10 rounded-md flex items-center justify-between ${
                                errors["offer.duplicateFlag"]
                                  ? "border border-red-500"
                                  : "border border-gray-300"
                              }`}
                            >
                              <SelectValue placeholder="Select Duplicate Order" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">
                                Dont Allow to Duplicate Order
                              </SelectItem>
                              <SelectItem value="B">
                                Extend Effective period of original instance
                                from sysdate
                              </SelectItem>
                              <SelectItem value="C">
                                Add Offer Instance, Don't Change Old Instance
                              </SelectItem>
                              <SelectItem value="D">
                                Add Offer Instance, Cancel Old Instance
                              </SelectItem>
                              <SelectItem value="E">
                                Extend Effective period of original instance
                                from ExpDate
                              </SelectItem>
                              <SelectItem value="F">
                                Add Offer Instance, New Instance EffDate equal
                                Old ExpDate
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          {errors["offer.duplicateFlag"] && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors["offer.duplicateFlag"]}
                            </p>
                          )}
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
                              const newValue =
                                values.floatValue === undefined
                                  ? null
                                  : values.floatValue;
                              handleInputChange(
                                "offer.saleListPrice",
                                newValue,
                              );
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
                              const newValue =
                                values.floatValue === undefined
                                  ? null
                                  : values.floatValue;
                              handleInputChange(
                                "offer.rentListPrice",
                                newValue,
                              );
                            }}
                            placeholder="Input Rent Price"
                            disabled={isSubmitting}
                            className="w-full input"
                          />
                        </div>
                        {/* Lifecyle Type */}
                        <div className="flex-1 min-w-0">
                          <label className="form-label flex items-center gap-1 max-w-56">
                            Lifecycle Type
                          </label>
                          <div className="grow flex flex-col">
                            <Popover
                              open={lifecycleTypeOpen}
                              onOpenChange={setLifecycleTyeOpen}
                            >
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className={`w-full flex items-center justify-between input text-left ${errors.lifecycleType ? "border-red-500" : ""}`}
                                  disabled={loading}
                                >
                                  {loading
                                    ? "Loading Lifecycle Type..."
                                    : lifecycleType.find(
                                        (lifecycle) =>
                                          lifecycle.lifecycleType ===
                                          formData.lifecycleType,
                                      )?.lifecycleTypeName ||
                                      "Select lifecycle type"}
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
                                    <CommandEmpty>
                                      {loading
                                        ? "Loading..."
                                        : "No lifecycle type found."}
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {lifecycleType.map((lifecycle) => (
                                        <CommandItem
                                          key={lifecycle.lifecycleType}
                                          value={lifecycle.lifecycleTypeName}
                                          onSelect={() => {
                                            setFormData((prev) => ({
                                              ...prev,
                                              lifecycleType:
                                                lifecycle.lifecycleType,
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
                            {errors.lifecycleType && (
                              <span className="text-red-500 text-xs mt-1">
                                {errors.lifecycleType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valid Period <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            {/* Effective Date */}
                            <div className="w-1/2">
                              <input
                                type="date"
                                value={formData.offer.effDate}
                                onChange={(e) =>
                                  handleInputChange(
                                    "offer.effDate",
                                    e.target.value,
                                  )
                                }
                                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors["offer.effDate"]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                disabled={isSubmitting}
                              />
                              {errors["offer.effDate"] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors["offer.effDate"]}
                                </p>
                              )}
                            </div>

                            <label className="mt-2">-</label>

                            {/* Expired Date */}
                            <div className="w-1/2">
                              <input
                                type="date"
                                value={formData.offer.expDate}
                                onChange={(e) =>
                                  handleInputChange(
                                    "offer.expDate",
                                    e.target.value,
                                  )
                                }
                                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors["offer.expDate"]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                disabled={isSubmitting}
                              />
                              {errors["offer.expDate"] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors["offer.expDate"]}
                                </p>
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
                                  onChange={(e) =>
                                    handleInputChange(
                                      "isPackage",
                                      e.target.value,
                                    )
                                  }
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
                                  onChange={(e) =>
                                    handleInputChange(
                                      "isPackage",
                                      e.target.value,
                                    )
                                  }
                                  disabled={isSubmitting}
                                  className="mr-2"
                                />
                                No
                              </label>
                            </div>
                            {errors["isPackage"] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors["isPackage"]}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Auto Continue Flag */}
                        <div>
                          <label className="form-label pb-2">
                            Automatic Renewal
                          </label>
                          <div className="inline-block">
                            <div
                              className={`flex gap-4 p-2 border rounded-md ${errors["offer.autoContinueFlag"] ? "border-red-500" : "border-gray-300"}`}
                            >
                              <label className="flex items-center text-sm">
                                <input
                                  type="radio"
                                  name="autoContinueFlag"
                                  value="Y"
                                  checked={
                                    formData.offer.autoContinueFlag === "Y"
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      "offer.autoContinueFlag",
                                      e.target.value,
                                    )
                                  }
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
                                  checked={
                                    formData.offer.autoContinueFlag === "N"
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      "offer.autoContinueFlag",
                                      e.target.value,
                                    )
                                  }
                                  disabled={isSubmitting}
                                  className="mr-2"
                                />
                                No
                              </label>
                            </div>
                            {errors["offer.autoContinueFlag"] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors["offer.autoContinueFlag"]}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="form-label pb-2">
                            Order Time Limit
                          </label>
                          <div className="flex gap-2">
                            <div className="w-2/3">
                              <NumericFormat
                                key={`exp-off-${forceReset}`}
                                value={formData.offer.expOff ?? null}
                                thousandSeparator="."
                                decimalSeparator=","
                                allowNegative={false}
                                onValueChange={(values) =>
                                  handleInputChange(
                                    "offer.expOff",
                                    values.floatValue ?? 0,
                                  )
                                }
                                placeholder="Input Order Time Limit"
                                disabled={isSubmitting}
                                className={`w-full input ${errors["offer.expOff"] ? "border-red-500" : ""}`}
                              />
                            </div>
                            <div className="w-1/3">
                              <Select
                                value={formData.offer.expTimeUnit || ""}
                                onValueChange={(value) =>
                                  handleInputChange("offer.expTimeUnit", value)
                                }
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
                                  <SelectItem value="C">
                                    Billing Cycle
                                  </SelectItem>
                                  <SelectItem value="S">Exact Time</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          {errors["offer.expOff"] && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors["offer.expOff"]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="form-label pb-2">
                            Agreement Period
                          </label>
                          <div className="flex gap-2">
                            <div className="w-2/3">
                              <NumericFormat
                                key={`cycle-quantity-${forceReset}`}
                                value={formData.offer.cycleQuantity ?? null}
                                thousandSeparator="."
                                decimalSeparator=","
                                allowNegative={false}
                                onValueChange={(values) =>
                                  handleInputChange(
                                    "offer.cycleQuantity",
                                    values.floatValue ?? 0,
                                  )
                                }
                                placeholder="Input Agreement Period"
                                disabled={isSubmitting}
                                className={`w-full input ${errors["offer.cycleQuantity"] ? "border-red-500" : ""}`}
                              />
                            </div>
                            <div className="w-1/3">
                              <Select
                                value={formData.offer.timeUnit ?? undefined}
                                onValueChange={(value) =>
                                  handleInputChange("offer.timeUnit", value)
                                }
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
                                  <SelectItem value="C">
                                    Billing Cycle
                                  </SelectItem>
                                  <SelectItem value="S">Exact Time</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          {errors["offer.cycleQuantity"] && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors["offer.cycleQuantity"]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="form-label pb-2">
                            Agreement Effective Type
                          </label>
                          <Select
                            value={formData.offer.agreementEffType || ""}
                            onValueChange={(value) =>
                              handleInputChange("offer.agreementEffType", value)
                            }
                            disabled={isSubmitting}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Agreement Effective Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Next Day</SelectItem>
                              <SelectItem value="2">Next Month</SelectItem>
                              <SelectItem value="3">
                                Next Billing Cycle
                              </SelectItem>
                              <SelectItem value="4">Today 0:00</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Comments */}
                        <div>
                          <label className="form-label pb-2">Remarks</label>
                          <textarea
                            value={formData.offer.comments || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "offer.comments",
                                e.target.value,
                              )
                            }
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
                        onClick={() => setShowEditDialog(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Other Tabs */}
              {activeTab === "feature" && (
                <FeatureTabContent
                  category="Edit Product"
                  rowData={categoryContent}
                />
              )}

              {activeTab === "relationship" && (
                <RelationshipTabContent
                  allowedRelationTypes={["Mutually Exclusive", "Dependent", "Dependent for automatic order", "Weakly Dependent"]}
                  rowData={categoryContent}
                />
              )}

              {activeTab === "sales-condition" && (
                <SalesConditionTabContent
                  category="Edit Product"
                  rowData={categoryContent}
                />
              )}

              {activeTab === "belong-package" && (
                <BelongPackageTabContent
                  category="Edit Product"
                  rowData={categoryContent}
                />
              )}

              {activeTab === "belong-offer" && (
                <BelongInOfferTabContent
                  category="Edit Product"
                  rowData={categoryContent}
                />
              )}

              {activeTab === "script-rule" && <ScriptRuleTabContent />}

              {![
                "detail",
                "feature",
                "relationship",
                "sales-condition",
                "belong-package",
                "belong-offer",
                "script-rule",
              ].includes(activeTab) && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-gray-400 text-lg mb-2">
                      No data available
                    </div>
                    <div className="text-gray-500 text-sm">
                      Content for {tabs.find((t) => t.id === activeTab)?.label}{" "}
                      will be displayed here
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;
