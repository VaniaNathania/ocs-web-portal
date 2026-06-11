import { apiConfig } from "@/config/api.config";
import z from "zod";
import { BalanceTriggerNotificationSchema } from "./types/forms";
import { useTriggerCreateContext } from "../../../hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { useCallApi } from "@/hooks";
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

// type LoadingButton = "filter" | "reset" | "export" | "refresh" | null;
const API_URL = apiConfig.service_price_plan;
type BalanceTriggerNotificationFormType = z.infer<
  typeof BalanceTriggerNotificationSchema
>;

const TriggerNotificationDialog = ({ showDialog, setShowDialog }: any) => {
  const { selectedThreshold, refreshNotificationList } =
    useTriggerCreateContext();
  
  const { PostData, GetData } = useCallApi();

  const methods = useForm<BalanceTriggerNotificationFormType>({
    resolver: zodResolver(BalanceTriggerNotificationSchema),
    defaultValues: {
      triggerNotification: "notifType",
      triggerMode: undefined,
      notifType: undefined,
      notifParamId: undefined,
      thresholdId: selectedThreshold?.tresholdId,
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

  const handleClose = () => {
    resetForm();
    setShowDialog(false);
  };

  const getNotificationType = async (category: number) => {
    try {
      const response = await GetData(`${API_URL}/trigger/notify-params`, {
        adviceCatg: category,
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

  const onSubmit = async (data: BalanceTriggerNotificationFormType) => {
    // console.log(data);
    const cleanedData = {
      ...data,
      triggerMode: data.triggerMode ?? null,
      notifType: data.notifType ?? null,
      notifParamId: data.notifParamId ?? null,
    };

    // console.log(cleanedData);
    doCreateNotificationTrigger(cleanedData);
  };

  const doCreateNotificationTrigger = useCallback(
    async (data: BalanceTriggerNotificationFormType) => {
      try {
        const response = await PostData(
          `${API_URL}/trigger/notification/balance/add`,
          {
            ...data,
          },
        );

        if (response?.status) {
          setAlert((prev) => ({ ...prev, show: false, message: "" }));
          setShowDialog(false);
          toast.success("Success Create Balance Notification Trigger ");
          refreshNotificationList();
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
      getNotificationType(watch("triggerNotification") === "notifType" ? 2 : 3);
    }
  }, [showDialog, watch("triggerNotification")]);

  const selectedNotifType = watch("notifType");

  useEffect(() => {
    if (!selectedNotifType) {
      setValue("notifParamId", null);
      setNotifyNameDisplay("");
      return;
    }

    const selectedType = notificationType.find(
      (item) => item.adviceType === selectedNotifType,
    );

    const matchedParam = notificatioinParams.find(
      (param) => param.notifyId === Number(selectedType?.adviceType),
    );

    if (matchedParam) {
      setValue("notifParamId", matchedParam.notifyParamsId);
      setNotifyNameDisplay(matchedParam.notifyName);
    } else {
      setValue("notifParamId", null);
      setNotifyNameDisplay("");
    }
  }, [selectedNotifType, notificationType, notificatioinParams]);

  return (
    <Dialog open={showDialog} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl p-0 mx-auto overflow-hidden border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="px-8 py-6 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="mb-1 text-2xl font-bold text-gray-900">
                Add Trigger Notification
              </DialogTitle>
              <DialogDescription className="mt-3 text-sm text-gray-500">
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
              <div className="pb-3 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Set up your notification trigger preferences
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    Notification{" "}
                    {watch("triggerNotification") === "notifType"
                      ? "Type"
                      : "Event"}
                    <span className="ml-1 text-red-500">*</span>
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
                          {notificationType?.length > 0 ? (
                            notificationType.map((item) => (
                              <SelectItem
                                key={item.adviceType}
                                value={String(item.adviceType)}
                                className="cursor-pointer hover:bg-blue-50"
                              >
                                {item.adviceTypeName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled value="not_found">
                              Notification Type Not Found
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.notifType && (
                    <p className="flex items-center mt-1 text-xs text-red-600">
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
                    className="h-10 text-gray-600 border-gray-300 cursor-not-allowed bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </form>
        </DialogBody>

        {/* Footer Actions */}
        <div className="flex justify-end px-8 py-5 mt-5 space-x-3 border-t border-gray-100 bg-gray-50">
          <Button
            variant="outline"
            onClick={() => setShowDialog(false)}
            className="px-6 py-2 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            className="px-6 py-2 text-white transition-all duration-200 bg-blue-600 shadow-sm hover:bg-blue-700 hover:shadow-md"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { TriggerNotificationDialog };
