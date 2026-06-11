import { useCallApi } from "@/hooks";
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
import { RefreshCw, Info, Trash2 } from "lucide-react";
import { useAuthContext } from "@/auth";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { useSubscriptionPriceCreateContext } from "../hooks";
import z from "zod";
import { subscriptionUpdateRatePlanSchema } from "../types/form";
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

type SubscriptionUpdateRatePlanForm = z.infer<
  typeof subscriptionUpdateRatePlanSchema
>;
const API_URL = apiConfig.service_price_plan;

const EditRatePlanDialog = () => {
  const {
    showRatePlanDialog,
    handleRatePlanDialog,
    selectedEvent,
    selectedRatePlan,
    doGetListRatePlan,
  } = useSubscriptionPriceCreateContext();

  const { GetData, PostData, PutData } = useCallApi();
  const {  selectedOfferVerId  } = usePortalData();

  const methods = useForm<SubscriptionUpdateRatePlanForm>({
    resolver: zodResolver(subscriptionUpdateRatePlanSchema),
    mode: "onChange",
    defaultValues: {
      ratePlanName: undefined,
      ratePlanCode: undefined,
      remarks: null,
      zoneFlag: "N",
      ratePlanZones: null,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = methods;

  const [eventMenu, setEventMenu] = useState<EventByReTypeProps[]>([]);
  const [eventFeatures, setEventFeatures] = useState<EventFeature[]>([]);
  const [detailItems, setDetailItems] =
    useState<DetailItem>(initialDetailsItem);
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
  const [ratePlanDetail, setRatePlanDetail] = useState<RatePlanDetail | null>(
    null
  );
  const [hasZoneMap, setHasZoneMap] = useState<boolean>(false);

  const [originalRatePlanZones, setOriginalRatePlanZones] = useState<
    EventFeature[] | null
  >(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchZoneMap = async () => {
    try {
      const response = await GetData(`${API_URL}/mapping/zone-map/list`, {});

      if (response.status) {
        setZoneMaps(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching zone map");
    }
  };

  const fetchSourceType = async () => {
    try {
      const response = await GetData(`${API_URL}/mapping/source-type/list`, {});

      if (response.status) {
        setSourceType(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching source type");
    }
  };

  const fetchEventFeature = async (reAttrName?: string) => {
    try {
      const response = await GetData(`${API_URL}/mapping/re-attr/list`, {
        reType: 3,
        reAttrName: !reAttrName ? undefined : reAttrName,
        spId: 0,
      });

      if (response.status) {
        setEventFeaturesType(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching event feature");
    }
  };

  const fetchEnumeration = async () => {
    try {
      const response = await GetData(`${API_URL}/mapping/enum/list`, {});

      if (response.status) {
        setEnumerationType(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching enumeration");
    }
  };

  const fetchRatePlanDetail = async (ratePlanId: number) => {
    setIsLoading(true);
    const minDelay = new Promise((resolve) => setTimeout(resolve, 300));
    const fetchData = await GetData(
      `${API_URL}/rate-plan/detail/${ratePlanId}`,
      {}
    );
    const fetchZone = await GetData(`${API_URL}/rate-plan/zone/list`, {
      ratePlanId,
    });
    const [response, zone] = await Promise.all([
      fetchData,
      fetchZone,
      minDelay,
    ]);
    if (response.status) {
      setRatePlanDetail(response.data);
      reset({
        ratePlanName: response.data?.ratePlanName,
        ratePlanCode: response.data?.ratePlanCode,
        remarks: response.data?.remarks,
        zoneFlag: "N",
        ratePlanZones: null,
      });

      if (Array.isArray(zone.data) && zone.data.length > 0) {
        setHasZoneMap(true);
        setEventFeatures(zone.data);
        // Simpan data original ratePlanZones
        setOriginalRatePlanZones([...zone.data]);
      } else {
        setHasZoneMap(false);
        setEventFeatures([]);
        setOriginalRatePlanZones([]);
      }
    }

    setIsLoading(false);
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
    const reId = ratePlanDetail?.reId;
    const log = eventMenu.find((event) => event.reId === reId) || null;
    return log;
  };

  const hasRatePlanZonesChanged = (
    current: EventFeature[] | null,
    original: EventFeature[] | null
  ): boolean => {
    // Jika keduanya null atau undefined, tidak ada perubahan
    if (!current && !original) return false;
    if (!current && original) return original.length > 0;
    if (current && !original) return current.length > 0;

    // Jika panjang array berbeda, ada perubahan
    if (current!.length !== original!.length) return true;

    // Bandingkan setiap item dalam array
    return current!.some((currentItem, index) => {
      const originalItem = original![index];
      return (
        currentItem.priority !== originalItem.priority ||
        currentItem.mappingSrcType !== originalItem.mappingSrcType ||
        currentItem.mappingSrcValue !== originalItem.mappingSrcValue ||
        currentItem.mappingDesValue !== originalItem.mappingDesValue ||
        currentItem.mappingDesType !== originalItem.mappingDesType ||
        currentItem.labelShow !== originalItem.labelShow
      );
    });
  };

  const doUpdateRatePlan = async (
    formField: SubscriptionUpdateRatePlanForm,
    ratePlanId: number
  ) => {
    setIsSubmitting(true);
    try {
      // Tentukan zoneFlag berdasarkan apakah ada perubahan pada ratePlanZones
      const currentRatePlanZones =
        eventFeatures.length > 0 ? eventFeatures : null;
      const zonesChanged = hasRatePlanZonesChanged(
        currentRatePlanZones,
        originalRatePlanZones
      );

      const updatedFormField = {
        ...formField,
        zoneFlag: zonesChanged ? "Y" : "N",
      };

      const response = await PutData(
        `${API_URL}/rate-plan/update/${ratePlanId}`,
        updatedFormField
      );

      if (response?.status) {
        toast.success(response?.message);
        handleRatePlanDialog(false, "update");
        doGetListRatePlan(selectedEvent ?? 0);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Error updating Rate Plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: SubscriptionUpdateRatePlanForm) => {
    const allNull = Object.values(data.ratePlanZones ?? {}).every(
      (v) => v == null
    );
    const cleaned = {
      ...data,
      ratePlanZones: allNull ? null : data.ratePlanZones,
    };

    doUpdateRatePlan(cleaned, selectedRatePlan ?? 0);
  };

  const addNewDetailItem = (data: DetailItem) => {
    const nextPriority =
      eventFeatures.length > 0
        ? Math.max(...eventFeatures.map((item) => item.priority)) + 1
        : 1;

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
    const updated = eventFeatures.filter((feature) => feature.priority !== id);
    setEventFeatures(updated);
    setValue("ratePlanZones", updated.length > 0 ? updated : null);
  };

  useEffect(() => {
    setValue("ratePlanZones", eventFeatures.length > 0 ? eventFeatures : null);
  }, [eventFeatures, setValue]);

  useEffect(() => {
    const selectedSrcName =
      detailItems.mappingSrcType === "1"
        ? (eventFeaturesType.find(
            (ev) => String(ev.reAttrId) === detailItems.mappingSrcValue
          )?.reAttrName ?? "")
        : detailItems.mappingSrcType === "2"
          ? (enumerationType.find(
              (et) => et.enumType === detailItems.mappingSrcValue
            )?.enumTypeName ?? "")
          : "";

    const descDisplay =
      detailItems.mappingDesType === "0"
        ? (zoneMaps.find(
            (zm) => String(zm.zoneMapId) === detailItems.mappingDesValue
          )?.zoneMapName ?? "")
        : detailItems.mappingDesType === "1"
          ? detailItems.mappingDesValue
          : "";

    const defaultLabel = `${selectedSrcName} - ${descDisplay}`;

    setDetailItems((prev) => ({
      ...prev,
      labelShow: defaultLabel,
    }));
  }, [
    detailItems.mappingSrcType,
    detailItems.mappingSrcValue,
    detailItems.mappingDesType,
    detailItems.mappingDesValue,
    eventFeaturesType,
    enumerationType,
    zoneMaps,
  ]);

  useEffect(() => {
    fetchZoneMap();
    fetchSourceType();
    fetchEventFeature();
    fetchEnumeration();
    fetchEvent();
  }, []);

  useEffect(() => {
    if (
      detailItems.mappingDesType !== "0" &&
      detailItems.mappingDesValue !== ""
    ) {
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
    if (!showRatePlanDialog.show) return;

    if (
      showRatePlanDialog.show &&
      showRatePlanDialog.mode === "update" &&
      selectedRatePlan
    ) {
      fetchRatePlanDetail(selectedRatePlan);
    }
  }, [showRatePlanDialog.show, selectedEvent]);

  return (
    <Dialog
      open={showRatePlanDialog.show}
      onOpenChange={(open) =>
        handleRatePlanDialog(open, showRatePlanDialog.mode)
      }
    >
      <DialogContent className="container-fixed max-w-[1200px] max-h-[90vh] flex flex-col p-5 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Rate Plan - Edit</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody className="scrollable overflow-y-auto">
          <div className="flex flex-col">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <div className="animate-pulse flex space-x-4 w-full">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-500">
                  Loading Rate Plan Details...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="card-body grid gap-5">
                  {/* Event Name */}
                  <div className="w-full">
                    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                      <label className="form-label flex items-center gap-1 min-w-32 max-w-32">
                        <span className="text-red-500">*</span>Event Name
                      </label>
                      <div className="w-full">
                        <Input
                          className={"bg-gray-100"}
                          type="text"
                          value={
                            findSelectedEvent()?.reName || "Event not found"
                          }
                          disabled
                          placeholder="Event Name"
                        />
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
                        <Input
                          className={
                            errors.ratePlanName ? "border-red-500" : ""
                          }
                          type="text"
                          {...register("ratePlanName")}
                          placeholder="Rate Plan Name"
                        />
                        {errors.ratePlanName && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.ratePlanName.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rate Plan Code */}
                  <div className="w-full">
                    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                      <label className="form-label flex items-center gap-1 min-w-32 max-w-32">
                        Rate Plan Code
                      </label>
                      <div className="w-full">
                        <Input
                          type="text"
                          {...register("ratePlanCode")}
                          placeholder="Rate Plan Code"
                        />
                        {/* {errors.ratePlanCode && (
                          <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                            {errors.ratePlanCode.message}
                          </p>
                        )} */}
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="w-full">
                    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                      <label className="form-label flex items-center gap-1 min-w-32 max-w-32">
                        Remarks
                      </label>
                      <div className="w-full">
                        <Input
                          type="text"
                          {...register("remarks")}
                          placeholder="Remarks"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rate Plan Type */}
                  <div className="w-full">
                    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                      <label className="form-label flex items-center gap-1 min-w-32 max-w-32">
                        Rate Plan Type
                      </label>
                      <div className="w-full">
                        <div className="flex gap-6">
                          {[
                            { label: "Rating", value: "1" },
                            { label: "Accumulation", value: "4" },
                            { label: "Benefit", value: "3" },
                          ].map(({ label, value }) => (
                            <label
                              key={value}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="radio"
                                value={value}
                                checked={ratePlanDetail?.ratePlanType === value}
                                disabled
                                className="w-4 h-4 text-blue-600"
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {watch("ratePlanZones") !== null &&
                    (watch("ratePlanZones") || []).length > 0 && (
                      <>
                        {/* Event Feature Section */}
                        <div className="w-full mt-8">
                          <h3 className="text-lg font-semibold mb-4">
                            Event Feature
                          </h3>
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Priority
                                  </th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Source Type
                                  </th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Source Type Value
                                  </th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Destination
                                  </th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Destination Type
                                  </th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Label
                                  </th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {eventFeatures.length > 0 ? (
                                  <>
                                    {eventFeatures.map((feature, index) => {
                                      const sourceTypeName =
                                        sourceType.find(
                                          (src) =>
                                            src.mappingSrcType ===
                                            feature.mappingSrcType
                                        )?.mappingSrcTypeName ?? "-";

                                      const eventFeatureName =
                                        eventFeaturesType.find(
                                          (ev) =>
                                            ev.reAttrId.toString() ===
                                            feature.mappingSrcValue
                                        )?.reAttrName ?? "-";

                                      const mappingDescValueName =
                                        feature.mappingDesType === "0"
                                          ? "Zone Map"
                                          : feature.mappingDesType === "1"
                                            ? "Fix"
                                            : "-";

                                      const zoneMapName =
                                        zoneMaps.find(
                                          (z) =>
                                            z.zoneMapId.toString() ===
                                            feature.mappingDesValue
                                        )?.zoneMapName ?? "-";

                                      return (
                                        <tr key={index} className="border-t">
                                          <td className="px-4 py-3 text-sm">
                                            {index + 1}
                                          </td>
                                          <td className="px-4 py-3 text-sm">
                                            {sourceTypeName}
                                          </td>
                                          <td className="px-4 py-3 text-sm">
                                            {eventFeatureName}
                                          </td>
                                          <td className="px-4 py-3 text-sm">
                                            {mappingDescValueName}
                                          </td>
                                          <td className="px-4 py-3 text-sm">
                                            {zoneMapName}
                                          </td>
                                          <td className="px-4 py-3 text-sm">
                                            {feature.labelShow}
                                          </td>
                                          <td className="px-4 py-3 text-sm">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="icon"
                                              onClick={() =>
                                                removeEventFeature(
                                                  feature.priority
                                                )
                                              }
                                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </>
                                ) : (
                                  <tr className="border-t">
                                    <td
                                      className="px-4 py-6 text-sm text-center align-middle text-muted-foreground"
                                      colSpan={7}
                                    >
                                      No event features added
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Info Message */}
                        <div className="w-full">
                          <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                              <p>
                                If you add event properties, the rate plan will
                                be a mapping rate plan, otherwise a single one.
                              </p>
                              <p>
                                Drag the items in the list to change their
                                priorities.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Detail Section */}

                      </>
                    )}

                  {/* Form Actions */}
                  <div className="flex justify-end gap-5 mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleRatePlanDialog(false, "create")}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      ) : null}
                      {isSubmitting ? "Updating..." : "OK"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default EditRatePlanDialog;
