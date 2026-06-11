import { useCallApi } from "@/hooks";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { z } from "zod";
import { apiConfig } from "@/config/api.config";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { subscriptionUpdateMappingRatingSchema } from "../rating/types/form";
import { useSubscriptionPriceCreateContext } from "../../hooks";

type SubscriptionUpdateMappingRatingForm = z.infer<
  typeof subscriptionUpdateMappingRatingSchema
>;

type ZoneOption = { zoneId: number; zoneName: string };
const API_URL = apiConfig.service_price_plan;

const FormField = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1 mt-2">
    <label className="text-sm">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
);

const EditMappingDialog = () => {
  const {
    showMappingDialog,
    handleMappingDialog,
    selectedRatePlan,
    selectedMapping,
    fetchMappingRatingForRatePlan,
  } = useSubscriptionPriceCreateContext();
  const { GetData, PutData } = useCallApi();

  const [dataZone, setDataZone] = useState<DetailMappingZone[]>([]);
  const [eventFeaturesType, setEventFeaturesType] = useState<
    {
      reAttrId: number;
      reAttrName: string;
    }[]
  >([]);
  const [mapZoneValue, setMapZoneValue] = useState<
    Record<number, ZoneOption[]>
  >({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<SubscriptionUpdateMappingRatingForm>({
    resolver: zodResolver(subscriptionUpdateMappingRatingSchema),
    defaultValues: {
      mappingName: "",
      mappingUnit: [],
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

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "mappingUnit",
  });

  const resetFormAndState = () => {
    reset();
    setDataZone([]);
    setEventFeaturesType([]);
    setMapZoneValue({});
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetFormAndState();
    }
    handleMappingDialog(open, showMappingDialog.mode);
  };

  const fetchEventFeature = async () => {
    try {
      const response = await GetData(`${API_URL}/mapping/re-attr/list`, {
        reType: 3,
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

  const fetchZone = async (zoneId: number, index: number) => {
    try {
      const response = await GetData(`${API_URL}/mapping/zone/list`, {
        zoneMapId: zoneId,
      });

      if (response.status) {
        setMapZoneValue((prev) => ({
          ...prev,
          [index]: response.data as ZoneOption[],
        }));
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Error fetching zone");
    }
  };

  const GetDataZone = async () => {
    try {
      const response = await GetData(`${API_URL}/rate-plan/zone/list`, {
        ratePlanId: selectedRatePlan,
      });

      if (response.status) {
        setDataZone(response.data);

        // Hanya set default values kosong jika bukan mode update
        if (showMappingDialog.mode !== "update") {
          const transformed = response.data.map((item: DetailMappingZone) => ({
            ratePlanZoneId: item.ratePlanZoneId,
            mappingMatchType: "",
            mappingType: "",
            mappingValue: "",
          }));
          setValue("mappingUnit", transformed);
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching zone");
    }
  };

  const FetchMappingData = async () => {
    setIsLoading(true);
    try {
      const response = await GetData(
        `${API_URL}/rate-plan/zone/mapping-unit/list`,
        {
          mappingId: selectedMapping,
          ratePlanId: selectedRatePlan,
        }
      );

      if (response.status) {
        // Set mapping name dari response pertama
        if (response.data.length > 0) {
          setValue("mappingName", response.data[0].mappingName);
        }

        // Set data zone untuk referensi
        setDataZone(response.data);

        // Transform data untuk form
        const transformed = response.data.map((item: DetailMappingZone) => ({
          ratePlanZoneId: item.ratePlanZoneId,
          mappingMatchType: item.mappingMatchType,
          mappingType: item.mappingType,
          mappingValue: item.mappingValue,
        }));

        setValue("mappingUnit", transformed);

        // Load zone data untuk item yang mappingType = "0"
        const zonePromises = response.data.map(
          (item: DetailMappingZone, index: number) => {
            if (item.mappingType === "0" && item.mappingDesValue) {
              return fetchZone(Number(item.mappingDesValue), index);
            }
            return Promise.resolve();
          }
        );

        await Promise.all(zonePromises);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching mapping data");
    } finally {
      setIsLoading(false);
    }
  };

  const DoUpdateMapping = async (data: SubscriptionUpdateMappingRatingForm) => {
    setIsSubmitting(true);
    try {
      const response = await PutData(
        `${API_URL}/mapping/update/${selectedMapping}`,
        data
      );

      if (response?.status) {
        await fetchMappingRatingForRatePlan(selectedRatePlan || 0);
        toast.success(response.message);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Error updating mapping");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: SubscriptionUpdateMappingRatingForm) => {
    await DoUpdateMapping(data);
    resetFormAndState();
    handleMappingDialog(false, showMappingDialog.mode);
  };

  const handleMapZoneValue = async (zoneId: number, index: number) => {
    await fetchZone(zoneId, index);
  };

  const handleMappingTypeChange = async (value: string, index: number) => {
    setValue(`mappingUnit.${index}.mappingType`, value);
    setValue(`mappingUnit.${index}.mappingValue`, "");

    if (value === "0") {
      await handleMapZoneValue(Number(dataZone[index].mappingDesValue), index);
    }
  };

  const handleMappingMatchTypeChange = (value: string, index: number) => {
    setValue(`mappingUnit.${index}.mappingMatchType`, value);
    setValue(`mappingUnit.${index}.mappingValue`, "");
  };

  useEffect(() => {
    if (showMappingDialog.show) {
      fetchEventFeature();
      GetDataZone();
    }
  }, [showMappingDialog.show]);

  useEffect(() => {
    if (
      selectedMapping &&
      showMappingDialog.show &&
      showMappingDialog.mode === "update"
    ) {
      FetchMappingData();
    }
  }, [selectedMapping, showMappingDialog.show, showMappingDialog.mode]);

  return (
    <Dialog open={showMappingDialog.show} onOpenChange={handleDialogClose}>
      <DialogContent className="container-fixed max-w-[1000px] max-h-[90vh] flex flex-col p-5 overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {showMappingDialog.mode === "update"
              ? "Edit Mapping"
              : "Add Mapping"}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="animate-spin h-6 w-6 mr-2" />
              Loading mapping data...
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormField
                label="Mapping Name"
                error={errors.mappingName?.message}
              >
                <Input {...register("mappingName")} />
              </FormField>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-4 gap-4 mt-4">
                  <FormField label="Mapping Value">
                    <Input value={dataZone[index]?.labelShow || ""} disabled />
                  </FormField>

                  {dataZone[index]?.mappingDesType === "0" && (
                    <FormField
                      label="Match Type"
                      error={
                        errors.mappingUnit?.[index]?.mappingMatchType?.message
                      }
                    >
                      <Select
                        value={watch(`mappingUnit.${index}.mappingMatchType`)}
                        onValueChange={(value) =>
                          handleMappingMatchTypeChange(value, index)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Mapping Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">In</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}

                  {dataZone[index]?.mappingDesType === "1" && (
                    <FormField
                      label="Match Type"
                      error={
                        errors.mappingUnit?.[index]?.mappingMatchType?.message
                      }
                    >
                      <Select
                        value={watch(`mappingUnit.${index}.mappingMatchType`)}
                        onValueChange={(value) =>
                          handleMappingMatchTypeChange(value, index)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Mapping Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">{">"}</SelectItem>
                          <SelectItem value="2">{"<"}</SelectItem>
                          <SelectItem value="3">{"="}</SelectItem>
                          <SelectItem value="4">{"!="}</SelectItem>
                          <SelectItem value="5">{">="}</SelectItem>
                          <SelectItem value="6">{"<="}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}

                  {dataZone[index]?.mappingDesType === "0" && (
                    <FormField
                      label="Mapping Type"
                      error={errors.mappingUnit?.[index]?.mappingType?.message}
                    >
                      <Select
                        value={watch(`mappingUnit.${index}.mappingType`)}
                        onValueChange={(value) => {
                          handleMappingTypeChange(value, index);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Mapping Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Zone</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}

                  {dataZone[index]?.mappingDesType === "1" && (
                    <FormField
                      label="Mapping Type"
                      error={errors.mappingUnit?.[index]?.mappingType?.message}
                    >
                      <Select
                        value={watch(`mappingUnit.${index}.mappingType`)}
                        onValueChange={(value) =>
                          handleMappingTypeChange(value, index)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Mapping Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Const</SelectItem>
                          <SelectItem value="2">Attr</SelectItem>
                          <SelectItem value="3">Enum</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}

                  {watch(`mappingUnit.${index}.mappingType`) === "0" && (
                    <FormField
                      label="Mapping Value"
                      error={errors.mappingUnit?.[index]?.mappingValue?.message}
                    >
                      <Select
                        value={watch(`mappingUnit.${index}.mappingValue`)}
                        onValueChange={(value) =>
                          setValue(`mappingUnit.${index}.mappingValue`, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Mapping Value" />
                        </SelectTrigger>
                        <SelectContent>
                          {(mapZoneValue[index] ?? []).map((item) => (
                            <SelectItem
                              key={item.zoneId}
                              value={String(item.zoneId)}
                            >
                              {item.zoneName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}

                  {watch(`mappingUnit.${index}.mappingType`) === "1" && (
                    <FormField
                      label="Mapping Value"
                      error={errors.mappingUnit?.[index]?.mappingValue?.message}
                    >
                      <Input
                        type="number"
                        {...register(`mappingUnit.${index}.mappingValue`)}
                      />
                    </FormField>
                  )}

                  {watch(`mappingUnit.${index}.mappingType`) === "2" && (
                    <FormField
                      label="Mapping Value"
                      error={errors.mappingUnit?.[index]?.mappingValue?.message}
                    >
                      <Select
                        value={watch(`mappingUnit.${index}.mappingValue`)}
                        onValueChange={(value) =>
                          setValue(`mappingUnit.${index}.mappingValue`, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Mapping Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventFeaturesType.map((item) => (
                            <SelectItem
                              key={item.reAttrId}
                              value={String(item.reAttrId)}
                            >
                              {item.reAttrName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}

                  {watch(`mappingUnit.${index}.mappingType`) === "3" && (
                    <FormField
                      label="Mapping Value"
                      error={errors.mappingUnit?.[index]?.mappingValue?.message}
                    >
                      <Select
                        value={watch(`mappingUnit.${index}.mappingValue`)}
                        onValueChange={(value) =>
                          setValue(`mappingUnit.${index}.mappingValue`, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Mapping Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BASIC_BALANCE">
                            Base Balance
                          </SelectItem>
                          <SelectItem value="ALL_CASH_BALANCE">
                            All Cash Balance
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}
                </div>
              ))}

              <div className="flex gap-2 mt-6 justify-end">
                <Button
                  variant="default"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4" />
                      {showMappingDialog.mode === "update"
                        ? "Updating..."
                        : "Creating..."}
                    </>
                  ) : showMappingDialog.mode === "update" ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogClose(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default EditMappingDialog;
