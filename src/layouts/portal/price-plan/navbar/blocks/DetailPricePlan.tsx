import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { useSystemListContext } from "../hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/config/api.config";
import { Alert, KeenIcon, useDataGrid } from "@/components";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import clsx from "clsx";
import moment from "moment";
// import { DatePicker } from "./DatePicker";
// import { Textarea } from "@/components/ui/textarea";
// import { DateRangePicker } from "./DateRangePicker";
import { DateRange } from "react-day-picker";
import { z } from "zod";
// import { pricePlanUpdateSchema } from "../form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { App } from "@/App";
// import { useDefaultPricePlanListContext } from "../hooks";
import { pricePlanUpdateSchema } from "../form";
import { useNavbarMenuContext } from "../useNavbarContext";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "react-router";
import { DatePicker } from "@/layouts/main-menu/price-plan/blocks/DatePicker";
import { usePortalData } from "../../hooks/PortalDataContext";

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
  servType: number;
  offerVerList: {
    offerVerId: number;
    effDate: string;
    expDate: string | null;
  }[];
  remarks: string;
}

const API_URL = apiConfig.service_price_plan;

type PricePlanUpdateFormType = z.infer<typeof pricePlanUpdateSchema>;

interface DetailDialogProps {}

const DetailDialog = () => {
  const parentRef = useRef<any | null>(null);
  const {  showDetailDialog, handleDetailDialog } = useNavbarMenuContext();
  const { state } = useLocation();
  // const { pricePlanData, pricePlanDataDetail } = state || {};
  const {  dataPricePlanDetail} = usePortalData();
  const { PostData, PutData, GetData } = useCallApi();

  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState<ServiceType[]>([]);
  const [pricePlanDetail, setPricePlanDetail] = useState<PricePlanDetailResponse | null>(null);

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
  const [expBaseValidPeriod, setExpBaseValidPeriod] = useState<Date | undefined>(undefined);

  // Fetch service types
  useEffect(() => {
    if (!showDetailDialog) return;

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

    fetchServiceType(1, 100);
  }, [showDetailDialog, dataPricePlanDetail]);

  // Fetch price plan detail when dialog opens and  is available
  useEffect(() => {
    if (!showDetailDialog) return;

    const fetchPricePlanDetail = async () => {
      setLoading(true);
      try {
        const response = await GetData(`${API_URL}/priceplan/detail`, {
          offerId: dataPricePlanDetail?.offerId,
          applyLevel: dataPricePlanDetail?.applyLevel,
        });

        if (response?.status && response?.data) {
          const data: PricePlanDetailResponse = response.data;
          console.log("Fetched price plan detail:", data);
          setPricePlanDetail(data);

          // Set form values with API data
          setValue("offerId", data.offerId);
          setValue("offerType", data.pricePlanType);
          setValue("offerName", data.pricePlanName);
          setValue("pricePlanCode", data.pricePlanCode);
          setValue("applyLevel", data.applyLevel);
          setValue("baseValidPeriod", data.effDate);
          setValue("expBaseValidPeriod", data.expDate);
          setValue("serviceType", data.servType);
          setValue("remarks", data.remarks);

          // Set date states
          setBaseValidPeriod(new Date(data.effDate));
          if (data.expDate) {
            setExpBaseValidPeriod(new Date(data.expDate));
          }

          // You can set other fields if they exist in your API response
          // For example, if serviceType, remarks, etc. are in the response
        } else {
          toast.error(response?.message || "Failed to fetch price plan detail");
        }
      } catch (error) {
        toast.error("Error fetching price plan detail");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricePlanDetail();
  }, [dataPricePlanDetail, showDetailDialog]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!showDetailDialog) {
      reset();
      setPricePlanDetail(null);
      setExpBaseValidPeriod(undefined);
      setBaseValidPeriod(new Date());
    }
  }, [showDetailDialog]);

  return (
    <Dialog open={showDetailDialog} onOpenChange={(open) => handleDetailDialog(open)}>
      <DialogContent className="max-w-[800px] p-0 border-2  bg-white z-[1000]">
        <DialogHeader className="p-6 border-b ">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-2xl font-semibold ">Detail Price Plan</DialogTitle>
              <DialogDescription className="text">Price plan information</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="p-6 bg-white scrollable-y" ref={parentRef}>
          <div className="flex flex-col gap-6">
            {alert.show && (
              <Alert variant="danger" className="mb-4 bg-red-50 ">
                <h3 className="text-">{alert.message}</h3>
              </Alert>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto border-b-2 border-red-600 rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm ">Loading price plan details...</p>
                </div>
              </div>
            ) : (
              <form className="space-y-6 bg-white">
                <div className="grid grid-cols-1 gap-6 text-black md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">
                      Price Plan ID
                      <span className="ml-1 text-red-600">*</span>
                    </label>
                    <Input type="text" placeholder="Enter price plan name" disabled autoComplete="off" {...register("offerId")} className="" />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">
                      Price Plan Name
                      <span className="ml-1 text-red-600">*</span>
                    </label>
                    <Input type="text" placeholder="Enter price plan name" disabled autoComplete="off" {...register("offerName")} className="bg-white " />
                    {errors.offerName && <p className="text-xs text-red-600">{errors.offerName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">Price Plan Code</label>
                    <Input type="text" placeholder="Enter price plan code" autoComplete="off" disabled {...register("pricePlanCode")} className="bg-white " />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium ">Service Type</label>
                    <Select
                      value={watch("serviceType") ? String(watch("serviceType")) : "none"}
                      onValueChange={(value) => {
                        setValue("serviceType", value === "none" ? null : Number(value));
                      }}
                      disabled
                    >
                      <SelectTrigger className="w-full bg-white ">
                        <SelectValue placeholder="Select Service Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white ">
                        <SelectItem value="none" className="hover:bg-red-50">
                          None
                        </SelectItem>
                        {serviceType.map((type) => (
                          <SelectItem key={type.servType} value={type.servType.toString()} className="hover:bg-red-50">
                            {type.servTypeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium ">
                    Valid Period
                    <span className="ml-1 text-red-600">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <DatePicker
                        date={baseValidPeriod}
                        setDate={(selectedDate) => {
                          setBaseValidPeriod(selectedDate);
                          setValue("baseValidPeriod", selectedDate.toISOString().split("T")[0]);
                        }}
                        className="bg-white "
                        disabled={true}
                      />
                    </div>
                    <span className="font-medium ">to</span>
                    <div className="flex-1">
                      <DatePicker
                        date={expBaseValidPeriod}
                        setDate={(selectedDate) => {
                          setExpBaseValidPeriod(selectedDate);
                          setValue("expBaseValidPeriod", selectedDate ? selectedDate.toISOString().split("T")[0] : null);
                        }}
                        className="bg-white "
                        disabled={true}
                      />
                    </div>
                  </div>
                  {errors.baseValidPeriod && <p className="text-xs text-red-600">{errors.baseValidPeriod.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium ">Remarks</label>
                  <Textarea className="bg-white resize-none min-h-20 " placeholder="Enter any additional notes or remarks" {...register("remarks")} disabled />
                </div>
              </form>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { DetailDialog };
