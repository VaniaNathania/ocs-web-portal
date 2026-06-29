import { useCallApi } from "@/hooks";
import { useEffect, useState } from "react";
import { apiConfig } from "@/config/api.config";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info, Trash2 } from "lucide-react";
import { useAuthContext } from "@/auth";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { useSubscriptionPriceCreateContext } from "../hooks";
import { z } from "zod";
import { subscriptionCreateRatePlanSchema } from "../types/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SearchSelect } from "@/components/common/SearchSelect";

type EventFeature = {
  priority: number;
  mappingSrcType: string;
  mappingSrcValue: string;
  mappingDesValue: string;
  mappingDesType: string;
  labelShow: string;
};

type DetailItem = {
  priority: number;
  mappingSrcType: string;
  mappingSrcValue: string;
  mappingDesValue: string;
  mappingDesType: string;
  labelShow: string;
};

const initialDetailsItem: DetailItem = {
  priority: 1,
  mappingSrcType: "1",
  mappingSrcValue: "",
  mappingDesValue: "",
  mappingDesType: "",
  labelShow: "",
};

const API_URL = apiConfig.service_price_plan;
type SubscriptionCreateRatePlanForm = z.infer<typeof subscriptionCreateRatePlanSchema>;

const AddRatePlanDialog = () => {
  const { showRatePlanDialog, handleRatePlanDialog, selectedEvent, selectedRatePlan, doGetListRatePlan } = useSubscriptionPriceCreateContext();
  const { GetData, PostData, PutData } = useCallApi();
  const { selectedOfferVerId } = usePortalData();

  const methods = useForm<SubscriptionCreateRatePlanForm>({
    resolver: zodResolver(subscriptionCreateRatePlanSchema),
    defaultValues: {
      offerVerId: selectedOfferVerId || 0,
      reId: selectedEvent || 0,
      ratePlanName: undefined,
      // ratePlanCode: undefined,
      remarks: null,
      ratePlanType: "",
      templateFlag: "N",
      catalogId: null,
      spId: 0,
      ratePlanZones: null,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const [eventMenu, setEventMenu] = useState<EventByReTypeProps[]>([]);
  const [eventFeatures, setEventFeatures] = useState<EventFeature[]>([]);
  const [detailItems, setDetailItems] = useState<DetailItem>(initialDetailsItem);
  const [sourceType, setSourceType] = useState<
    {
      mappingSrcType: string;
      mappingSrcTypeName: string;
    }[]
  >([]);
  const [eventFeaturesType, setEventFeaturesType] = useState<
    {
      reAttrId: number;
      reAttrName: string;
    }[]
  >([]);
  const [enumerationType, setEnumerationType] = useState<
    {
      enumType: string;
      enumTypeName: string;
    }[]
  >([]);
  const [zoneMaps, setZoneMaps] = useState<
    {
      zoneMapId: number;
      zoneMapName: string;
    }[]
  >([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchZoneMap = async () => {
    
  };

  const fetchSourceType = async () => {
    
  };

  const fetchEventFeature = async (reAttrName?: string) => {
    
  };

  const fetchEnumeration = async () => {
    
  };

  const fetchEvent = async () => {
    try {
      const reType = 9;
      const response = await GetData(`${API_URL}/event/list`, {
        offerVerId: selectedOfferVerId,
        reType: 3,
      });
      if (response && response.data) {
        setEventMenu(response.data);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      toast.error("Failed to load event data");
    }
  };

  const findSelectedEvent = () => {
    const reId = methods.watch("reId");
    const log = eventMenu.find((event) => event.reId === reId) || null;
    // console.log(eventMenu);
    return log;
    // return (
    //   eventMenu.find((event) => event.recurringReType === String(reId)) || null
    // );
  };

  const doCreateRatePlan = async (formField: SubscriptionCreateRatePlanForm) => {
    setIsSubmitting(true);
    try {
      const response = await PostData(`${API_URL}/rate-plan/create`, formField);

      if (response?.status) {
        toast.success(response.message);
        handleRatePlanDialog(false, "create");
        doGetListRatePlan(selectedEvent ?? 0);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Error creating Rate Plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: SubscriptionCreateRatePlanForm) => {
    if (eventFeatures.length > 0) {
      setValue("ratePlanZones", eventFeatures);

      const allNull = Object.values(data.ratePlanZones ?? {}).every((v) => v == null);
      const cleaned = {
        ...data,
        ratePlanZones: allNull ? null : data.ratePlanZones,
      };
      doCreateRatePlan(cleaned);
    } else {
      doCreateRatePlan(data);
    }
  };

  const addNewDetailItem = (data: DetailItem) => {
    if (!data.mappingSrcType || !data.mappingSrcValue || !data.mappingDesType || (data.mappingDesType === "0" && !data.mappingDesValue)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const nextPriority = eventFeatures.length > 0 ? Math.max(...eventFeatures.map((item) => item.priority)) + 1 : 1;

    const newItem: DetailItem = {
      priority: nextPriority,
      mappingSrcType: data.mappingSrcType,
      mappingSrcValue: data.mappingSrcValue,
      mappingDesValue: data.mappingDesValue,
      mappingDesType: data.mappingDesType,
      labelShow: data.labelShow,
    };

    setEventFeatures([...eventFeatures, newItem]);
    setValue("ratePlanZones", [...(watch("ratePlanZones") ?? []), newItem]);
  };

  const removeEventFeature = (id: number) => {
    setEventFeatures(eventFeatures.filter((feature) => feature.priority !== id));
  };

  useEffect(() => {
    const selectedSrcName = detailItems.mappingSrcType === "1" ? (eventFeaturesType.find((ev) => String(ev.reAttrId) === detailItems.mappingSrcValue)?.reAttrName ?? "") : detailItems.mappingSrcType === "2" ? (enumerationType.find((et) => et.enumType === detailItems.mappingSrcValue)?.enumTypeName ?? "") : "";

    const descDisplay = detailItems.mappingDesType === "0" ? (zoneMaps.find((zm) => String(zm.zoneMapId) === detailItems.mappingDesValue)?.zoneMapName ?? "") : detailItems.mappingDesType === "1" ? detailItems.mappingDesValue : "";

    const defaultLabel = `${selectedSrcName} - ${descDisplay}`;

    setDetailItems((prev) => ({
      ...prev,
      labelShow: defaultLabel,
    }));
  }, [detailItems.mappingSrcType, detailItems.mappingSrcValue, detailItems.mappingDesType, detailItems.mappingDesValue, eventFeaturesType, enumerationType, zoneMaps]);

  useEffect(() => {
    fetchZoneMap();
    fetchSourceType();
    fetchEventFeature();
    fetchEnumeration();
    fetchEvent();
  }, []);

  useEffect(() => {
    if (detailItems.mappingDesType !== "0" && detailItems.mappingDesValue !== "") {
      setDetailItems((prev) => ({
        ...prev,
        mappingDesValue: "",
      }));
    }
  }, [detailItems.mappingDesValue]);

  useEffect(() => {
    setDetailItems((prev) => ({
      ...prev,
      mappingSrcValue: "",
      labelShow: "",
    }));
  }, [detailItems.mappingSrcType]);

  useEffect(() => {
    if (!showRatePlanDialog) return;

    if (showRatePlanDialog && showRatePlanDialog.mode === "create") {
      setValue("reId", selectedEvent ?? 0);
      setValue("offerVerId", selectedOfferVerId ?? 0);

      setEventFeatures([]);
      setDetailItems(initialDetailsItem);
    }
  }, [showRatePlanDialog, selectedEvent, selectedOfferVerId]);

  return (
    <Dialog open={showRatePlanDialog.show} onOpenChange={(open) => handleRatePlanDialog(open, showRatePlanDialog.mode)}>
      <DialogContent className="container-fixed max-w-[1200px] max-h-[90vh] flex flex-col p-5 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Rate Plan - Create</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody className="scrollable overflow-y-auto">
          <div className="flex flex-col">
            <form id="add-rate-plan" onSubmit={handleSubmit(onSubmit)}>
              <div className="card-body grid gap-5">
                {/* Event Name */}
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 min-w-32 max-w-32">
                      <span className="text-red-500">*</span>Event Name
                    </label>
                    <div className="w-full">
                      <Input className={`${errors.reId ? "border-red-500" : ""} bg-gray-100`} type="text" value={findSelectedEvent()?.reName || "Event not found"} disabled placeholder="Event Name" />
                      {errors.reId && <div className="text-red-500 text-xs mt-1">{errors.reId.message}</div>}
                    </div>
                  </div>
                </div>

                {/* Rate Plan Name */}
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 min-w-32 max-w-32">
                      <span className="text-red-500">*</span>Rate Plan Name
                    </label>
                    <div className="w-full">
                      <Input className={errors.ratePlanName ? "border-red-500" : ""} type="text" {...register("ratePlanName")} placeholder="Rate Plan Name" />
                      {errors.ratePlanName && <div className="text-red-500 text-xs mt-1">{errors.ratePlanName.message}</div>}
                    </div>
                  </div>
                </div>

                {/* Rate Plan Code */}
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 min-w-32 max-w-32">Rate Plan Code</label>
                    <div className="w-full">
                      <Input type="text" {...register("ratePlanCode")} placeholder="Rate Plan Code" />
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 min-w-32 max-w-32">Remarks</label>
                    <div className="w-full">
                      <Input type="text" {...register("remarks")} placeholder="Remarks" />
                    </div>
                  </div>
                </div>

                {/* Rate Plan Type */}
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 min-w-32 max-w-32">
                      <span className="text-red-500">*</span>Rate Plan Type
                    </label>
                    <div className="w-full ">
                      <div className={`flex gap-6 `}>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="ratePlanType"
                            value="1"
                            checked={watch("ratePlanType") === "1"}
                            onChange={(e) => {
                              setValue("ratePlanType", e.target.value, { shouldValidate: true });
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          Rating
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="ratePlanType"
                            value="4"
                            checked={watch("ratePlanType") === "4"}
                            onChange={(e) => {
                              setValue("ratePlanType", e.target.value, { shouldValidate: true });
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          Accumulation
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="ratePlanType"
                            value="3"
                            checked={watch("ratePlanType") === "3"}
                            onChange={(e) => {
                              setValue("ratePlanType", e.target.value, { shouldValidate: true });
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          Benefit
                        </label>
                        
                      </div>
                      {errors.ratePlanType && <div className="text-red-500 text-xs mt-1">{errors.ratePlanType.message}</div>}
                    </div>
                  </div>
                </div>

                {/* Event Feature Section */}

                {/* Info Message */}

                {/* Detail Section */}
                
              </div>
            </form>
          </div>
        </DialogBody>
        <DialogFooter className="flex justify-end gap-5">
          <Button type="button" variant="outline" onClick={() => handleRatePlanDialog(false, "create")}>
            Cancel
          </Button>
          <Button form="add-rate-plan" variant="default" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <RefreshCw className="animate-spin h-4 w-4 mr-2" /> : null}
            {isSubmitting ? "Creating..." : "OK"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRatePlanDialog;
