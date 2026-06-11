import { useCallApi } from "@/hooks";
import { useUsagePriceCreateContext } from "../../hooks";
import { useEffect, useState } from "react";
import { apiConfig } from "@/config/api.config";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useAuthContext } from "@/auth";
import MappingZoneTab from "./MappingZone";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";

const API_URL = apiConfig.service_price_plan;

interface RatePlanZone {
  mappingSrcType: string;
  mappingSrcValue: string;
  mappingDescType: string;
  mappingDescValue: string;
  labelShow: string;
  priority: number;
}

interface CreateRatePlan {
  offerVerId: number;
  reId: number;
  ratePlanName: string;
  ratePlanCode: string;
  remarks: string | null;
  ratePlanType: string;
  templateFlag: string;
  catalogId: number | null;
  spId: number;
  ratePlanZones: RatePlanZone[] | null;
}

const AddRatePlanDialog = () => {
  const {
    showAddDialog,
    handleAddDialog,
    selectedEvent,
    getRatePlans,
    eventList,
  } = useUsagePriceCreateContext();
  const { GetData, PostData } = useCallApi();

  const {  dataPricePlan, dataPricePlanDetail, selectedOfferVerId  } = usePortalData();
  const initialFormField: CreateRatePlan = {
    offerVerId: selectedOfferVerId || 0,
    reId: 0,
    ratePlanName: "",
    ratePlanCode: "",
    remarks: null,
    ratePlanType: "",
    templateFlag: "N",
    catalogId: null,
    spId: 0,
    ratePlanZones: null,
  };
  const [activeTab, setActiveTab] = useState(0);

  const [formField, setFormField] = useState<CreateRatePlan>(initialFormField);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateFormsWallet = (
    formField: typeof initialFormField,
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    mode: "create" | "update" = "create"
  ) => {
    const requiredFields =
      mode === "create"
        ? [
            { key: "reId", label: "Event name" },
            { key: "ratePlanName", label: "Rate Plan Name" },
            { key: "ratePlanType", label: "Rate Plan Type" },
          ]
        : [
            { key: "eventName", label: "Event Name" },
            { key: "ratePlanName", label: "Rate Plan Name" },
            { key: "ratePlanType", label: "Rate Plan Type" },
          ];
          
    const newErrors: Record<string, string> = {};
    let isValid = true;

    requiredFields.forEach(({ key, label }) => {
      const value = formField[key as keyof typeof formField];

      if (value === "" || value === null || value === undefined) {
        newErrors[key] = `${label} is required`;
        toast.error(`${label} is required`);
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };
  
  const resetForm = () => {
    setFormField({
      ...initialFormField,
      offerVerId: selectedOfferVerId || 0,
      reId: selectedEvent ?? 0,
    });
    setErrors({});
    setActiveTab(0);
    setIsSubmitting(false);
  };
  
  const handleDialogClose = (open: boolean) => {
    handleAddDialog(open);
    if (!open) {
      resetForm();
    }
  };
  
  const doCreateRatePlan = async (formField: CreateRatePlan) => {
    setIsSubmitting(true);
    try {
      const response = await PostData(`${API_URL}/rate-plan/create`, formField);
      if (response?.status) {
        toast.success(response.message);
        handleDialogClose(false);
        getRatePlans(selectedEvent ?? 0);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Error creating Rate Plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateFormsWallet(formField, setErrors, "create")) return;

    doCreateRatePlan(formField);
  };
  
  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  useEffect(() => {
    if (selectedEvent) {
      setFormField((prev) => ({
        ...prev,
        reId: selectedEvent,
        offerVerId: selectedOfferVerId || 0,
      }));
    }
  }, [selectedEvent]);

  return (
    <Dialog open={showAddDialog} onOpenChange={handleDialogClose}>
      <DialogContent className="container-fixed max-w-[1000px] flex flex-col p-5 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Rate Plan - Create</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody className="scrollable">
          <div className="flex flex-col">
            <form onSubmit={handleSubmit}>
              <div className="card-body grid gap-5">
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Event Name<span className="text-red-500">*</span>
                    </label>
                    <div className="w-full">
                      <Input
                        className={errors.reId ? "border-red-500" : ""}
                        type="text"
                        value={
                          eventList.find((item) => item.reId === formField.reId)
                            ?.reName || ""
                        }
                        disabled
                        placeholder="Rate Plan Name"
                      />
                      {errors.reId && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.reId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Rate Plan Name<span className="text-red-500">*</span>
                    </label>
                    <div className="w-full">
                      <Input
                        className={errors.ratePlanName ? "border-red-500" : ""}
                        type="text"
                        value={formField.ratePlanName}
                        onChange={(e) => {
                          setFormField({
                            ...formField,
                            ratePlanName: e.target.value,
                          });
                          setErrors({ ...errors, ratePlanName: "" });
                        }}
                        placeholder="Rate Plan Name"
                      />
                      {errors.ratePlanName && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.ratePlanName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Rate Plan Code
                    </label>
                    <div className="w-full">
                      <Input
                        type="text"
                        value={formField.ratePlanCode}
                        onChange={(e) => {
                          setFormField({
                            ...formField,
                            ratePlanCode: e.target.value,
                          });
                        }}
                        placeholder="Rate Plan Code"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Remarks
                    </label>
                    <div className="w-full">
                      <Input
                        type="text"
                        value={formField.remarks || ""}
                        onChange={(e) => {
                          setFormField({
                            ...formField,
                            remarks: e.target.value,
                          });
                        }}
                        placeholder="Remarks"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Rate Plan Type<span className="text-red-500">*</span>
                    </label>
                    <div className="w-full">
                      <Select
                        value={formField.ratePlanType}
                        onValueChange={(value) => {
                          setFormField({
                            ...formField,
                            ratePlanType: value,
                          });
                          setErrors({ ...errors, ratePlanType: "" });
                        }}
                      >
                        <SelectTrigger className={errors.ratePlanType ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select Rate Plan Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Rating</SelectItem>
                          <SelectItem value="4">Accumulation</SelectItem>
                          <SelectItem value="3">Benefit</SelectItem>
                          <SelectItem value="5">Tax</SelectItem>
                          {/* <SelectItem value="0">Deposit</SelectItem>
                          <SelectItem value="6">Optional Rate Plan</SelectItem> */}
                        </SelectContent>
                      </Select>
                      {errors.ratePlanType && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.ratePlanType}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="w-full">
                  <div className="mb-6">
                    <div className="border-b border-gray-200 mb-4">
                      <nav className="flex space-x-8">
                        <button
                          type="button"
                          onClick={() => handleTabChange(0)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 0
                              ? "border-gray-500 text-black"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          Event Features
                        </button>
                      </nav>
                    </div>

                    {activeTab === 0 && (
                      <MappingZoneTab
                        formField={formField}
                        setFormField={setFormField}
                      />
                    )}
                  </div>
                </div>
                
                <div className="w-full">
                  <div className="flex justify-end gap-5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDialogClose(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <RefreshCw className="animate-spin h-8 w-8 text-white mx-3" />
                      ) : (
                        "Create"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default AddRatePlanDialog;