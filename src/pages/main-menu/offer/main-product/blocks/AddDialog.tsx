import React, { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumericFormat } from "react-number-format";
import { apiConfigOffer } from "@/config/api.config";
import { useMainProductOfferListContext } from "../hooks";
import { useDataGrid } from "@/components";
import { DatePicker } from "./DatePicker";
import { useCallApi } from "@/hooks";
import { getAuth } from "@/auth";
import { toast } from "sonner";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import MainProductActions from "../hooks/MainProductAction";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import MainProductSidebar from "../components/MainProductSidebar";
import { Checkbox } from "@/components/ui/checkbox";

interface lifecycleType {
  lifecycleType: number;
  lifecycleTypeName: string;
  comments: string;
  spId: string;
  extAttr: string;
}

export interface ServiceType {
  servType: number;
  servTypeName: string;
  networkType: string;
  catgType: string;
  comments: string;
  paidFlag: string;
  stdCode: string;
}

export interface FormData {
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
    brandPricePlanId?: string | undefined;
  };
  servType: string;
  paidFlag: string;
  lifecycleType: string;
  offerCatgId: string;
  prodType: string;
}

export const initialStateAddDialog: FormData = {
  offer: {
    offerType: "2",
    offerName: "",
    comments: "",
    offerCode: "",
    effDate: "",
    expDate: "",
    effType: "",
    prodType: "",
    spId: 0,
    brandPricePlanId: "",
  },
  servType: "",
  paidFlag: "",
  lifecycleType: "",
  offerCatgId: "",
  prodType: "",
};

const API_URL_OFFER = apiConfigOffer.offer;

