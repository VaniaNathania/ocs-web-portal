import { apiConfig } from "@/config/api.config";
import z from "zod";
import { useTriggerCreateContext } from "../../../hooks";
import { useCallApi } from "@/hooks";
import { TriggerAcmNotificationEditSchema } from "../types/forms";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert } from "@/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_URL = apiConfig.service_price_plan;
type TriggerAcmNotificationFormType = z.infer<
  typeof TriggerAcmNotificationEditSchema
>;

const TriggerNotificationEditDialog = ({ showDialog, setShowDialog }: any) => {
  const {
    selectedThreshold,
    selectedTriggerNotification,
    refreshNotificationList,
  } = useTriggerCreateContext();
  const { PutData, GetData } = useCallApi();

  const methods = useForm<TriggerAcmNotificationFormType>({
    resolver: zodResolver(TriggerAcmNotificationEditSchema),
    defaultValues: {
      triggerNotification: "notifType",
      triggerMode: undefined,
      notifType: undefined,
      oldNotifType: undefined,
      notifParamId: undefined,
      oldNotifParamId: undefined,
      oldAdviceEventId: undefined,
      thresholdId: selectedThreshold?.acmThresholdId,
      spId: 0,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    watch,
    formState: { errors },
  } = methods;

  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const [detailNotification, setDetailNotification] =
    useState<TriggerAcmNotification | null>(null);

  const [notificationType, setNotificationType] = useState<
    {
      adviceType: string;
      adviceTypeName: string;
    }[]
  >([]);
  const [notificatioinParams, setNotificationParams] = useState<
    {
      notifyParamsId: number;
      notifyName: string;
      notifyId: number;
    }[]
  >([]);
  const [notifyNameDisplay, setNotifyNameDisplay] = useState("");

  const resetForm = () => {
    reset();
  };

  const getNotificationType = async () => {
    try {
      const response = await GetData(`${API_URL}/trigger/notify-params`, {
        adviceCatg: 1,
        spId: 0,
      });

      if (response.status) {
        setNotificationType(response.data || []);
      }
    } catch (error) {
      toast.error(
        "Error Fetching Notification Type. Please Check Your Connection!",
      );
    }
  };

  const getNotificationParams = async () => {
    try {
      const response = await GetData(`${API_URL}/trigger/notify-params-id`, {
        notifyType: "A",
        spId: 0,
      });

      if (response.status) {
        setNotificationParams(response.data || []);
      }
    } catch (error) {
      toast.error(
        "Error Fetching Notification Type. Please Check Your Connection!",
      );
    }
  };

  const onSubmit = async (data: TriggerAcmNotificationFormType) => {
    // console.log(data);
    const cleanedData = {
      ...data,
      triggerMode: data.triggerMode ?? null,
      notifType: data.notifType ?? null,
      notifParamId: data.notifParamId ?? null,
    };

    // console.log(cleanedData);
    doUpdateNotificationTrigger(cleanedData);
  };

  const doUpdateNotificationTrigger = useCallback(
    async (data: TriggerAcmNotificationFormType) => {
      try {
        const response = await PutData(
          `${API_URL}/trigger/notification/acm/edit`,
          {
            ...data,
          },
        );

        if (response?.status) {
          setAlert((prev) => ({ ...prev, show: false, message: "" }));
          setShowDialog(false);
          refreshNotificationList();
          toast.success("Success Create Accumulation Trigger ");
        } else {
          setAlert((prev) => ({
            ...prev,
            show: true,
            message: response?.message,
          }));
        }
      } catch (error) {
        toast.error("Error Add New Trigger Benefit");
      }
    },
    [],
  );

  useEffect(() => {
    if (showDialog) {
      getNotificationParams();
      getNotificationType();
    }
  }, [showDialog]);

  useEffect(() => {
    if (!showDialog) {
      resetForm();
    }

    if (
      selectedTriggerNotification &&
      "acmThresholdId" in selectedTriggerNotification
    ) {
      setValue(
        "triggerNotification",
        selectedTriggerNotification?.triggerNotification!,
      );
      setValue("triggerMode", selectedTriggerNotification?.triggerMode ?? null);
      setValue("notifType", String(selectedTriggerNotification?.adviceType!));
      setValue(
        "oldNotifType",
        String(selectedTriggerNotification?.adviceType!),
      );
      setValue("oldAdviceEventId", selectedTriggerNotification?.adviceEventId);
      setValue(
        "notifParamId",
        selectedTriggerNotification?.notifyParamsId ?? null,
      );
      setValue("oldNotifParamId", selectedTriggerNotification?.notifyParamsId);
      setValue("thresholdId", selectedTriggerNotification?.acmThresholdId!);
      setValue("spId", 0);
    }
  }, [showDialog, selectedTriggerNotification]);

  const selectedNotifType = watch("notifType");

  useEffect(() => {
    if (!selectedNotifType) {
      setValue("notifParamId", null);
      setNotifyNameDisplay("");
      return;
    }

    const selectedType = notificatioinParams.find(
      (item) => item.notifyId === Number(selectedNotifType),
    );

    const matchedParam = notificatioinParams.find(
      (param) => param.notifyId === Number(selectedType?.notifyId),
    );

    if (matchedParam) {
      setValue("notifParamId", matchedParam.notifyParamsId);
      setNotifyNameDisplay(matchedParam.notifyName);
    } else {
      setValue("notifParamId", null);
      setNotifyNameDisplay("");
    }
  }, [selectedNotifType, notificationType, notificatioinParams, setValue]);

  return (
    <Dialog open={showDialog} onOpenChange={(open) => setShowDialog(open)}>
      <DialogContent className="max-w-4xl mx-auto p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="px-8 py-6 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-1">
                Update Trigger Notification
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-sm mt-3">
                Configure your notification trigger settings
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="px-8 py-6 max-h-[70vh] overflow-y-auto">
          {alert.show && (
            <Alert variant="danger" className="mb-6 border-red-200 bg-red-50">
              {alert.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Set up your notification trigger preferences
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trigger Notification Radio Group */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Trigger Notification
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        value="notifType"
                        {...register("triggerNotification")}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        Notification Type
                      </span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        value="notifEvent"
                        {...register("triggerNotification")}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        Notification Event
                      </span>
                    </label>
                  </div>
                </div>

                {/* Trigger Mode Select */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Trigger Mode
                  </label>
                  <Controller
                    control={control}
                    name="triggerMode"
                    render={({ field }) => (
                      <Select
                        value={field.value != null ? String(field.value) : ""}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select trigger mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="0"
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            Terminal
                          </SelectItem>
                          <SelectItem
                            value="1"
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            Cross
                          </SelectItem>
                          <SelectItem
                            value="2"
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            Precise
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Notification Type Select */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Notification{" "}
                    {watch("triggerNotification") === "notifType"
                      ? "Type"
                      : "Event"}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="notifType"
                    rules={{ required: "Notification type is required" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select notification type" />
                        </SelectTrigger>
                        <SelectContent>
                          {watch("triggerNotification") === "notifType" ? (
                            notificatioinParams.length > 0 ? (
                              notificatioinParams.map((item) => (
                                <SelectItem
                                  key={item.notifyId}
                                  value={String(item.notifyId)}
                                  className="cursor-pointer hover:bg-blue-50"
                                >
                                  {item.notifyName}
                                </SelectItem>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 px-3 py-2">
                                No list available
                              </p>
                            )
                          ) : watch("triggerNotification") === "notifEvent" ? (
                            <p className="text-sm text-gray-500 px-3 py-2">
                              No list available
                            </p>
                          ) : null}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.notifType && (
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      {errors.notifType.message}
                    </p>
                  )}
                </div>

                {/* Notify Params ID */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Notify Params ID
                  </label>
                  <Input
                    type="text"
                    placeholder="Notify params will be generated"
                    value={notifyNameDisplay}
                    readOnly
                    className="h-10 bg-gray-50 border-gray-300 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </form>
        </DialogBody>

        {/* Footer Actions */}
        <div className="px-8 py-5 mt-5 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowDialog(false)}
            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { TriggerNotificationEditDialog };
