import { useCallApi } from "@/hooks";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiConfig } from "@/config/api.config";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useSubscriptionPriceCreateContext } from "../../hooks";
import { subscriptionCreateMappingRatingSchema } from "../rating/types/form";

type SubscriptionCreateMappingRatingForm = z.infer<
  typeof subscriptionCreateMappingRatingSchema
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

const AddMappingDialog = () => {
  const { GetData, PostData } = useCallApi();
  const {
    showMappingDialog,
    handleMappingDialog,
    selectedRatePlan,
    fetchMappingRatingForRatePlan,
  } = useSubscriptionPriceCreateContext();

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

  // Default values untuk form
  const defaultValues = {
    ratePlanId: 0,
    mappingName: "",
    mappingUnit: [],
  };

  const methods = useForm<SubscriptionCreateMappingRatingForm>({
    resolver: zodResolver(subscriptionCreateMappingRatingSchema),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "mappingUnit",
  });

  const resetFormAndState = () => {
    reset(defaultValues);
    setDataZone([]);
    setEventFeaturesType([]);
    setMapZoneValue([]);
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

        // (opsional) set default value pertama
        // setValue(`mappingUnit.${index}.mappingValue`, String(response.data[0]?.zoneId ?? ""));
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
        setValue("ratePlanId", selectedRatePlan ?? 0);

        const transformed = response.data.map((item: DetailMappingZone) => ({
          ratePlanZoneId: item.ratePlanZoneId,
          mappingMatchType: "", // kosong tapi valid
          mappingType: "", // kosong tapi valid
          mappingValue: "", // kosong tapi valid
        }));
        setValue("mappingUnit", transformed);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching zone");
    }
  };

  const DoCreateMapping = async (data: SubscriptionCreateMappingRatingForm) => {
    setIsSubmitting(true);
    try {
      const response = await PostData(`${API_URL}/mapping/create`, data);

      if (response?.status) {
        toast.success(response.message);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Error creating mapping");
    } finally {
      await fetchMappingRatingForRatePlan(selectedRatePlan || 0);
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: SubscriptionCreateMappingRatingForm) => {
    await DoCreateMapping(data);
    resetFormAndState();
    handleMappingDialog(false, showMappingDialog.mode);
  };

  const handleMapZoneValue = async (zoneId: number, index: number) => {
    await fetchZone(zoneId, index);
  };

  const handleMappingTypeChange = async (value: string, index: number) => {
    // Set nilai mappingType baru
    setValue(`mappingUnit.${index}.mappingType`, value);

    // Reset mappingValue ke string kosong
    setValue(`mappingUnit.${index}.mappingValue`, "");

    // Jika mappingType adalah "0" (Zone), fetch data zone
    if (value === "0") {
      await handleMapZoneValue(Number(dataZone[index].mappingDesValue), index);
    }
  };

  const handleMappingMatchTypeChange = (value: string, index: number) => {
    // Set nilai mappingMatchType baru
    setValue(`mappingUnit.${index}.mappingMatchType`, value);

    // Reset mappingValue ke string kosong
    setValue(`mappingUnit.${index}.mappingValue`, "");
  };

  useEffect(() => {
    if (selectedRatePlan && showMappingDialog.show) {
      GetDataZone();
      fetchEventFeature();
    }
  }, [selectedRatePlan, showMappingDialog.show]);

  return (
    <Dialog open={showMappingDialog.show} onOpenChange={handleDialogClose}>
      <DialogContent className="container-fixed max-w-[1000px] max-h-[90vh] flex flex-col p-5 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add Mapping</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Mapping Name" error={errors.mappingName?.message}>
              <Input {...register("mappingName")} />
            </FormField>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-4 gap-4">
                <FormField label="Mapping Value">
                  <Input value={dataZone[index]?.labelShow} disabled />
                </FormField>

                {dataZone[index].mappingDesType === "0" && (
                  <FormField
                    label="Mapping Type"
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

                {dataZone[index].mappingDesType === "1" && (
                  <FormField
                    label="Mapping Type"
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

                {dataZone[index].mappingDesType === "0" && (
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

                {dataZone[index].mappingDesType === "1" && (
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

                {/* <button type="button" onClick={() => remove(index)}>
                  ❌
                </button> */}
              </div>
            ))}

            {/* <button
              type="button"
              onClick={() =>
                append({ ratePlanZoneId: 0, mappingType: "", mappingValue: "" })
              }
            >
              ➕ Add Mapping Unit
            </button> */}

            <div className="flex gap-2 mt-4 justify-end">
              <Button
                variant="default"
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4" />
                    Creating...
                  </>
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
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default AddMappingDialog;
