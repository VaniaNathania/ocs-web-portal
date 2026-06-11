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
import clsx from "clsx";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { TriggerBenefitDialog } from "./blocks/TriggerBenefitDialog";
import { TriggerNotificationDialog } from "./blocks/TriggerNotificationDialog";
import { BenefitList } from "./blocks/BenefitList";
import { NotificationList } from "./blocks/NotificationList";
import { EventList } from "./blocks/EventList";
import { debounce } from "@/lib/helpers";
import AcmDeleteConfirmation from "./blocks/AcmDeleteConfirmation";
import { watch } from "fs";
import { SearchSelect } from "@/components/common/SearchSelect";

interface AccumulationTriggerCreate {
  triggerId: number;
  triggerBy: string;
  interval: number | null;
  triggerPCRF: string;
  ruleId: number | null;
  threshold: number | null;
  feature: number | null;
  triggerMode: string | null;
  thresholdAttribute: string | null;
  billshockRuleId: string | null;
}

const API_URL = apiConfig.service_price_plan;

const DetailAccumulationDialog = () => {
  const parentRef = useRef<any | null>(null);
  const {
    thresholdList,
    showDetailAccumulationDialog,
    handleThresholdAccumulationDialog,
    fetchThresholdList,
    selectedThreshold,
    setSelectedThreshold,
    selectedTrigger,
    refreshBenefitList,
    refreshNotificationList,
  } = useTriggerCreateContext();
  

  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    thresholdId: number | null;
    index: number | null;
    name: string;
  }>({
    show: false,
    thresholdId: null,
    index: null,
    name: "",
  });

  const { PostData, PutData, GetData, DeleteData } = useCallApi();
  const [isLoading, setIsLoading] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "update">("create");
  const [errors, setErrors] = useState<any>({});
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const initialState: AccumulationTriggerCreate = {
    triggerId: selectedTrigger?.triggerId,
    triggerBy: "threshold",
    interval: null,
    triggerPCRF: "N",
    ruleId: null,
    threshold: null,
    feature: null,
    triggerMode: null,
    thresholdAttribute: null,
    billshockRuleId: null,
  };

  const [formData, setFormData] =
    useState<AccumulationTriggerCreate>(initialState);

  type State = typeof initialState;

  const validationRules: Record<
    number,
    { key: keyof State; errorMessage: string }[]
  > = {
    0: [
      {
        key: "triggerBy",
        errorMessage: "Trigger By must be filled in.",
      },
      {
        key: "threshold",
        errorMessage: "Threshold must be filled in.",
      },
    ],
  };

  const validationForm = (
    step: number,
    state: State,
  ): Record<string, string> => {
    const errors: Record<string, string> = {};
    const fieldsToValidate = validationRules[step] || [];

    fieldsToValidate.forEach(({ key, errorMessage }) => {
      const value = state[key];

      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0)
      ) {
        errors[key] = errorMessage;
      }
    });

    // Validasi kondisional untuk feature
    if (step === 0) {
      // Jika triggerBy adalah "ratio", maka feature wajib diisi
      if (state.triggerBy === "ratio") {
        const featureValue = state.feature;
        if (
          featureValue === undefined ||
          featureValue === null ||
          Array.isArray(featureValue)
        ) {
          errors.feature =
            "Feature must be filled in when using ratio trigger.";
        }
      }
      // Jika triggerBy adalah "threshold", feature tidak wajib (tidak ada validasi)
    }

    return errors;
  };

  const [showTriggerBenefitDialog, setShowTriggerBenefitDialog] =
    useState(false);
  const [features, setFeatures] = useState<FeatureAcmList[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const resetForm = () => {
    setFormData(initialState);
  };

  const handleClose = () => {
    setFormData(initialState);
    handleThresholdAccumulationDialog(false, null);
    setSelectedThreshold(null);
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
    handleThresholdAccumulationDialog(open, null);
    setFormData(initialState);
  };

  const handleThresholdDetail = async (thresholdItem: any) => {
    setSelectedThreshold(thresholdItem);

    try {
      const response = await GetData(`${API_URL}/trigger/threshold/acm/list`, {
        triggerId: selectedTrigger?.triggerId,
        acmThresholdId: thresholdItem.acmThresholdId,
      });

      if (response.status) {
        const data = response.data[0];

        setFormData({
          triggerId: data.triggerId,
          triggerBy:
            data.triggerBy || (data.ratio !== null ? "ratio" : "threshold"),
          interval: data.interval,
          triggerPCRF: data.touchPcrf,
          ruleId: data.acmBilShockRuleId,
          threshold: data.triggerBy === "ratio" ? data.ratio : data.value,
          feature: data.reAttr,
          triggerMode: data.triggerMode,
          thresholdAttribute: data.onOffAttr,
          billshockRuleId: data.acmBilShockRuleId,
        });

        setTimeout(() => {
          // will re-render with new selectedThreshold
          refreshBenefitList();
          refreshNotificationList();
        }, 100);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Something went wrong please try again later!");
    }
  };

  const doCreateThresholdAccumulation = useCallback(
    async (data: AccumulationTriggerCreate) => {
      if (formMode === "create") {
        try {
          setIsLoading(true);
          const response = await PostData(
            `${API_URL}/trigger/threshold/acm/create`,
            data,
          );
          if (response?.status) {
            await fetchThresholdList(data.triggerId, "accumulation");
            setSelectedThreshold(null);
            setAlert({ show: false, message: "" });
            toast.success("Success Create Data Threshold");
            setErrors(null);
            resetForm();
          } else {
            toast.error(response?.message);
          }
        } catch (error) {
          toast.error("Something went wrong please try again later!");
        } finally {
          setIsLoading(false);
        }
      } else if (formMode === "update") {
        try {
          const response = await PutData(
            `${API_URL}/trigger/threshold/acm/update/${selectedThreshold.acmThresholdId}`,
            {
              triggerBy: data.triggerBy,
              interval: data.interval,
              ratio: data.triggerBy === "ratio" ? data.threshold : null,
              value: data.triggerBy === "threshold" ? data.threshold : null,
              feature: data.feature,
              onOffAttr: data.thresholdAttribute,
            },
          );
          if (response?.status) {
            await fetchThresholdList(data.triggerId, "accumulation");
            toast.success("Success Update Data Threshold");
            setAlert({ show: false, message: "" });
            setErrors(null);
          } else {
            toast.error("Error Update Threshold Accumulation Trigger");
          }
        } catch (error) {
          toast.error("Something went wrong please try again later!");
        }
      }
    },
    [formMode, selectedThreshold],
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validationForm(0, formData);
    if (Object.keys(errors).length > 0) {
      const errorMessage = Object.values(errors);
      errorMessage.map((message) => {
        toast.error(message);
      });
      return;
    }

    doCreateThresholdAccumulation(formData);
  };

  const handleDeleteThreshold = async (thresholdId: number) => {
    try {
      const response = await DeleteData(
        `${API_URL}/trigger/threshold/acm/delete?thresholdId=${thresholdId}`,
        {},
      );

      if (response?.status) {
        toast.success("Success Delete Threshold");
        await fetchThresholdList(selectedTrigger.triggerId, "accumulation");
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
      index: null,
      name: "",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (showDetailAccumulationDialog) {
        await fetchThresholdList(selectedTrigger.triggerId, "accumulation");
        setFormData((prev) => ({
          ...prev,
          triggerId: selectedTrigger.triggerId,
        }));
      }
    };

    fetchData();
  }, [showDetailAccumulationDialog]);

  useEffect(() => {
    if (formData.triggerBy === "threshold") {
      setFormData((prev: any) => ({
        ...prev,
        threshold: formData.feature !== null ? 0 : null,
      }));
    }
  }, [formData.feature, formData.triggerBy]);

  const debouncedFetch = useRef(
    debounce((value: string) => {
      doGetListFeature(value);
    }, 400),
  ).current;

  useEffect(() => {
    if (showDetailAccumulationDialog) {
      debouncedFetch(searchTerm);
    }

    if (showDetailAccumulationDialog && formData.triggerPCRF === "N") {
      setFormData((prev) => ({
        ...prev,
        triggerMode: null,
      }));
    }
  }, [searchTerm, showDetailAccumulationDialog, formData.triggerPCRF]);

  useEffect(() => {
    if (selectedTrigger) {
      setFormData((prev) => ({
        ...prev,
        triggerId: selectedTrigger.triggerId,
      }));
    }

    if (selectedThreshold) {
      setFormMode("update");
    }
  }, [selectedTrigger, selectedThreshold]);

  return (
    <>
      <TriggerBenefitDialog
        showDialog={showTriggerBenefitDialog}
        setShowDialog={setShowTriggerBenefitDialog}
      />

      <AcmDeleteConfirmation
        isOpen={deleteConfirm.show}
        onClose={handleCloseDeleteConfirm}
        onConfirm={() => handleDeleteThreshold(deleteConfirm.thresholdId!)}
        itemName={deleteConfirm.name}
        title="Delete Threshold"
        message="Are you sure you want to delete this threshold?"
      />

      <Dialog open={showDetailAccumulationDialog} onOpenChange={handleClose}>
        <DialogContent className="container-fixed max-w-[1350px] p-4 flex flex-col overflow-hidden">
          <DialogHeader className="p-0 border-0">
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
            <div className="flex items-center justify-between flex-wrap grow gap-5 pb-7.5">
              <div className="flex flex-col justify-center gap-2">
                <h1 className="text-xl font-semibold leading-none text-gray-900">
                  Threshold Accumulation Trigger
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
                    selectedThreshold?.acmThresholdId === item.acmThresholdId;
                  return (
                    <li
                      key={item.acmThresholdId}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          triggerId: item.triggerId,
                        }));
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
                            thresholdId: item.acmThresholdId,
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
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* First Row */}
                    <div className="grid items-end grid-cols-6 gap-x-12">
                      <div className="col-span-3">
                        <label className="text-sm text-gray-600">
                          Trigger By
                        </label>
                        <div className="flex items-center gap-4 mt-2">
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name="triggerBy"
                              className="text-blue-600"
                              value="threshold"
                              checked={formData.triggerBy === "threshold"}
                              onChange={(e) => {
                                setFormData((prev: any) => ({
                                  ...prev,
                                  triggerBy: e.target.value,
                                  threshold: null,
                                  feature: null,
                                  interval: null,
                                  triggerPCRF: "N",
                                  triggerMode: null,
                                  ruleId: null,
                                  thresholdAttribute: null,
                                  billshockRuleId: null,
                                }));
                              }}
                            />
                            <span className="text-sm">Threshold</span>
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name="triggerBy"
                              value="ratio"
                              className="text-blue-600"
                              checked={formData.triggerBy === "ratio"}
                              onChange={(e) => {
                                setFormData((prev: any) => ({
                                  ...prev,
                                  triggerBy: e.target.value,
                                  threshold: null,
                                  feature: null,
                                  interval: null,
                                  triggerPCRF: "N",
                                  triggerMode: null,
                                  ruleId: null,
                                  thresholdAttribute: null,
                                  billshockRuleId: null,
                                }));
                              }}
                            />
                            <span className="text-sm">Ratio</span>
                          </label>
                        </div>
                      </div>

                      <div className="col-span-3">
                        <label className="text-sm text-gray-600">
                          {formData.triggerBy === "ratio"
                            ? "Ratio"
                            : "Threshold"}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={
                            formData.threshold !== null &&
                            formData.threshold !== undefined
                              ? String(formData.threshold)
                              : ""
                          }
                          className={
                            "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
                          }
                          placeholder={
                            formData.triggerBy === "ratio"
                              ? "Enter ratio (e.g., 5%)"
                              : "Enter threshold (e.g., 100)"
                          }
                          onChange={({ target }) => {
                            const value = target.value;

                            const regex =
                              formData.triggerBy === "ratio"
                                ? /^\d*\.?\d*$/ // hanya positif
                                : /^-?\d*\.?\d*$/; // angka dengan optional minus

                            if (regex.test(value)) {
                              setFormData((prev: any) => ({
                                ...prev,
                                threshold:
                                  value === ""
                                    ? null
                                    : value === "-"
                                      ? value
                                      : Number(value),
                              }));
                            }
                          }}
                          disabled={
                            formData.feature !== null &&
                            formData.triggerBy === "threshold"
                          }
                        />
                      </div>
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-6 gap-x-12">
                      <div className="col-span-3">
                        <label className="text-sm text-gray-600">
                          Interval
                        </label>
                        <input
                          type="text"
                          value={formData.interval || ""}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none"
                          onChange={({ target }) => {
                            const value = target.value;

                            const regex = /^-?\d*\.?\d*$/;

                            if (regex.test(value)) {
                              setFormData((prev: any) => ({
                                ...prev,
                                interval:
                                  value === ""
                                    ? null
                                    : value === "-"
                                      ? value
                                      : Number(value),
                              }));
                            }
                          }}
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="text-sm text-gray-600">
                          Feature
                          {formData.triggerBy === "ratio" && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        <div className="flex items-center gap-2">
                          <Select
                            value={String(formData.feature) ?? ""}
                            onValueChange={(feature) => {
                              setFormData((prev: any) => ({
                                ...prev,
                                feature: feature ? Number(feature) : null,
                              }));
                            }}
                          >
                            <SelectTrigger size="sm">
                              <SelectValue placeholder="---Please Select---" />
                            </SelectTrigger>
                            <SearchSelect onSearch={setSearchTerm}>
                              {/* Dynamic Options */}
                              {features.map((ac) => (
                                <SelectItem
                                  key={ac.reAttr}
                                  value={String(ac.reAttr)}
                                >
                                  {ac.reAttrName}
                                </SelectItem>
                              ))}
                            </SearchSelect>
                          </Select>

                          {/* Reset Button */}
                          <Button
                            variant={"outline"}
                            type="button"
                            onClick={() => {
                              setFormData((prev: any) => ({
                                ...prev,
                                feature: null,
                              }));
                            }}
                            className="px-1 m-0 text-xs border rounded whitespace-nowrap"
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
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            checked={formData.triggerPCRF === "Y"}
                            onChange={(e) => {
                              const value = e.target.checked ? "Y" : "N";
                              setFormData((prev: any) => ({
                                ...prev,
                                triggerPCRF: value,
                              }));
                            }}
                          />
                        </div>
                      </div>

                      <div className="col-span-3">
                        <label className="text-sm text-gray-600">
                          Trigger Mode
                        </label>
                        <Select
                          value={formData.triggerMode ?? ""}
                          onValueChange={(triggerMode) => {
                            setFormData((prev: any) => ({
                              ...prev,
                              triggerMode: triggerMode,
                            }));
                          }}
                          disabled={formData.triggerPCRF === "N"}
                        >
                          <SelectTrigger size="sm">
                            <SelectValue placeholder="---Please Select---" />
                          </SelectTrigger>
                          <SearchSelect>
                            <SelectItem value="0">Terminal</SelectItem>
                            <SelectItem value="1">Cross</SelectItem>
                            <SelectItem value="2">Precise</SelectItem>
                          </SearchSelect>
                        </Select>
                      </div>
                    </div>

                    {/* Fourth Row */}
                    <div className="grid grid-cols-6 gap-x-12">
                      <div className="col-span-3">
                        <label className="text-sm text-gray-600">
                          Rule Name
                        </label>
                        <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>---Please Select---</option>
                        </select>
                      </div>

                      <div className="col-span-3">
                        <label className="text-sm text-gray-600">
                          Threshold Attribute
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none"
                          value={formData.thresholdAttribute || ""}
                          onChange={(e) => {
                            setFormData((prev: any) => ({
                              ...prev,
                              thresholdAttribute: e.target.value || null,
                            }));
                          }}
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

              {selectedThreshold?.acmThresholdId && (
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

export { DetailAccumulationDialog };
