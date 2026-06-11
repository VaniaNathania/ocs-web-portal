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
import { DatePicker } from "./DatePicker";
import { Textarea } from "@/components/ui/textarea";
import { DateRange } from "react-day-picker";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { App } from "@/App";
import { X } from "lucide-react";
import { pricePlanUpdateSchema } from "../forms/form";
import { PricePlanListContext } from "../hooks/PricePlanContext";

interface ServiceType {
  servType: number;
  servTypeName: string;
  networkType: string;
  networkTypeName: string;
}

interface PricePlanDetailResponse {
  offerId: number;
  pricePlanName: string;
  pricePlanCode: string;
  pricePlanType: string;
  effDate: string;
  expDate: string | null;
  applyLevel: string;
  remarks: string;
  offerVerList: {
    offerVerId: number;
    effDate: string;
    expDate: string | null;
  }[];
  servType: number;
}

const API_URL = apiConfig.service_price_plan;

type PricePlanUpdateFormType = z.infer<typeof pricePlanUpdateSchema>;

interface UpdateDialogProps {}

const UpdateDialog = () => {
  const parentRef = useRef<any | null>(null);
  const {
    showEditDialog,
    handleEditDialog,
    selectedPricePlanId,
    selectedApplyLevel,
    setSelectedApplyLevel,
  } = useContext(PricePlanListContext);
  const { reload } = useDataGrid();
  const { PostData, PutData, GetData } = useCallApi();

  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState<ServiceType[]>([]);
  const [pricePlanDetail, setPricePlanDetail] =
    useState<PricePlanDetailResponse | null>(null);

  // Add state to track if we need to fetch data
  const [shouldFetch, setShouldFetch] = useState(false);

  const methods = useForm<PricePlanUpdateFormType>({
    resolver: zodResolver(pricePlanUpdateSchema),
    defaultValues: {
      offerType: "4",
      offerName: "",
      pricePlanCode: "",
      applyLevel: "S",
      remarks: "",
      serviceType: null,
      baseValidPeriod: new Date().toISOString().split("T")[0],
      expBaseValidPeriod: null,
      pricePlanType: "",
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
  const [allType, setAllType] = useState<any[]>([]);

  // Fetch service types
  useEffect(() => {
    if (!showEditDialog || !selectedPricePlanId) return;

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

    fetchServiceType(1, 500);
    fetchAllType();
  }, [showEditDialog, selectedPricePlanId]);

  // Set shouldFetch to true when dialog opens
  useEffect(() => {
    if (showEditDialog && selectedPricePlanId) {
      setShouldFetch(true);
    }
  }, [showEditDialog, selectedPricePlanId]);

  // Fetch price plan detail when shouldFetch is true
  useEffect(() => {
    if (!shouldFetch || !selectedPricePlanId) return;

    const fetchPricePlanDetail = async () => {
      setLoading(true);
      try {
        const response = await GetData(`${API_URL}/priceplan/detail`, {
          offerId: selectedPricePlanId,
          applyLevel: selectedApplyLevel,
        });

        if (response?.status && response?.data) {
          const data: PricePlanDetailResponse = response.data;
          setPricePlanDetail(data);

          // Set form values with API data
          setValue("offerName", data.pricePlanName);
          setValue("pricePlanCode", data.pricePlanCode);
          setValue("applyLevel", data.applyLevel);
          setValue("baseValidPeriod", data.effDate);
          setValue("expBaseValidPeriod", data.expDate);
          setValue("serviceType", data.servType);
          setValue("remarks", data.remarks);
          setValue("pricePlanType", data.pricePlanType);

          // Set date states
          setBaseValidPeriod(new Date(data.effDate));
          if (data.expDate) {
            setExpBaseValidPeriod(new Date(data.expDate));
          }
        } else {
          toast.error(response?.message || "Failed to fetch price plan detail");
        }
      } catch (error) {
        toast.error("Error fetching price plan detail");
        console.error(error);
      } finally {
        setLoading(false);
        setShouldFetch(false); // Reset shouldFetch after fetching
      }
    };

    fetchPricePlanDetail();
  }, [shouldFetch, selectedPricePlanId, setValue]);

  const doUpdatePricePlan = async (formField: PricePlanUpdateFormType) => {
    try {
      const response = await PutData(
        `${API_URL}/priceplan/update/${selectedPricePlanId}`,
        formField
      );

      if (response?.status) {
        setAlert((prev) => ({ ...prev, show: false, message: "" }));
        handleEditDialog(false);
        toast.success("Success Update Price Plan");
        reload();

        const updateActivity = {
          module: "Price Plan",
          description: `Update Price Plan => ${formField.offerName}`,
          action: "U",
        };

        doSaveLogActivity(updateActivity);
      } else {
        setAlert((prev) => ({
          ...prev,
          show: true,
          message: response?.message || "Failed to update price plan",
        }));
      }
    } catch (error) {
      setAlert((prev) => ({
        ...prev,
        show: true,
        message: "Error updating price plan",
      }));
    }
  };

  const onSubmit = async (data: PricePlanUpdateFormType) => {
    await doUpdatePricePlan(data);
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!showEditDialog) {
      reset();
      setPricePlanDetail(null);
      setExpBaseValidPeriod(undefined);
      setBaseValidPeriod(new Date());
      setShouldFetch(false); // Reset shouldFetch when dialog closes
      setAlert({ show: false, message: "" }); // Reset alert when dialog closes
    }
  }, [showEditDialog, reset]);

  return (
    <Dialog
      open={showEditDialog}
      onOpenChange={(open) => handleEditDialog(open)}
    >
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="relative">
          <DialogTitle className="pr-8 text-2xl font-semibold text-gray-900">
            Update Price Plan
          </DialogTitle>
          <DialogDescription className="text-gray-600"></DialogDescription>
          {/* Close button positioned absolutely in top-right */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 w-8 h-8 rounded-full hover:bg-gray-100"
            onClick={() => handleEditDialog(false)}
          ></Button>
        </DialogHeader>

        <DialogBody className="p-6 scrollable-y" ref={parentRef}>
          <div className="flex flex-col gap-6">
            {alert.show && (
              <Alert variant="danger" className="mb-4">
                <h3>{alert.message}</h3>
              </Alert>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-gray-600">
                    Loading price plan details...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Price Plan Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Price Plan Name
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter price plan name"
                      autoComplete="off"
                      {...register("offerName")}
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

                  {/* Price Plan Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Price Plan Type
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <Select
                      value={watch("pricePlanType")}
                      onValueChange={(pricePlanType) => {
                        setValue("pricePlanType", pricePlanType);
                      }}
                      disabled
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Price Plan type" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        {allType.map((type) => (
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
                  {/* Service Type - FIXED */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Service Type
                    </label>
                    <Select
                      value={
                        watch("serviceType") !== null &&
                        watch("serviceType") !== undefined
                          ? String(watch("serviceType"))
                          : "none"
                      }
                      onValueChange={(value) => {
                        setValue(
                          "serviceType",
                          value === "none" ? null : Number(value)
                        );
                      }}
                      disabled
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Service Type" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        <SelectItem value="none">None</SelectItem>
                        {serviceType.map((type) => (
                          <SelectItem
                            key={type.servType}
                            value={String(type.servType)}
                          >
                            {type.servTypeName +
                              " [" +
                              type.networkTypeName +
                              "]"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Valid Period
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="date"
                        value={
                          baseValidPeriod && !isNaN(baseValidPeriod.getTime())
                            ? baseValidPeriod.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedDate = new Date(e.target.value);
                            if (!isNaN(selectedDate.getTime())) {
                              setBaseValidPeriod(selectedDate);
                              setValue("baseValidPeriod", e.target.value);

                              // Check if expDate is already set and is less than or equal to effDate
                              if (
                                expBaseValidPeriod &&
                                expBaseValidPeriod <= selectedDate
                              ) {
                                toast.error(
                                  "Expiry date must be greater than effective date"
                                );
                                setExpBaseValidPeriod(undefined);
                                setValue("expBaseValidPeriod", null);
                              }
                            }
                          } else {
                            setBaseValidPeriod(new Date());
                            setValue("baseValidPeriod", "");
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <span className="font-medium text-gray-500">to</span>
                    <div className="flex-1">
                      <input
                        type="date"
                        value={
                          expBaseValidPeriod &&
                          !isNaN(expBaseValidPeriod.getTime())
                            ? expBaseValidPeriod.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedDate = new Date(e.target.value);
                            if (!isNaN(selectedDate.getTime())) {
                              // Validate that expDate is greater than effDate
                              if (
                                baseValidPeriod &&
                                selectedDate <= baseValidPeriod
                              ) {
                                toast.error(
                                  "Expiry date must be greater than effective date"
                                );
                                return;
                              }

                              setExpBaseValidPeriod(selectedDate);
                              setValue("expBaseValidPeriod", e.target.value);
                            }
                          } else {
                            setExpBaseValidPeriod(undefined);
                            setValue("expBaseValidPeriod", null);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
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
                    className="resize-none min-h-20"
                    placeholder="Enter any additional notes or remarks"
                    {...register("remarks")}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleEditDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="text-white bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { UpdateDialog };
