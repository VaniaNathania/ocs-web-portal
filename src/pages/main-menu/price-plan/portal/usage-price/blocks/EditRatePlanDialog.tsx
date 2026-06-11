import { useCallApi } from "@/hooks";
import { useEffect, useState, useCallback } from "react";
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
import { useUsagePriceCreateContext } from "../hooks";
import MappingZoneTab from "./MappingZoneUpdate";

const API_URL = apiConfig.service_price_plan;

interface RatePlanZone {
  mappingSrcType: string;
  mappingSrcValue: string;
  mappingDescType: string;
  mappingDescValue: string;
  labelShow: string;
  priority: number;
}

type ZoneFlag = "Y" | "N"; // 👈 union type

interface UpdateRatePlan {
  ratePlanName: string;
  ratePlanCode: string;
  remarks: string | null;
  ratePlanZones: RatePlanZone[] | null;
  zoneFlag: ZoneFlag; // 👈 tambahan
}

interface UpdateRatePlanDialogProps {
  show: boolean;
  ratePlanId: number | null;
  onClose: () => void;
  onUpdateSuccess?: () => void;
}

const UpdateRatePlanDialog = ({
  ratePlanId,
  show,
  onClose,
  onUpdateSuccess,
}: UpdateRatePlanDialogProps) => {
  const { selectedEvent, getRatePlans, mappingZonesMap } =
    useUsagePriceCreateContext();
  const { GetData, PutData } = useCallApi();

  const initialState: UpdateRatePlan = {
    ratePlanName: "",
    ratePlanCode: "",
    remarks: null,
    ratePlanZones: null,
    zoneFlag: "N", // 👈 default
  };

  const [activeTab, setActiveTab] = useState(0);
  const [formField, setFormField] = useState<UpdateRatePlan>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typeRP, setTypeRP] = useState<string>("");
  const [initialZones, setInitialZones] = useState<RatePlanZone[] | null>(null);

  const validateFormsWallet = (
    formField: UpdateRatePlan,
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    mode: "create" | "update" = "update"
  ) => {
    const requiredFields = [{ key: "ratePlanName", label: "Rate Plan Name" }];

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

  const doFetchData = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        const minDelay = new Promise((resolve) => setTimeout(resolve, 300));
        const fetchData = GetData(`${API_URL}/rate-plan/detail/${id}`, {});
        const [response] = await Promise.all([fetchData, minDelay]);

        if (response?.status) {
          setTypeRP(response.data.ratePlanType);
          const zones = response.data.ratePlanZones || null;
          setFormField({
            ratePlanName: response.data.ratePlanName || "",
            ratePlanCode: response.data.ratePlanCode || "",
            remarks: response.data.remarks || "",
            ratePlanZones: zones,
            zoneFlag: "N",
          });
          setInitialZones(zones); // 👈 simpan snapshot awal
        } else {
          toast.error("Failed to fetch rate plan data");
          setFormField(initialState);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to fetch rate plan data");
        setFormField(initialState);
      } finally {
        setIsLoading(false);
      }
    },
    [show]
  );

  const doUpdateRatePlan = async (formField: UpdateRatePlan) => {
    setIsSubmitting(true);
    try {
      const response = await PutData(
        `${API_URL}/rate-plan/update/${ratePlanId}`,
        formField
      );

      if (response?.status) {
        toast.success(response.message);
        onUpdateSuccess?.();
        getRatePlans(selectedEvent ?? 0);
        onClose();
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Error updating Rate Plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateFormsWallet(formField, setErrors, "update")) return;
    doUpdateRatePlan(formField);
  };

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  useEffect(() => {
    if (ratePlanId !== null) {
      doFetchData(ratePlanId.toString());
    }
  }, [doFetchData, ratePlanId]);

  const resetForm = () => {
    setFormField(initialState);
    setErrors({});
  };

  const handleCloseDialog = () => {
    resetForm();
    onClose();
  };

  // 👇 Auto ubah zoneFlag ke "Y" kalau ada perubahan ratePlanZones
  useEffect(() => {
    if (!initialZones) return;

    const zonesChanged =
      JSON.stringify(initialZones) !== JSON.stringify(formField.ratePlanZones);

    if (zonesChanged) {
      setFormField((prev) => ({ ...prev, zoneFlag: "Y" }));
    } else {
      setFormField((prev) => ({ ...prev, zoneFlag: "N" }));
    }
  }, [formField.ratePlanZones, initialZones]);

  return (
    <Dialog open={show} onOpenChange={handleCloseDialog}>
      <DialogContent className="container-fixed max-w-[1000px] flex flex-col p-5 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Rate Plan - Update</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody className="scrollable">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="animate-spin h-8 w-8 text-gray-500" />
            </div>
          ) : (
            <div className="flex flex-col">
              <form onSubmit={handleSubmit}>
                <div className="card-body grid gap-5">
                  {/* Rate Plan Name */}
                  <div className="w-full">
                    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                      <label className="form-label flex items-center gap-1 max-w-56">
                        Rate Plan Name<span className="text-red-500">*</span>
                      </label>
                      <div className="w-full">
                        <Input
                          className={
                            errors.ratePlanName ? "border-red-500" : ""
                          }
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

                  {/* Rate Plan Code */}
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

                  {/* Rate Plan Type */}
                  <div className="w-full">
                    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                      <label className="form-label flex items-center gap-1 max-w-56">
                        Rate Plan Type
                      </label>
                      <div className="w-full">
                        <Select value={typeRP} disabled>
                          <SelectTrigger>
                            <SelectValue
                              placeholder="Select Rate Plan Type"
                              defaultValue={typeRP}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Rating</SelectItem>
                            <SelectItem value="3">Benefit</SelectItem>
                            <SelectItem value="4">Accumulation</SelectItem>
                            <SelectItem value="5">Tax</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
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

                  {/* MappingZoneTab */}
                  <MappingZoneTab
                    formField={formField}
                    setFormField={setFormField}
                    ratePlanId={ratePlanId}
                    isReadOnly={
                      !!(ratePlanId && mappingZonesMap[ratePlanId]?.length > 0)
                    }
                  />

                  {/* Action Buttons */}
                  <div className="w-full">
                    <div className="flex justify-end gap-5">
                      <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        type="submit"
                        disabled={isSubmitting || isLoading}
                      >
                        {isSubmitting ? (
                          <RefreshCw className="animate-spin h-8 w-8 text-white mx-3" />
                        ) : (
                          "Update"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateRatePlanDialog;