const AddDialog = () => {
  const [formData, setFormData] = useState<FormData>(initialStateAddDialog);
  const parentRef = useRef<any | null>(null);
 const [serviceType, setServiceType] = useState<ServiceType[]>([]);
  const { showAddDialog, handleAddDialog, selectedServiceType, serviceTypeOpen, setServiceTypeOpen, handleServiceTypeChange, selectedCategoryId, refreshCategorySidebar, refreshOfferListSidebar, setRefreshOfferListSidebar } =
    useMainProductOfferListContext();
  const { reload } = useDataGrid();
  const { PostData, GetData } = useCallApi();
  // const { loading, error: serviceTypeError } = MainProductActions();
  const parsedUser = getAuth()?.user;
  const [servTypeOpen, setServTypeOpen] = useState(false);
  const [lifecycleType, setLifecycleType] = useState<lifecycleType[]>([]);
 
  const [effTypeOpen, setEffTypeOpen] = useState(false);
  const [selectedEffType, setSelectedEffType] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

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

  const resetForm = () => {
    setFormData(initialStateAddDialog);
    setErrors({});
    setAlert({ show: false, message: "" });
  };

  useEffect(() => {
    if (showAddDialog === false) {
      resetForm();
    }

    if (showAddDialog) {
      setFormData((prev) => ({
        ...prev,
        offerCatgId: selectedCategoryId || "1",
      }));

      fetchLifecycleType(formData.offer.spId);
      fetchServiceType(1, 10);
    } else {
      setFormData((prev) => ({
        ...prev,
        servType: "",
      }));
    }
  }, [showAddDialog, selectedCategoryId]);

  // useEffect(() => {
  //   if (selectedServiceType && selectedServiceType !== "all") {
  //     setFormData((prev) => ({
  //       ...prev,
  //       servType: Number(selectedServiceType),
  //     }));
  //   }
  // }, [selectedServiceType]);

  const handleInputChange = (field: string, value: string | number) => {
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

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
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

  const fetchServiceType = async (page: number, size: number) => {
    try {
      const response = await GetData(`${API_URL_OFFER}/servType/qryServType`, {
        search: "",
        page: 1,
        size: 100,
        sortBy: "SERV_TYPE_NAME",
        catgType: "M",
        sortDirection: "asc",
      });
      if (response?.data) {
        setServiceType(response?.data);
      }
    } catch (error) {
      toast.error("Error GET Service Type data");
    }
  };

  const validateForm = () => {
    const requiredFields = [
      { key: "offer.offerName", label: "Product Name" },
      { key: "offer.offerCode", label: "Code" },
      { key: "offer.effDate", label: "Effective Date" },
      { key: "servType", label: "Service Type" },
      { key: "paidFlag", label: "Paid Flag" },
      { key: "prodType", label: "Product Line" },
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

  const handleCancel = () => {
    handleAddDialog(false);
  };

  const cleanPayload = JSON.parse(JSON.stringify(formData, (key, value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }
    return value;
  }));

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setAlert({ show: false, message: "" });

      try {
        // console.log("🚀 Creating main product with data:", formData);

        const response = await PostData(`${API_URL_OFFER}/offer/indep/add-indep-prod-spec`, cleanPayload);

        // console.log("📦 API Response:", response);

        if (response?.status) {
          resetForm();
          toast.success("Main Product created successfully!");

          // Refresh category sidebar data
          // console.log("🔄 Refreshing category sidebar after delete...");
          await refreshCategorySidebar();

          setRefreshOfferListSidebar(selectedCategoryId);

          if (reload) {
            reload();
          }

          const createActivity = {
            module: "Manage Main Product",
            description: `Create Main Product => ${formData.offer.offerName}`,
            action: "C",
          };
          doSaveLogActivity(createActivity);

          handleAddDialog(false);
          // console.log("✅ Main Product created successfully");
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
    [formData, handleAddDialog, PostData, reload, parsedUser]
  );

  useEffect(() => {
    const joinedEffType = selectedEffType.join("|");
    setFormData((prev) => ({
      ...prev,
      offer: {
        ...prev.offer,
        effType: joinedEffType,
      },
    }));
  }, [selectedEffType]);

  return (
    <Dialog open={showAddDialog} onOpenChange={handleAddDialog}>
      <DialogContent className="max-w-6xl w-full p-3 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg">Create Main Product</DialogTitle>
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
                    Main Product Name<span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.offer.offerName}
                    onChange={(e) => handleInputChange("offer.offerName", e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Enter Offer name"
                    className={errors["offer.offerName"] ? "border-red-500" : ""}
                  />
                  {errors["offer.offerName"] && <p className="text-red-500 text-xs mt-1">{errors["offer.offerName"]}</p>}
                </div>

                <div>
                  <label className="form-label pb-2">
                    Main Product Code<span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.offer.offerCode}
                    onChange={(e) => handleInputChange("offer.offerCode", e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Enter code"
                    className={errors["offer.offerCode"] ? "border-red-500" : ""}
                  />
                  {errors["offer.offerCode"] && <p className="text-red-500 text-xs mt-1">{errors["offer.offerCode"]}</p>}
                </div>

                {/* Service Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Service Type<span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.servType || ""}
                    onValueChange={(value) => {
                      const selected = serviceType.find((type) => type.servType.toString() === value);
                      handleInputChange("servType", value); // simpan ID
                      handleInputChange("servTypeName", selected?.servTypeName || ""); // simpan label
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={`w-full border ${errors["servType"] ? "border-red-500" : "border-gray-300"}`}>
                      <SelectValue placeholder="Select Service Type" />
                    </SelectTrigger>
                    <SelectContent side="bottom" className="max-h-60 overflow-y-auto">
                      {serviceType.map((type) => (
                        <SelectItem key={type.servType} value={type.servType.toString()}>
                          {type.servTypeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors["servType"] && <p className="text-red-500 text-xs mt-1">{errors["servType"]}</p>}
                </div>

                {/* Life Cycle Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Lifecycle Type</label>
                  <Select value={formData.lifecycleType || ""} onValueChange={(value) => handleInputChange("lifecycleType", value)} disabled={isSubmitting}>
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
                </div>

                {/* Comments */}
                <div>
                  <label className="form-label pb-2">Comments</label>
                  <textarea value={formData.offer.comments} onChange={(e) => handleInputChange("offer.comments", e.target.value)} className="w-full input h-24 p-2" placeholder="Enter comments..." disabled={isSubmitting} />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Effective Date */}
                <div>
                  <label className="form-label pb-2">
                    Effective Date<span className="text-red-500">*</span>
                  </label>
                  <Input type="date" value={formData.offer.effDate} onChange={(e) => handleInputChange("offer.effDate", e.target.value)} disabled={isSubmitting} className={errors["offer.effDate"] ? "border-red-500" : ""} />
                  {errors["offer.effDate"] && <p className="text-red-500 text-xs mt-1">{errors["offer.effDate"]}</p>}
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="form-label pb-2">Expiry Date</label>
                  <Input type="date" value={formData.offer.expDate} onChange={(e) => handleInputChange("offer.expDate", e.target.value)} disabled={isSubmitting} className={errors["offer.expDate"] ? "border-red-500" : ""} />
                  {/* {errors["offer.expDate"] && <p className="text-red-500 text-xs mt-1">{errors["offer.expDate"]}</p>} */}
                </div>

                {/* Effective Type */}
                <div>
                  <label className="form-label pb-2">Effective Type</label>
                  <Popover open={effTypeOpen} onOpenChange={setEffTypeOpen}>
                    <PopoverTrigger asChild>
                      <button type="button" className="w-full px-2 py-1 text-sm h-10 border border-gray-300 rounded-md flex items-center justify-between">
                        <span className="truncate w-[85%] text-left">
                          {selectedEffType.length === 0
                            ? "Select Effective Type"
                            : effectiveType
                                .filter((item) => selectedEffType.includes(item.value))
                                .map((item) => item.label)
                                .join(" | ")}
                        </span>
                        <MdKeyboardArrowDown className="h-4 w-4 opacity-50" />
                      </button>
                    </PopoverTrigger>

                    <PopoverContent className="w-[520px]">
                      <div className="flex flex-col gap-2">
                        {effectiveType.map((item) => (
                          <label key={item.value} className="flex items-center gap-2 text-md">
                            <Checkbox
                              checked={selectedEffType.includes(item.value)}
                              onCheckedChange={(checked) => {
                                setSelectedEffType((prev) => (checked ? [...prev, item.value] : prev.filter((val) => val !== item.value)));
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
                <div>
                  <label className="form-label pb-2">
                    Paid Flag<span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center text-sm">
                      <input type="radio" name="paidFlag" value="N" checked={formData.paidFlag === "N"} onChange={(e) => handleInputChange("paidFlag", e.target.value)} disabled={isSubmitting} className="mr-2" />
                      Pre-Paid
                    </label>
                    <label className="flex items-center text-sm">
                      <input type="radio" name="paidFlag" value="Y" checked={formData.paidFlag === "Y"} onChange={(e) => handleInputChange("paidFlag", e.target.value)} disabled={isSubmitting} className="mr-2" />
                      Post-Paid
                    </label>
                    {errors["paidFlag"] && <p className="text-red-500 text-xs mt-1">{errors["paidFlag"]}</p>}
                  </div>
                </div>

                {/* Brand Price Plan */}
                <div>
                  <label className="form-label pb-2">Brand Price Plan</label>
                  <Select value={formData.offer.brandPricePlanId} onValueChange={(value) => handleInputChange("brandPricePlanId", value)} disabled={true}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Brand Price Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* <SelectItem value="Y">Yes</SelectItem>
                      <SelectItem value="N">No</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>

                {/* Product Line */}
                <div>
                  <label className="form-label pb-2">Product Line<span className="text-red-500">*</span></label>
                  <Select
                    value={formData.prodType}
                    onValueChange={(value) => {
                      handleInputChange("prodType", value);
                      handleInputChange("offer.prodType", value);
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
                  {errors["prodType"] && <p className="text-red-500 text-xs mt-1">{errors["prodType"]}</p>}
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

export default AddDialog;
