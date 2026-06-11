import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTriggerCreateContext } from "../../hooks";
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/config/api.config";
import { Alert, KeenIcon, LoaderTransparant, useDataGrid } from "@/components";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import z from "zod";
import { TriggerAcmSchema } from "./types/forms";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { SearchSelect } from "@/components/common/SearchSelect";

const API_URL = apiConfig.service_price_plan;
type TriggerAcmFormType = z.infer<typeof TriggerAcmSchema>;

const AddAccumulationDialog = () => {
  const parentRef = useRef<any | null>(null);
  const { selectedOfferVerId } = usePortalData();
  const { showAddAccumulationDialog, handleAddAccumulationDialog, commonTriggerList } = useTriggerCreateContext();
  const { table, reload } = useDataGrid();

  const methods = useForm<TriggerAcmFormType>({
    resolver: zodResolver(TriggerAcmSchema),
    defaultValues: {
      effectiveDate: undefined,
      expiryDate: null,
      accumulationType: undefined,
      triggerMode: undefined,
      offerVerId: selectedOfferVerId || 0,
      destination: null,
      stateDate: null,
      thresholdDetail: null,
    },
  });

  const {
    register,
    setValue,
    watch,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const destinationVal = watch("destination");
  const triggerModeVal = watch("triggerMode");
  const accmTypeVal = watch("accumulationType");

  console.log(errors);

  const { PostData, GetData } = useCallApi();
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const [accumulationType, setAccumulationType] = useState<any[]>([]);

  const resetForm = () => {
    reset();
  };

  const fetchAccumulationType = async () => {
    try {
      const response = await GetData(`${API_URL}/price/accumulation-type/list`, {});

      if (response.status) {
        setAccumulationType(response.data);
      }
    } catch (error) {
      toast.error("Error Fetching Data.Please Check Your Connection!");
    }
  };

  const onSubmit = (data: TriggerAcmFormType) => {
    const cleanedData: TriggerAcmFormType = {
      ...data,
      effectiveDate: data.effectiveDate,
      expiryDate: data.expiryDate,
      destination: data.destination ?? null,
      stateDate: data.stateDate ?? null,
      thresholdDetail: data.thresholdDetail ?? null,
    };

    doCreateTriggerAccumulation(cleanedData);
  };

  /* actions */
  const doCreateTriggerAccumulation = useCallback(async (data: TriggerAcmFormType) => {
    // setIsLoading(true);

    try {
      const response = await PostData(`${API_URL}/trigger/accumulation/create`, {
        ...data,
      });

      if (response?.status) {
        reload();
        setAlert((prev) => ({ ...prev, show: false, message: "" }));
        handleAddAccumulationDialog(false, null);
        toast.success("Success Create Accumulation Trigger ");
        resetForm();
        setIsLoading(false);
      } else {
        toast.error(response?.message || "Error Create Accumulation Trigger");
        setAlert((prev) => ({
          ...prev,
          show: true,
          message: response?.message,
        }));
      }
    } catch (error) {
      toast.error("Error Create Accumulation Trigger. Please Try Again!");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!showAddAccumulationDialog) {
      resetForm();
    }
  }, [showAddAccumulationDialog]);

  useEffect(() => {
    if (showAddAccumulationDialog) {
      fetchAccumulationType();
    }
  }, [showAddAccumulationDialog]);

  useEffect(() => {
    if (selectedOfferVerId) {
      setValue("offerVerId", selectedOfferVerId || 0);
    }
  }, [selectedOfferVerId]);

  return (
    <>
      {/* {isLoading && <LoaderTransparant />} */}
      <Dialog open={showAddAccumulationDialog} onOpenChange={(open) => handleAddAccumulationDialog(open, null)}>
        <DialogContent className="container-fixed max-w-[768px] flex flex-col p-10 overflow-hidden">
          <DialogHeader className="p-0 border-0">
            <div className="flex items-center justify-between flex-wrap grow gap-5 pb-7.5">
              <div className="flex flex-col justify-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">New Accumulation Trigger</h1>
              </div>
            </div>
          </DialogHeader>

          <DialogBody className="scrollable-y py-0 mb-5 ps-0 pe-3 -me-7" ref={parentRef}>
            <div className="flex flex-col items-stretch grow gap-5 lg:gap-7.5">
              {alert.show && (
                <Alert variant="danger">
                  <h3>{alert.message}</h3>
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="card-body grid gap-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Basic Information</h2>

                  {/* Form Fields Container */}
                  <div className="grid gap-6">
                    {/* Effective Date */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-start">
                      <label className="form-label flex items-center gap-1 lg:col-span-1">
                        Effective Date
                        <span className="text-red-500 font-medium">*</span>
                      </label>
                      <div className="lg:col-span-3">
                        <Input
                          type="datetime-local"
                          step={1}
                          placeholder="Select effective date and time"
                          className={`w-full transition-colors ${errors.effectiveDate ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
                          {...register("effectiveDate", {
                            required: "Effective Date is required",
                          })}
                          onChange={(e) => {
                            e.target.blur();
                          }}
                        />
                        {errors.effectiveDate && <p className="mt-1 text-xs text-red-500">{errors.effectiveDate.message}</p>}
                      </div>
                    </div>

                    {/* Expiry Date */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-start">
                      <label className="form-label flex items-center gap-1 lg:col-span-1">Expiry Date</label>
                      <div className="lg:col-span-3">
                        <Input
                          type="datetime-local"
                          step={1}
                          placeholder="Select expiry date"
                          className={`w-full transition-colors ${errors.expiryDate ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
                          {...register("expiryDate")}
                          onChange={(e) => {
                            e.target.blur();
                          }}
                        />
                      </div>
                    </div>

                    {/* Accumulation Type */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-start">
                      <label className="form-label flex items-center gap-1 lg:col-span-1">
                        Accumulation Type
                        <span className="text-red-500 font-medium">*</span>
                      </label>
                      <div className="lg:col-span-3">
                        <Controller
                          control={control}
                          name="accumulationType"
                          render={({ field }) => (
                            <div className="flex flex-row">
                              <Select value={field.value ? String(field.value) : ""} onValueChange={(val) => field.onChange(!val ? null : Number(val))}>
                                <SelectTrigger
                                  size="sm"
                                  className={`w-full transition-colors ${errors.accumulationType ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
                                >
                                  <SelectValue placeholder="Select accumulation type..." />
                                </SelectTrigger>
                                <SearchSelect>
                                  {accumulationType.map((ac) => (
                                    <SelectItem key={ac.resourceId} value={ac.resourceId.toString()}>
                                      {ac.resourceName}
                                    </SelectItem>
                                  ))}
                                </SearchSelect>
                              </Select>
                              {accmTypeVal !== 0 && accmTypeVal !== undefined && accmTypeVal !== null && (
                                <Button type="button" size="sm" variant="ghost" onClick={() => setValue("accumulationType", 0, { shouldValidate: true, shouldDirty: true })}>
                                  <KeenIcon icon="cross" />
                                </Button>
                              )}
                            </div>
                          )}
                        />
                        {errors.accumulationType && <p className="mt-1 text-xs text-red-500">{errors.accumulationType.message}</p>}
                      </div>
                    </div>

                    {/* Trigger Mode */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-start">
                      <label className="form-label flex items-center gap-1 lg:col-span-1">
                        Trigger Mode
                        <span className="text-red-500 font-medium">*</span>
                      </label>
                      <div className="lg:col-span-3">
                        <Controller
                          control={control}
                          name="triggerMode"
                          render={({ field }) => (
                            <div className="flex flex-row">
                              <Select value={field.value ? String(field.value) : ""} onValueChange={(val) => field.onChange(val === "null" ? null : val)}>
                                <SelectTrigger size="sm" className={`w-full transition-colors ${errors.triggerMode ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}>
                                  <SelectValue placeholder="Select trigger mode..." />
                                </SelectTrigger>
                                <SearchSelect>
                                  {commonTriggerList.map((ac: any) => (
                                    <SelectItem key={ac.triggerType} value={ac.triggerType}>
                                      {ac.triggerTypeName}
                                    </SelectItem>
                                  ))}
                                </SearchSelect>
                              </Select>
                              {triggerModeVal && (
                                <Button type="button" size="sm" variant="ghost" onClick={() => setValue("triggerMode", "", { shouldValidate: true, shouldDirty: true })}>
                                  <KeenIcon icon="cross" />
                                </Button>
                              )}
                            </div>
                          )}
                        />
                        {errors.triggerMode && <p className="mt-1 text-xs text-red-500">{errors.triggerMode.message}</p>}
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-start">
                      <label className="form-label flex items-center gap-1 lg:col-span-1">Destination</label>
                      <div className="lg:col-span-3">
                        <Controller
                          control={control}
                          name="destination"
                          render={({ field }) => (
                            <div className="flex flex-row">
                              <Select value={field.value ? String(field.value) : ""} onValueChange={(val) => field.onChange(val === "null" ? null : val)}>
                                <SelectTrigger size="sm" className={`w-full transition-colors ${errors.destination ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}>
                                  <SelectValue placeholder="Select destination..." />
                                </SelectTrigger>
                                <SearchSelect>
                                  <SelectItem value="1">CVBS</SelectItem>
                                  <SelectItem value="2">MCCM</SelectItem>
                                  <SelectItem value="3">BOTH</SelectItem>
                                </SearchSelect>
                              </Select>
                              {destinationVal && (
                                <Button type="button" size="sm" variant="ghost" onClick={() => setValue("destination", null, { shouldValidate: true, shouldDirty: true })}>
                                  <KeenIcon icon="cross" />
                                </Button>
                              )}
                            </div>
                          )}
                        />
                        {errors.destination && <p className="mt-1 text-xs text-red-500">{errors.destination.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end pt-6 gap-3 border-t border-gray-100 mt-6">
                    <Button variant="outline" type="button" onClick={() => handleAddAccumulationDialog(false, null)} className="px-6">
                      Cancel
                    </Button>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6" type="submit">
                      Submit
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { AddAccumulationDialog };
