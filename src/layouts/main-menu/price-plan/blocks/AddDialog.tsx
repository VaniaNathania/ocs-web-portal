import {
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/config/api.config";
import { Alert, KeenIcon, useDataGrid } from "@/components";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import clsx from "clsx";
import moment from "moment";
import { Textarea } from "@/components/ui/textarea";
import { DateRange } from "react-day-picker";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pricePlanCreateSchema } from "../forms/form";
import { PricePlanListContext } from "../hooks/PricePlanContext";

interface ServiceType {
  servType: number;
  servTypeName: string;
  networkType: string;
  networkTypeName: string;
}

const API_URL = apiConfig.service_price_plan;

type IntervalType = "day" | "week" | "month";
type PricePlanCreateFormType = z.infer<typeof pricePlanCreateSchema>;

const AddDialog = () => {
  const parentRef = useRef<any | null>(null);
  const { showAddDialog, handleAddDialog, selectedApplyLevel } =
    useContext(PricePlanListContext);
  const { reload } = useDataGrid();
  const { PostData, PutData, GetData } = useCallApi();

  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const methods = useForm<PricePlanCreateFormType>({
    resolver: zodResolver(pricePlanCreateSchema),
    defaultValues: {
      offerType: "4",
      offerName: "",
      pricePlanType: "",
      applyLevel: "S",
      pricePlanCode: "",
      remarks: "",
      spId: 0,
      priority: 0,
      serviceType: null,
      baseValidPeriod: new Date().toISOString().split("T")[0],
      expBaseValidPeriod: null,
      version: {
        effDate: new Date().toISOString().split("T")[0],
        expDate: null,
        sourceFrom: "1",
        isCopyOfferAttr: "N",
        oldPricePlanVerId: null,
        prefix: "",
        postfix: "",
      },
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = methods;

  const [baseValidPeriod, setBaseValidPeriod] = useState<Date>(new Date());
  const [expBaseValidPeriod, setExpBaseValidPeriod] = useState<
    Date | undefined
  >(undefined);
  const [versionValidPeriod, setVersionValidPeriod] = useState<Date>(
    new Date()
  );
  const [versionExpValidPeriod, setVersionExpValidPeriod] = useState<
    Date | undefined
  >(undefined);

  const [allType, setAllType] = useState<any[]>([]);
  const [serviceType, setServiceType] = useState<ServiceType[]>([]);
  const [copyFrom, setCopyFrom] = useState<
    {
      pricePlanId: number;
      pricePlanName: string;
      effDate: string;
      offerVerId: number;
    }[]
  >([]);

  useEffect(() => {
    const fetchAllType = async () => {
      try {
        const response = await GetData(
          `${API_URL}/priceplan/all-type/list`,
          {}
        );
        if (response?.data) {
          setAllType(response?.data);
        }
      } catch (error) {
        toast.error("Error GET All Type data");
      }
    };

    const fetchServiceType = async (page: number, size: number) => {
      try {
        const response = await GetData(`${API_URL}/priceplan/serv-type/list`, {
          page: page,
          size: size,
        });
        if (response?.data) {
          setServiceType(response?.data);
        }
      } catch (error) {
        toast.error("Error GET Service Type data");
      }
    };

    const fetchCopyFrom = async () => {
      try {
        const response = await GetData(
          `${API_URL}/priceplan/copyFrom/list`,
          {}
        );

        if (response.status) {
          setCopyFrom(response.data);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error("Error GET Copy From Data");
      }
    };

    fetchServiceType(1, 100);
    fetchAllType();
    fetchCopyFrom();
  }, []);

  /* actions */
  const doCreateUser = async (formField: PricePlanCreateFormType) => {
    const response = await PostData(`${API_URL}/priceplan/create`, formField);

    if (response?.status) {
      setAlert((prev) => ({ ...prev, show: false, message: "" }));
      handleAddDialog(false);
      toast.success("Success Create Price Plan ");
      reload();
      const createActivity = {
        module: "Default",
        description: `Create New Default => ${formField.offerName}`,
        action: "C",
      };

      doSaveLogActivity(createActivity);
    } else {
      setAlert((prev) => ({
        ...prev,
        show: true,
        message: response?.message,
      }));
    }
  };

  const formatDate = (date: Date | undefined) =>
    date ? date.toISOString().split("T")[0] : "";

  const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());

  const onSubmit = async (data: PricePlanCreateFormType) => {
    await doCreateUser(data);
  };

  useEffect(() => {
    if (!showAddDialog) {
      reset();
      setAlert((prev) => ({ ...prev, show: false, message: "" }));
    }
  }, [showAddDialog]);

  useEffect(() => {
    if (selectedApplyLevel === "A") {
      setValue("applyLevel", selectedApplyLevel);

      // Reset pricePlanType jika value saat ini bukan 1 atau 3
      const currentPricePlanType = watch("pricePlanType");
      if (currentPricePlanType !== "1" && currentPricePlanType !== "3") {
        setValue("pricePlanType", "");
      }
    } else {
      setValue("applyLevel", selectedApplyLevel);
    }
  }, [selectedApplyLevel]);

  return (
    <Dialog open={showAddDialog} onOpenChange={(open) => handleAddDialog(open)}>
      <DialogContent className="container-fixed max-w-[1300px] flex flex-col p-0 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                New Price Plan
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Create a new price plan with basic and version information
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddDialog(false)}
            className="h-8 w-8 p-0"
          >
            <KeenIcon icon="cross" className="text-sm" />
          </Button>
        </DialogHeader>

        <DialogBody className="scrollable-y p-6" ref={parentRef}>
          <div className="flex flex-col gap-6">
            {alert.show && (
              <Alert variant="danger" className="mb-4">
                <h3>{alert.message}</h3>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Enter the basic details for the price plan
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price Plan Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Price Plan Type
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Select
                      value={watch("pricePlanType")}
                      onValueChange={(pricePlanType) => {
                        setValue("pricePlanType", pricePlanType);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Price Plan type" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        {allType
                          .filter((type) => {
                            const applyLevel = watch("applyLevel");
                            // Jika applyLevel adalah "A", hanya tampilkan ID 1 dan 3
                            if (applyLevel === "A") {
                              return String(type.id) === "1" || String(type.id) === "3";
                            }
                            // Jika bukan "A", tampilkan semua
                            return true;
                          })
                          .map((type) => (
                            <SelectItem key={type.id} value={String(type.id)}>
                              {type.pricePlanTypeName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {errors.pricePlanType && (
                      <p className="text-xs text-red-500">
                        {errors.pricePlanType.message}
                      </p>
                    )}
                  </div>

                  {/* Price Plan Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Price Plan Name
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter price plan name"
                      autoComplete="off"
                      {...register("offerName", {
                        required: "Price Plan Name is required",
                      })}
                    />
                    {errors.offerName && (
                      <p className="text-xs text-red-500">
                        {errors.offerName.message}
                      </p>
                    )}
                  </div>

                  {/* Price Plan Code */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Price Plan Code
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter price plan code"
                      autoComplete="off"
                      {...register("pricePlanCode")}
                    />
                  </div>

                  {/* Service Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Service Type
                    </label>
                    <Select
                      value={String(watch("serviceType")) ?? null}
                      onValueChange={(serviceType) => {
                        setValue("serviceType", Number(serviceType));
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Service Type" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        {serviceType.map((type) => (
                          <SelectItem
                            key={type.servType}
                            value={type.servType.toString()}
                          >
                            {type.servTypeName +
                              " [" +
                              type.networkTypeName +
                              "]"}{" "}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Valid Period */}
                {/* BASE VALID PERIOD */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Valid Period <span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-center gap-4">
                    {/* EFFECTIVE DATE */}
                    <div className="flex-1 relative">
                      <input
                        type="date"
                        value={formatDate(baseValidPeriod)}
                        onChange={(e) => {
                          if (!e.target.value) {
                            return;
                          }

                          const selectedDate = new Date(e.target.value);

                          if (
                            isValidDate(expBaseValidPeriod) &&
                            selectedDate > expBaseValidPeriod!
                          ) {
                            toast.error(
                              "Effective date cannot be greater than expiry date"
                            );
                            return;
                          }

                          setBaseValidPeriod(selectedDate);
                          setValue("baseValidPeriod", e.target.value);
                        }}
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <span className="text-gray-500">to</span>

                    {/* EXPIRY DATE */}
                    <div className="flex-1 relative">
                      <input
                        type="date"
                        value={formatDate(expBaseValidPeriod)}
                        onChange={(e) => {
                          if (!e.target.value) {
                            setExpBaseValidPeriod(undefined);
                            setValue("expBaseValidPeriod", null as any);
                            return;
                          }

                          const selectedDate = new Date(e.target.value);

                          if (
                            isValidDate(baseValidPeriod) &&
                            selectedDate < baseValidPeriod
                          ) {
                            toast.error(
                              "Expiry date cannot be earlier than effective date"
                            );
                            return;
                          }

                          setExpBaseValidPeriod(selectedDate);
                          setValue("expBaseValidPeriod", e.target.value);
                        }}
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      {expBaseValidPeriod && (
                        <button
                          type="button"
                          onClick={() => {
                            setExpBaseValidPeriod(undefined);
                            setValue("expBaseValidPeriod", null as any);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {errors.baseValidPeriod && (
                    <p className="text-xs text-red-500">
                      {errors.baseValidPeriod.message}
                    </p>
                  )}
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Remarks
                  </label>
                  <Textarea
                    className="min-h-20 resize-none"
                    placeholder="Enter any additional notes or remarks"
                    {...register("remarks")}
                  />
                </div>
              </div>

              {/* Version Information Section */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Version Information
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure version-specific settings
                  </p>
                </div>

                {/* Version Valid Period */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Version Valid Period <span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-center gap-4">
                    {/* VERSION EFF DATE */}
                    <div className="flex-1 relative">
                      <input
                        type="date"
                        value={formatDate(versionValidPeriod)}
                        onChange={(e) => {
                          if (!e.target.value) {
                            return;
                          }

                          const selectedDate = new Date(e.target.value);

                          if (
                            isValidDate(versionExpValidPeriod) &&
                            selectedDate > versionExpValidPeriod!
                          ) {
                            toast.error(
                              "Version effective date cannot be greater than expiry date"
                            );
                            return;
                          }

                          setVersionValidPeriod(selectedDate);
                          setValue("version.effDate", e.target.value);
                        }}
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <span className="text-gray-500">to</span>

                    {/* VERSION EXP DATE */}
                    <div className="flex-1 relative">
                      <input
                        type="date"
                        value={formatDate(versionExpValidPeriod)}
                        onChange={(e) => {
                          if (!e.target.value) {
                            setVersionExpValidPeriod(undefined);
                            setValue("version.expDate", null as any);
                            return;
                          }

                          const selectedDate = new Date(e.target.value);

                          if (
                            isValidDate(versionValidPeriod) &&
                            selectedDate < versionValidPeriod
                          ) {
                            toast.error(
                              "Version expiry date cannot be earlier than effective date"
                            );
                            return;
                          }

                          setVersionExpValidPeriod(selectedDate);
                          setValue("version.expDate", e.target.value);
                        }}
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      {versionExpValidPeriod && (
                        <button
                          type="button"
                          onClick={() => {
                            setVersionExpValidPeriod(undefined);
                            setValue("version.expDate", null as any);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {errors.version?.effDate && (
                    <p className="text-xs text-red-500">
                      {errors.version?.effDate.message}
                    </p>
                  )}
                </div>

                {/* Source From */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Source From
                  </label>
                  <Select
                    value={watch("version.sourceFrom")}
                    onValueChange={(value) =>
                      setValue("version.sourceFrom", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select source from" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="1">Share From</SelectItem>
                      <SelectItem value="0">Copy From</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.version?.sourceFrom && (
                    <p className="text-xs text-red-500">
                      {errors.version?.sourceFrom.message}
                    </p>
                  )}
                </div>

                {watch("version.sourceFrom") === "0" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Copy From
                      </label>
                      <Select
                        value={String(watch("version.oldPricePlanVerId")) ?? ""}
                        onValueChange={(value) =>
                          setValue("version.oldPricePlanVerId", Number(value))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Copy From" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          {copyFrom.map((item, index: number) => (
                            <SelectItem
                              key={index}
                              value={String(item.offerVerId)}
                            >
                              {item.pricePlanName} - From {item.effDate}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {watch("version.oldPricePlanVerId") && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Name Prefix
                            </label>
                            <Input
                              type="text"
                              placeholder="Enter prefix name"
                              autoComplete="off"
                              {...register("version.prefix")}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Name Postfix
                            </label>
                            <Input
                              type="text"
                              placeholder="Enter postfix name"
                              autoComplete="off"
                              {...register("version.postfix")}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Copy Offer Attribute
                          </label>
                          <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="Y"
                                {...register("version.isCopyOfferAttr")}
                                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="N"
                                {...register("version.isCopyOfferAttr")}
                                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">No</span>
                            </label>
                          </div>
                          {errors.version?.isCopyOfferAttr && (
                            <p className="text-xs text-red-500">
                              {errors.version?.isCopyOfferAttr.message}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { AddDialog };
