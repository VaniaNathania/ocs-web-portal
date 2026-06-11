import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTriggerCreateContext } from "../../hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/config/api.config";
import { Alert, KeenIcon, useDataGrid } from "@/components";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { debounce } from "@/lib/helpers";
import z from "zod";
import { ThresholdBalanceSchema } from "./types/form";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BenefitList } from "./benefit/BenefitList";
import { NotificationList } from "./notification/NotificationList";
import { EventList } from "./event/EventList";
import BalanceDeleteConfirmation from "./BalanceDeleteConfirmation";
import { SearchSelect } from "@/components/common/SearchSelect";

const API_URL = apiConfig.service_price_plan;
type ThresholdBalanceFormType = z.infer<typeof ThresholdBalanceSchema>;

const ThresholdBalanceDialog = () => {
  const parentRef = useRef<any | null>(null);
  const {
    thresholdList,
    showDetailBalanceTrigger,
    handleShowDetailBalanceTrigger,
    fetchThresholdList,
    selectedThreshold,
    setSelectedThreshold,
    selectedTrigger,
    refreshBalanceTriggerList,
    refreshNotificationList,
    refreshEventList,
  } = useTriggerCreateContext();

  const methods = useForm<ThresholdBalanceFormType>({
    resolver: zodResolver(ThresholdBalanceSchema),
    defaultValues: {
      value: undefined,
      interval: null,
      reAttr: null,
      touchPcrf: "N",
      triggerMode: null,
      triggerId: selectedTrigger?.triggerId,
      spId: 0,
      triggerBy: "threshold",
    },
  });

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = methods;

  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    thresholdId: number | null;
    pcrf: boolean;
    index: number | null;
    name: string;
  }>({
    show: false,
    thresholdId: null,
    pcrf: false,
    index: null,
    name: "",
  });

  const { PostData, PutData, GetData, DeleteData } = useCallApi();
  const [isLoading, setIsLoading] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "update">("create");
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const [showTriggerBenefitDialog, setShowTriggerBenefitDialog] =
    useState(false);
  const [features, setFeatures] = useState<FeatureAcmList[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const resetForm = () => {
    reset();
  };

  const handleClose = () => {
    resetForm();
    setSelectedThreshold(null);
    handleShowDetailBalanceTrigger(false, null);
  };

  const doGetListFeature = async (filter: string) => {
    try {
      const response = await GetData(`${API_URL}/trigger/dyn-attr/list`, {
        reAttrName: filter,
      });

      if (response.status) {
        setFeatures(response.data || []);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to get list feature");
    }
  };

  const handleCloseDialog = (open: boolean) => {
    handleShowDetailBalanceTrigger(open, null);
    resetForm();
  };

  const handleThresholdDetail = async (thresholdItem: any) => {
    setSelectedThreshold(thresholdItem);

    try {
      const response = await GetData(
        `${API_URL}/trigger/threshold/balance/list`,
        {
          triggerId: selectedTrigger?.triggerId,
          thresholdId: thresholdItem.tresholdId,
        },
      );

      if (response?.status) {
        const data = response.data[0];

        setValue(
          "triggerBy",
          data.triggerBy || (data.ratio !== null ? "ratio" : "threshold"),
        );
        setValue(
          "value",
          data.triggerBy === "ratio" ? Number(data.ratio) : data.value,
        );
        setValue("reAttr", data.reAttr);
        setValue("triggerId", data.triggerId);
        setValue("interval", data.interval);
        setValue("touchPcrf", data.touchPcrf);
        setValue("triggerMode", data.triggerMode);

        setTimeout(() => {
          // will re-render with new selectedThreshold
          refreshBalanceTriggerList();
          refreshNotificationList();
          refreshEventList();
        }, 200);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Something went wrong please try again later!");
    }
  };

  const doCreateBalanceThreshold = useCallback(
    async (data: ThresholdBalanceFormType) => {
      if(!data.value) {
        return toast.error("Threshold is required.")
      }
      setIsLoading(true);
      if (formMode === "create") {
        try {
          const response = await PostData(
            `${API_URL}/trigger/threshold/balance/create`,
            data,
          );

          if (response?.status) {
            await fetchThresholdList(selectedTrigger?.triggerId, "balance");
            setAlert({ show: false, message: "" });
            toast.success("Success Create Data Threshold");
            resetForm();
          } else {
            toast.error("Error create threshold balance");
          }
        } catch (error) {
          toast.error("Something went wrong please try again later!");
        } finally {
          setIsLoading(false);
        }
      } else if (formMode === "update") {
        try {
          const response = await PutData(
            `${API_URL}/trigger/threshold/balance/edit/${selectedThreshold?.tresholdId}`,
            data,
          );

          if (response?.status) {
            await fetchThresholdList(selectedTrigger.triggerId, "balance");
            setAlert({ show: false, message: "" });
            toast.success("Success Update Data Threshold");
            resetForm();
          } else {
            toast.error("Error update threshold balance");
          }
        } catch (error) {
          toast.error("Something went wrong please try again later!");
        } finally {
          setIsLoading(false);
        }
      }
    },
    [formMode, selectedTrigger, selectedThreshold],
  );

  const onSubmit = async (data: ThresholdBalanceFormType) => {
    const cleanedData: ThresholdBalanceFormType = {
      ...data,
      interval: data.interval ?? null,
    };

    doCreateBalanceThreshold(cleanedData);
  };

  const handleDeleteThreshold = async (thresholdId: number, pcrf: boolean) => {
    try {
      const response = await DeleteData(
        `${API_URL}/trigger/threshold/balance/delete?tresholdId=${thresholdId}&isPcrf=${pcrf}`,
        {},
      );

      if (response?.status) {
        toast.success("Success Delete Threshold");
        await fetchThresholdList(selectedTrigger.triggerId, "balance");
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Something went wrong while deleting threshold");
    }
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirm({
      show: false,
      thresholdId: null,
      pcrf: false,
      index: null,
      name: "",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (showDetailBalanceTrigger) {
        await fetchThresholdList(selectedTrigger.triggerId, "balance");
        setValue("triggerId", selectedTrigger.triggerId);
      }
    };

    fetchData();
  }, [showDetailBalanceTrigger]);

  useEffect(() => {
    if (watch("triggerBy") === "threshold") {
      setValue("value", watch("reAttr") !== null ? 0 : null);
    }
  }, [watch("reAttr"), watch("reAttr")]);

  const debouncedFetch = useRef(
    debounce((value: string) => {
      doGetListFeature(value);
    }, 400),
  ).current;

  useEffect(() => {
    if (showDetailBalanceTrigger) {
      debouncedFetch(searchTerm);
    }

    if (showDetailBalanceTrigger && watch("touchPcrf") === "N") {
      setValue("triggerMode", null);
    }
  }, [searchTerm, showDetailBalanceTrigger, watch("touchPcrf")]);

  useEffect(() => {
    if (selectedTrigger) {
      setValue("triggerId", selectedTrigger.triggerId);
    }

    if (selectedThreshold) {
      setFormMode("update");
    }
  }, [selectedTrigger, selectedThreshold]);

  return (
    <>
      {/* <TriggerBenefitDialog
        showDialog={showTriggerBenefitDialog}
        setShowDialog={setShowTriggerBenefitDialog}
      /> */}

      <BalanceDeleteConfirmation
        isOpen={deleteConfirm.show}
        onClose={handleCloseDeleteConfirm}
        onConfirm={() =>
          handleDeleteThreshold(deleteConfirm.thresholdId!, deleteConfirm.pcrf)
        }
        itemName={deleteConfirm.name}
        title="Delete Threshold"
        message="Are you sure you want to delete this threshold?"
      />

      <Dialog open={showDetailBalanceTrigger} onOpenChange={handleClose}>
        <DialogContent className="container-fixed max-w-[1350px] p-4 flex flex-col overflow-hidden">
          <DialogHeader className="p-0 border-0">
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
            <div className="flex items-center justify-between flex-wrap grow gap-5 pb-7.5">
              <div className="flex flex-col justify-center gap-2">
                <h1 className="text-xl font-semibold leading-none text-gray-900">
                  Threshold Balance Trigger
                </h1>
              </div>
            </div>
          </DialogHeader>

          <DialogBody
            className="flex py-0 mb-5 scrollable-y ps-0 pe-3 -me-7"
            ref={parentRef}
          >
            <div className="w-64 p-4 border-r bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Threshold</h2>
                <button
                  className="text-xl text-blue-500"
                  onClick={() => {
                    setFormMode("create");
                    setSelectedThreshold(null);
                    resetForm();
                  }}
                >
                  +
                </button>
              </div>
              <div className="space-y-1">
                {thresholdList?.map((item: any, index: number) => {
                  const isActive =
                    selectedThreshold?.tresholdId === item.tresholdId;

                  return (
                    <li
                      key={item.tresholdId}
                      onClick={() => {
                        setValue("triggerId", item.triggerId);
                        handleThresholdDetail(item);
                      }}
                      className={`py-2 px-3 mb-1 rounded cursor-pointer transition group relative overflow-hidden ${
                        isActive
                          ? "bg-blue-100 text-blue-600 font-semibold"
                          : "hover:bg-gray-100"
                      } flex justify-between items-center`}
                    >
                      <span className="flex-1 pr-2">
                        {item.ratio != null
                          ? `${item.ratio}%`
                          : `${item.value}`}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({
                            show: true,
                            thresholdId: item.tresholdId,
                            pcrf: item.touchPcrf === "Y" ? true : false,
                            index: index,
                            name:
                              item.ratio != null
                                ? `${item.ratio}%`
                                : `${item.value}`,
                          });
                        }}
                        className="text-red-500 transition-all duration-300 ease-in-out transform translate-x-full opacity-0 hover:text-red-700 group-hover:translate-x-0 group-hover:opacity-100"
                      >
                        <KeenIcon icon="trash" />
                      </button>
                    </li>
                  );
                })}
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Basic Information */}
              <div className="pb-6 space-y-4 border-b">
                <h3 className="font-semibold text-gray-700">
                  Basic Information
                </h3>
                <div className="pb-4 space-y-4 border-b">
                  <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    {/* First Row */}
                    <div className="grid items-end grid-cols-6 gap-x-12">
                      <div className="col-span-3">
                        <label className="text-sm text-gray-600">
                          Trigger By
                        </label>
                        <div className="flex gap-4 mt-2">
                          {["threshold", "ratio"].map((type: string) => (
                            <label
                              key={type}
                              className="flex items-center gap-1"
                            >
                              <input
                                type="radio"
                                value={type}
                                checked={watch("triggerBy") === type}
                                {...register("triggerBy")}
                                onChange={(e) => {
                                  setValue("triggerBy", e.target.value);
                                  setValue("value", null);
                                  setValue("reAttr", null);
                                  setValue("interval", null);
                                  setValue("touchPcrf", "N");
                                  setValue("triggerMode", null);
                                }}
                              />
                              <span className="text-sm capitalize">{type}</span>
                            </label>
                          ))}
                        </div>
                        {errors.triggerBy && (
                          <span className="text-sm text-red-500">
                            {errors.triggerBy.message}
                          </span>
                        )}
                      </div>

                      <div className="col-span-3">
                        <label className="text-sm text-gray-600">
                          {watch("triggerBy") === "ratio"
                            ? "Ratio "
                            : "Threshold "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          control={control}
                          name="value"
                          render={({ field }) => (
                            <Input
                              type="text"
                              value={
                                field.value !== null &&
                                field.value !== undefined
                                  ? String(field.value)
                                  : ""
                              }
                              onChange={(e) => {
                                const value = e.target.value;

                                const regex =
                                  watch("triggerBy") === "ratio"
                                    ? /^\d*\.?\d*$/
                                    : /^-?\d*\.?\d*$/;

                                if (regex.test(value)) {
                                  field.onChange(
                                    value === ""
                                      ? null
                                      : value === "-"
                                        ? value
                                        : Number(value),
                                  );
                                }
                              }}
                              disabled={
                                watch("reAttr") !== null &&
                                watch("triggerBy") === "threshold"
                              }
                              className={`w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                watch("triggerBy") === "threshold" &&
                                watch("reAttr") !== null
                                  ? "cursor-not-allowed bg-gray-100"
                                  : ""
                              }`}
                              placeholder={
                                watch("triggerBy") === "ratio"
                                  ? "Enter ratio (e.g., 5%)"
                                  : "Enter threshold (e.g., 100)"
                              }
                            />
                          )}
                        />
                      </div>
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-6 gap-x-12">
                      <div className="col-span-3">
                        <label className="text-sm text-gray-600">
                          Interval
                        </label>
                        <Controller
                          control={control}
                          name="interval"
                          render={({ field }) => (
                            <Input
                              type="text"
                              value={
                                field.value !== null &&
                                field.value !== undefined
                                  ? String(field.value)
                                  : ""
                              }
                              onChange={(e) => {
                                const value = e.target.value;

                                const regex = /^-?\d*\.?\d*$/;

                                if (regex.test(value)) {
                                  field.onChange(
                                    value === ""
                                      ? null
                                      : value === "-"
                                        ? value
                                        : Number(value),
                                  );
                                }
                              }}
                              className={
                                "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              }
                              placeholder="Enter interval (e.g., 5)"
                            />
                          )}
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="text-sm text-gray-600">
                          Feature
                          {watch("triggerBy") === "ratio" && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        <div className="flex items-center gap-2">
                          <Controller
                            control={control}
                            name="reAttr"
                            render={({ field }) => (
                              <Select
                                value={
                                  field.value !== null &&
                                  field.value !== undefined
                                    ? String(field.value)
                                    : "null"
                                }
                                onValueChange={(val) => {
                                  field.onChange(
                                    val === "null" || !val ? null : Number(val),
                                  );
                                }}
                              >
                                <SelectTrigger size="sm">
                                  <SelectValue placeholder="---Please Select---" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="null">
                                    ---Please Select---
                                  </SelectItem>
                                  <SelectItem value="901">Currency</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />

                          <Button
                            variant={"outline"}
                            type="button"
                            onClick={() => {
                              setValue("reAttr", null);
                            }}
                            className="px-2 py-0 m-0 text-xs border rounded whitespace-nowrap"
                            title="Reset selection"
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Third Row */}
                    <div className="grid grid-cols-6 gap-x-12">
                      <div className="col-span-3">
                        <label className="text-sm text-gray-600">
                          Trigger PCRF
                        </label>
                        <div className="mt-2">
                          <Controller
                            control={control}
                            name="touchPcrf"
                            render={({ field }) => (
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                checked={watch("touchPcrf") === "Y"}
                                onChange={(e) =>
                                  field.onChange(e.target.checked ? "Y" : "N")
                                }
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div className="col-span-3">
                        <label className="text-sm text-gray-600">
                          Trigger Mode
                        </label>
                        <Controller
                          control={control}
                          name="triggerMode"
                          render={({ field }) => (
                            <Select
                              value={
                                field.value !== null ? field.value : "null"
                              }
                              onValueChange={(triggerMode) => {
                                field.onChange(triggerMode);
                              }}
                              disabled={watch("touchPcrf") === "N"}
                            >
                              <SelectTrigger size="sm">
                                <SelectValue placeholder="---Please Select---" />
                              </SelectTrigger>
                              <SearchSelect>
                                <SelectItem value="null">
                                  ---Please Select---
                                </SelectItem>
                                <SelectItem value="0">Terminal</SelectItem>
                                <SelectItem value="1">Cross</SelectItem>
                                <SelectItem value="2">Precise</SelectItem>
                              </SearchSelect>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => handleCloseDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="text-white bg-blue-500 hover:bg-blue-700"
                        type="submit"
                        disabled={isLoading}
                      >
                        {formMode === "create" ? "Create" : "Update"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              {selectedThreshold?.tresholdId && (
                <>
                  {/* Trigger Benefit */}
                  <div className="pb-6 mt-6 border-b">
                    <BenefitList />
                  </div>

                  {/* Trigger Notification */}
                  <div className="pb-6 mt-6 border-b">
                    <NotificationList />
                  </div>

                  {/* Trigger Event */}
                  <div className="mt-6">
                    <EventList />
                  </div>
                </>
              )}
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { ThresholdBalanceDialog };
