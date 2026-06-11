import { ContentLoader, DataGridInner, DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { useTriggerCreateContext } from "../hooks";
import { toAbsoluteUrl } from "@/utils";
import { DateRangePicker } from "./DateRangePicker";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import moment from "moment";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { DatePicker } from "./DatePicker";
import axios from "axios";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { SearchSelect } from "@/components/common/SearchSelect";
import { Input } from "@/components/ui/input";

type LoadingButton = "filter" | "reset" | "export" | "refresh" | null;

interface AccumulationTriggerCreate {
  id: number;
  effectiveDate: string;
  expiryDate: string;
  accumulationType: string;
  triggerMode: string;
  offerVerId: string;
  destination: string;
  stateDate: string;
  thresholdDetail: string;
}

const initialState = {
  id: 0,
  effectiveDate: "",
  expiryDate: "",
  accumulationType: "",
  triggerMode: "",
  offerVerId: "",
  destination: "",
  stateDate: "",
  thresholdDetail: "string",
};

const API_URL = apiConfig.service_price_plan;

const AccumulationTriggerCreate = () => {
  const { GetData, PostData } = useCallApi();
  const { selectedOfferVerId } = usePortalData();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState<LoadingButton>(null);
  const [errors, setErrors] = useState<any>({});
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
  const [expiryDate, setExpiryDate] = useState<Date>(new Date());
  const [pricePlanData, setPricePlanData] = useState<any>({});

  const [formData, setFormData] = useState<AccumulationTriggerCreate>(initialState);

  type State = typeof initialState;
  const validationRules: Record<number, { key: keyof State; errorMessage: string }[]> = {
    0: [
      {
        key: "effectiveDate",
        errorMessage: "Effective Date must be filled in.",
      },
      {
        key: "expiryDate",
        errorMessage: "Expiry Date must be filled in.",
      },
      {
        key: "accumulationType",
        errorMessage: "Accumulation Type must be filled in.",
      },
      {
        key: "triggerMode",
        errorMessage: "Trigger Mode Number must be filled in.",
      },
      {
        key: "offerVerId",
        errorMessage: "Offer Id Holder must be filled in.",
      },
      {
        key: "destination",
        errorMessage: "Destination must be filled in.",
      },
      {
        key: "stateDate",
        errorMessage: "State Date must be filled in.",
      },
      {
        key: "thresholdDetail",
        errorMessage: "Threshold Detail Code must be filled in.",
      },
    ],
  };

  const validationForm = (step: number, state: State): Record<string, string> => {
    const errors: Record<string, string> = {};
    const fieldsToValidate = validationRules[step] || [];

    fieldsToValidate.forEach(({ key, errorMessage }) => {
      const value = state[key];

      if (value === undefined || value === null || (typeof value === "string" && value.trim() === "") || (Array.isArray(value) && value.length === 0)) {
        errors[key] = errorMessage;
      }
    });

    return errors;
  };

  const [accumulationType, setAccumulationType] = useState<any[]>([]);
  const [triggerMode, setTriggerMode] = useState<any[]>([]);

  const resetForm = () => {
    setFormData(initialState);
  };

  const fetchAccumulationType = async () => {
    try {
      const response = await axios.get(`${API_URL}/price/accumulation-type/list`);

      if (response && response.data) {
        setAccumulationType(response.data.data);
      }
    } catch (error) {
      toast.error("Error Fetching Data.Please Check Your Connection!");
    }
  };

  const fetchTriggerMode = async () => {
    try {
      const response = await GetData(`${API_URL}/trigger/type/list`, {});

      if (response.status) {
        setTriggerMode(response.data);
      }
    } catch (error) {
      toast.error("Error Fetching Data.Please Check Your Connection!");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validationForm(0, formData);
    if (Object.keys(errors).length > 0) {
      // const firstErrorMessage = Object.values(errors);
      // setErrors(errors);
      // toast.error(firstErrorMessage);
      const errorMessage = Object.values(errors);
      errorMessage.map((message) => {
        toast.error(message);
      });
      return;
    }
    try {
      setIsLoading(true);
      const response = await PostData(`${API_URL}/trigger/accumulation/create`, formData);

      if (response?.status) {
        setAlert({ show: false, message: "" });
        toast.success("Success Create Data Accumulation Trigger");
        setErrors(null);
        resetForm();
        // reload();
        // const createActivity = {
        //   module: "Edit Merchant",
        //   description: `Edit data Merchant for => ${formData?.code}`,
        //   action: "U",
        // };

        // doSaveLogActivity(createActivity);
      } else {
        toast.error("Error Edit Merchant");
      }
    } catch (error) {
      toast.error("Error Edit Merchant");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccumulationType();
    fetchTriggerMode();
  }, []);

  return (
    <>
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <div className="flex flex-wrap gap-2 lg:gap-5 w-full">
          <form className="flex gap-x-5 justify-between w-full items-center" onSubmit={handleSubmit}>
            <div className="w-[90%] flex gap-3 items-center">
              <div className="w-3/12 items-baseline lg:flex-nowrap gap-5">
                <label className="form-label flex items-center gap-1 mb-2 text-[14px]">Effective Date</label>
                <div className="items-baseline flex gap-5 w-full mb-5">
                  {/* <DatePicker
                    date={effectiveDate}
                    setDate={(selectedDate: Date) => {
                      setEffectiveDate(selectedDate);
                      setFormData((prev: any) => ({
                        ...prev,
                        // effectiveDate: moment(selectedDate).format("YYYY-MM-DD"),
                        effectiveDate: moment(selectedDate).toISOString(),
                      }));
                    }}
                  /> */}
                  <Input
                    className={`w-full transition-colors ${errors.effDate ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
                    type="date"
                    // {...register("effDate", {
                    //   required: "Effective Date is required",
                    // })}
                    value={formData.effectiveDate ?? ""}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        effectiveDate: e.target.value,
                      }));
                    }}
                    placeholder="Select effective date"
                    // disabled={isEffDateDisabled}
                  />
                </div>
              </div>
              <div className="w-3/12 items-baseline lg:flex-nowrap gap-5">
                <label className="form-label flex items-center gap-1 mb-2 text-[14px]">Expiry Date</label>
                <div className="items-baseline flex gap-5 w-full mb-5">
                  <DatePicker
                    date={expiryDate}
                    setDate={(selectedDate: Date) => {
                      setExpiryDate(selectedDate);
                      setFormData((prev: any) => ({
                        ...prev,
                        // expiryDate: moment(selectedDate).format("YYYY-MM-DD"),
                        expiryDate: moment(selectedDate).toISOString(),
                        stateDate: moment(selectedDate).toISOString(),
                      }));
                    }}
                  />
                </div>
              </div>
              <div className="w-3/12 items-baseline lg:flex-nowrap gap-5">
                <label className="form-label flex items-center gap-1 mb-2 text-[14px]">Accumulation Type</label>
                <div className="items-baseline flex gap-5 w-full mb-5">
                  <Select
                    value={formData.accumulationType.toString()}
                    onValueChange={(accumulationType) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        accumulationType: Number(accumulationType),
                      }));
                    }}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue placeholder="Accumulation Type..." />
                    </SelectTrigger>
                    <SearchSelect>
                      {accumulationType.map((ac) => (
                        <SelectItem key={ac.resourceId} value={ac.resourceId.toString()}>
                          {ac.resourceName}
                        </SelectItem>
                      ))}
                    </SearchSelect>
                  </Select>
                </div>
              </div>
              <div className="w-3/12 items-baseline lg:flex-nowrap gap-5">
                <label className="form-label flex items-center gap-1 mb-2 text-[14px]">Trigger Mode</label>
                <div className="items-baseline flex gap-5 w-full mb-5">
                  <Select
                    value={formData.triggerMode}
                    onValueChange={(triggerMode) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        triggerMode: triggerMode,
                      }));
                    }}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue placeholder="Trigger Mode..." />
                    </SelectTrigger>
                    <SearchSelect>
                      {triggerMode.map((ac) => (
                        <SelectItem key={ac.triggerType} value={ac.triggerType}>
                          {ac.triggerTypeName}
                        </SelectItem>
                      ))}
                    </SearchSelect>
                  </Select>
                </div>
              </div>
              <div className="w-3/12 items-baseline lg:flex-nowrap gap-5">
                <label className="form-label flex items-center gap-1 mb-2 text-[14px]">Destination</label>
                <div className="items-baseline flex gap-5 w-full mb-5">
                  <Select
                    value={formData.destination}
                    onValueChange={(destination) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        destination: destination,
                      }));
                    }}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue placeholder="Destination..." />
                    </SelectTrigger>
                    <SearchSelect>
                      <SelectItem value="1">CVBS</SelectItem>
                      <SelectItem value="2">MCCM</SelectItem>
                      <SelectItem value="3">BOTH</SelectItem>
                    </SearchSelect>
                  </Select>
                </div>
              </div>
            </div>
            <div className="w-[10%] flex gap-3 items-center">
              <div className="w-6/12 items-start lg:flex-nowrap gap-5">
                <label className="form-label flex text-white items-center gap-1 mb-2 text-[14px]">Threshold</label>
                <div className="items-baseline flex justify-center gap-x-3 w-full mb-5">
                  <button type="submit" disabled={isLoading}>
                    <KeenIcon icon="check" />
                  </button>
                  <button
                  // onClick={() => reload()}
                  >
                    <KeenIcon icon="cross-square" />
                  </button>
                </div>
              </div>
              <div className="w-6/12 items-start lg:flex-nowrap gap-5">
                <label className="form-label flex items-center gap-1 mb-2 text-[14px]">Threshold</label>
                <div className="items-baseline flex gap-5 w-full mb-5">
                  <p className="text-base text-blue-400 hover:text-blue-600 hover:cursor-pointer">Detail</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export { AccumulationTriggerCreate };
