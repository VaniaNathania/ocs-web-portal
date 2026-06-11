import { useCallApi } from "@/hooks";
import { useTriggerCreateContext } from "../../../hooks";
import { apiConfig } from "@/config/api.config";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BalanceTriggerEditEventSchema } from "./types/forms";
import { SearchSelect } from "@/components/common/SearchSelect";

interface EventDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  selectedEvent: EventList | null;
}

const API_URL = apiConfig.service_price_plan;
type BalanceTriggerEditEventFormType = z.infer<
  typeof BalanceTriggerEditEventSchema
>;

const TriggerEventEditDialog = ({
  showDialog,
  setShowDialog,
  selectedEvent,
}: EventDialogProps) => {
  const { selectedThreshold, refreshEventList } = useTriggerCreateContext();
  const { PostData, PutData, GetData } = useCallApi();

  const methods = useForm<BalanceTriggerEditEventFormType>({
    resolver: zodResolver(BalanceTriggerEditEventSchema),
    defaultValues: {
      balThresholdId: selectedThreshold?.tresholdId,
      subsEventId: undefined,
      triggerMode: null,
      antibillShock: "N",
      eventName: null,
      notifyParamsId: null,
      extAttr: null,
      oldSubsEventId: null,
      spId: 0,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    control,
    watch,
    formState: { errors },
  } = methods;

  const extAttrFieldsMap: Record<string, string[]> = {
    "64": ["delayDays"],
    "123": ["activationTime"],
    "2": ["pricePlanCode", "orderTime", "days"],
    "150": ["productId"],
    "236": ["pricePlanCode", "pricePlanId"],
    "82": ["productId"],
    "155": ["pricePlanCode", "pricePlanId"],
    "100": ["pricePlanCode", "pricePlanId"],
    "81": ["addProductId", "cancelProductId"],
    "151": ["productId"],
    "237": ["pricePlanCode", "pricePlanId"],
  };

  const requiredExtAttrFieldsMap: Record<string, string[]> = {
    "2": ["pricePlanCode"], // New Individual Price Plan
    "150": ["productId"], // Inactive Related Product
    "236": ["pricePlanCode"], // Deactive Individual Price Plan
    "82": ["productId"], // Cancel Related Product
    "155": ["pricePlanCode"], // Cancel Individual Price Plan (Notify ID: 155)
    "81": ["addProductId"], // Add Related Product
    "151": ["productId"], // Active Related Product
    "237": ["pricePlanCode"], // Active Individual Price Plan
  };

  const fieldCodeMap: Record<string, number> = {
    pricePlanCode: 982,
    pricePlanId: 987,
    productId: 961,
    days: 1044,
    orderTime: 608,
  };

  const subsEventId = watch("subsEventId");
  const extAttrFields = extAttrFieldsMap[String(subsEventId)] || [];
  const requiredExtAttrFields =
    requiredExtAttrFieldsMap[String(subsEventId)] || [];

  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const [accumulationType, setAccumulationType] = useState<any[]>([]);
  const [triggerMode, setTriggerMode] = useState<any[]>([]);
  const [triggerSubsEventList, setTriggerSubsEventList] = useState<
    TriggerSubsEvent[]
  >([]);

  const resetForm = () => {
    reset();
  };

  const fetchSubsEvent = async () => {
    try {
      const response = await GetData(
        `${API_URL}/trigger/qry-subs-event/list`,
        {}
      );

      if (response.status) {
        setTriggerSubsEventList(response.data);
      }
    } catch (error) {
      toast.error("Error Fetching Event Select. Please Check Your Connection!");
    }
  };

  const updateExtAttrString = (
    current: string,
    fieldName: string,
    value: string
  ) => {
    const code = fieldCodeMap[fieldName];
    if (!code) return current;

    // Pisah menjadi array pasangan key=value
    let parts = current ? current.split("|") : [];

    // Hapus entry lama untuk field ini
    parts = parts.filter((p) => !p.startsWith(`${code}=`));

    // Kalau ada value baru, tambahkan entry baru
    if (value) {
      parts.push(`${code}=${value}`);
    }

    return parts.join("|");
  };

  function parseExtAttrValue(extAttrString: string, field: string): string {
    const code = fieldCodeMap[field];
    if (!code) return "";

    const pair = extAttrString.split("|").find((p) => p.startsWith(`${code}=`));

    return pair ? pair.split("=")[1] : "";
  }

  const onSubmit = (data: BalanceTriggerEditEventFormType) => {
    doUpdateTriggerAccumulation(data);
  };

  const doUpdateTriggerAccumulation = useCallback(
    async (data: BalanceTriggerEditEventFormType) => {
      try {
        setIsLoading(true);
        const response = await PutData(
          `${API_URL}/trigger/event/balance/edit`,
          data
        );

        if (response?.status) {
          refreshEventList();
          setAlert({ show: false, message: "" });
          toast.success("Success Update Data Balance Event Trigger");
          resetForm();
          setShowDialog(false);
        } else {
          toast.error("Error Update Data Balance Event Trigger");
        }
      } catch (error) {
        toast.error("Error Update Data Balance Event Trigger");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!showDialog) {
      resetForm();
      return;
    }

    if (showDialog && selectedEvent) {
      setValue("balThresholdId", selectedThreshold.tresholdId);
      setValue("subsEventId", selectedEvent.subsEventId);
      setValue("eventName", selectedEvent.eventName);
      setValue("triggerMode", selectedEvent.triggerMode);
      setValue("antibillShock", selectedEvent.antibillShock);
      setValue("notifyParamsId", Number(selectedEvent.notifyParamsId));
      if (selectedEvent.extAttr) {
        setValue("extAttr", selectedEvent.extAttr);
      }
    }

    if (watch("subsEventId") !== 98) {
      setValue("notifyParamsId", null);
    }

    fetchSubsEvent();
  }, [showDialog, watch("subsEventId"), selectedEvent]);

  return (
    <Dialog open={showDialog} onOpenChange={(open) => setShowDialog(open)}>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-gray-200 bg-white">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Update Trigger Event
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <DialogBody className="px-6 py-6 overflow-y-auto bg-gray-50">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Event Configuration */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-5">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Event Configuration
                  </h3>
                </div>

                <div className="space-y-5">
                  {/* Subscription Event */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="text-red-500 mr-1">*</span>
                      Subscription Event
                    </label>
                    <Controller
                      control={control}
                      name="subsEventId"
                      render={({ field }) => (
                        <Select
                          value={field.value != null ? String(field.value) : ""}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                        >
                          <SelectTrigger className="h-11 border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200">
                            <SelectValue placeholder="Select Subscription Event" />
                          </SelectTrigger>
                          <SearchSelect>
                            {triggerSubsEventList.map((item) => (
                              <SelectItem
                                key={item.subsEventId}
                                value={String(item.subsEventId)}
                                className="hover:bg-blue-50 focus:bg-blue-50"
                              >
                                {item.eventName}
                              </SelectItem>
                            ))}
                          </SearchSelect>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Anti Bill Shock */}
                  <div className="pt-2">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <div className="flex items-center h-5">
                        <Controller
                          name="antibillShock"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              checked={field.value === "Y"}
                              onChange={(e) =>
                                field.onChange(e.target.checked ? "Y" : "N")
                              }
                              className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded transition-all duration-200"
                            />
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                          Anti Bill Shock Protection
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Automatically prevents unexpected billing charges
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Trigger Settings */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-5">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Trigger Settings
                  </h3>
                </div>

                <div className="space-y-5">
                  {/* Trigger Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trigger Mode
                    </label>
                    <Controller
                      control={control}
                      name="triggerMode"
                      render={({ field }) => (
                        <Select
                          value={
                            field.value != null && field.value != "null"
                              ? String(field.value)
                              : ""
                          }
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <SelectTrigger className="h-11 border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200">
                            <SelectValue placeholder="Select trigger mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="null"
                              className="hover:bg-blue-50 focus:bg-blue-50"
                            >
                              Select trigger mode
                            </SelectItem>
                            <SelectItem
                              value="0"
                              className="hover:bg-blue-50 focus:bg-blue-50"
                            >
                              Terminal
                            </SelectItem>
                            <SelectItem
                              value="1"
                              className="hover:bg-blue-50 focus:bg-blue-50"
                            >
                              Cross
                            </SelectItem>
                            <SelectItem
                              value="2"
                              className="hover:bg-blue-50 focus:bg-blue-50"
                            >
                              Precise
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Define how the trigger should behave when activated
                    </p>
                  </div>

                  {/* Notify Params Id */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Parameters
                    </label>
                    <Controller
                      control={control}
                      name="notifyParamsId"
                      render={({ field }) => (
                        <Select
                          value={field.value != null ? String(field.value) : ""}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          disabled={watch("subsEventId") !== 98}
                        >
                          <SelectTrigger className="h-11 border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200">
                            <SelectValue placeholder="Select notification method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="98"
                              className="hover:bg-blue-50 focus:bg-blue-50"
                            >
                              SMS_COST_NOTIFY
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Choose how users will be notified when triggered
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {extAttrFields.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-5">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Additional Attributes
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {extAttrFields.map((field) => {
                    const isRequired = requiredExtAttrFields.includes(field);

                    return (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                          {isRequired && (
                            <span className="text-red-500 mr-1">*</span>
                          )}
                          {field.replace(/([A-Z])/g, " $1").trim()}
                        </label>
                        <Input
                          type="text"
                          value={parseExtAttrValue(
                            getValues("extAttr") || "",
                            field
                          )}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            const updatedString = updateExtAttrString(
                              getValues("extAttr") || "",
                              field,
                              newValue
                            );
                            setValue("extAttr", updatedString, {
                              shouldValidate: true,
                            });
                          }}
                          className={`w-full h-11 px-4 border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 ${
                            errors.extAttr ? "border-red-500" : ""
                          }`}
                          placeholder={`Enter ${field.toLowerCase()}`}
                        />
                        {isRequired && errors.extAttr && (
                          <p className="text-xs text-red-500 mt-1">
                            {field} is required
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center mb-5">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Schedule Settings
                </h3>
              </div>

              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trigger Delay (Days)
                </label>
                <Input
                  type="number"
                  {...register("days")}
                  className="w-full h-11 px-4 border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                  placeholder="Enter number of days"
                  min="0"
                  max="365"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Optional delay before trigger activation (0-365 days)
                </p>
              </div>
            </div> */}
          </div>
        </DialogBody>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-white border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center text-xs text-gray-500">
            <span className="text-red-500 mr-1">*</span>
            Required fields
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => setShowDialog(false)}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200 shadow-sm"
            >
              Create Trigger
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TriggerEventEditDialog;
