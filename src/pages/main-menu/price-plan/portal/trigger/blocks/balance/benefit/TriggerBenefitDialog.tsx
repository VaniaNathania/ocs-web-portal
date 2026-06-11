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
import { useTriggerCreateContext } from "../../../hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/config/api.config";
import { Alert, KeenIcon, useDataGrid } from "@/components";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import clsx from "clsx";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debounce } from "@/lib/helpers";
import MultiSelect from "../../MultiSelect";
import { TriggerBalanceBenefitSchema } from "./types/forms";
import { AcctConfService } from "@/common/api/account-config/endpoints";
import { SearchSelect } from "@/components/common/SearchSelect";

const API_URL = apiConfig.service_price_plan;
export type TriggerBenefitFormType = z.infer<
  typeof TriggerBalanceBenefitSchema
>;

type LoadingButton = "filter" | "reset" | "export" | "refresh" | null;

const TriggerBenefitDialog = ({ showDialog, setShowDialog }: any) => {
  const parentRef = useRef<any | null>(null);
  const { selectedThreshold, refreshBalanceTriggerList } =
    useTriggerCreateContext();
  const {  dataPricePlan, selectedOfferVerId  } = usePortalData();
  const { PostData, PutData, GetData } = useCallApi();
  const { GET_ACCT_ITEM_TYPE, GET_ACCT_BALANCE } = AcctConfService();

  const methods = useForm<TriggerBenefitFormType>({
    resolver: zodResolver(TriggerBalanceBenefitSchema),
    defaultValues: {
      benefitValue: undefined,
      accountBalanceType: undefined,
      cycleCeilLimit: null,
      dailyCeilLimit: null,
      maximumDays: null,
      subscriberOnly: null,
      extendRule: null,
      resultAccountItemType: [],
      periodType: "absolute",
      absoluteEffectiveDate: null,
      absoluteExpiryDate: null,
      offsetOfEffectiveDate: null,
      dayOffset: null,
      effUnit: null,
      expUnit: null,
      durationOfAvailability: null,
      relativeEffectiveTime: null,
      relativeExpiryTime: null,
      relativePeriodUnit: null,
      offsetOfAbsoluteExpiry: null,
      thresholdId: selectedThreshold?.acmThresholdId ?? undefined,
      triggerMode: null,
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

  const [acctBalanceType, setAcctBalanceType] = useState<
    {
      acctResId: number;
      acctResName: string;
    }[]
  >([]);
  const [acctItemType, setAcctItemType] = useState<
    {
      id: number;
      acctItemTypeName: string;
    }[]
  >([]);
  const [acctItemTypeLoading, setAcctItemTypeLoading] = useState(false);
  const acctItemTypeOptions = acctItemType.map((item) => ({
    value: item.id,
    label: item.acctItemTypeName,
  }));
  const [timeUnit, setTimeUnit] = useState<
    {
      timeUnit: string;
      timeUnitName: string;
    }[]
  >([]);
  const [triggerMode, setTriggerMode] = useState<
    {
      triggerType: string;
      triggerTypeName: string;
    }[]
  >([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState<LoadingButton>(null);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
  const [expiryDate, setExpiryDate] = useState<Date>(new Date());
  const [pricePlanData, setPricePlanData] = useState<any>({});

  const resetForm = () => {
    reset();
  };

  const FetchTimeUnit = async () => {
    try {
      const response = await GetData(`${API_URL}/time-unit/list`, {
        notExact: "Y",
      });

      if (response.status) {
        setTimeUnit(response?.data);
      }
    } catch (error) {
      toast.error("Something went wrong while fetching time unit");
    }
  };

  const onSubmit = async (data: TriggerBenefitFormType) => {
    try {
      setIsLoading(true);
      const response = await PostData(
        `${API_URL}/trigger/benefit/balance/add`,
        data,
      );

      if (response?.status) {
        refreshBalanceTriggerList();
        setShowDialog(false);
        setAlert({ show: false, message: "" });
        resetForm();
        toast.success("Success Create Data Accumulation Trigger");
      } else {
        toast.error("Error Add New Trigger Benefit");
      }
    } catch (error) {
      toast.error("Error Add New Trigger Benefit");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAcctBalanceType = async (filter: string) => {
    try {
      const response = await GET_ACCT_BALANCE({
        page: 1,
        size: 250,
        sortDirection: "ASC",
        acctResName: filter,
      });

      if (response.status) {
        setAcctBalanceType(response.data || []);
      }
    } catch (error) {
      toast.error("Error Fetching Data. Please Check Your Connection!");
    }
  };

  const fetchAcctItemType = async (
    search: string,
  ): Promise<{ label: string; value: number }[]> => {
    const response = await GET_ACCT_ITEM_TYPE({
      acctItemTypeName: search,
      page: 1,
      size: 100,
      sortBy: "BAL_TYPE",
      sortDirection: "ASC",
      spId: 0,
    });

    if (response.status) {
      return response.data.map((item: any) => ({
        label: item.acctItemTypeName,
        value: item.id,
      }));
    }

    return [];
  };

  const fetchTriggerMode = async () => {
    try {
      const response = await GetData(`${API_URL}/trigger/type/list`, {});

      if (response && response.data) {
        setTriggerMode(response.data);
      }
    } catch (error) {
      toast.error("Error Fetching Data.Please Check Your Connection!");
    }
  };

  useEffect(() => {
    if (showDialog) {
      fetchTriggerMode();
      FetchTimeUnit();
    }

    if (showDialog && watch("effUnit") !== "W") {
      setValue("dayOffset", null);
    }
  }, [showDialog, watch("effUnit")]);

  const debouncedFetch = useRef(
    debounce((value: string) => {
      fetchAcctItemType(value);
    }, 400),
  ).current;

  useEffect(() => {
    if (showDialog) {
      debouncedFetch(searchTerm);
    }
  }, [showDialog, searchTerm]);

  useEffect(() => {
    if (!showDialog) {
      resetForm();
      return;
    }

    setValue("thresholdId", selectedThreshold?.tresholdId);
  }, [showDialog, selectedThreshold?.tresholdId]);
  //  console.log(errors);
  return (
    <Dialog open={showDialog} onOpenChange={(open) => setShowDialog(open)}>
      <DialogContent className="container-fixed max-w-[1250px] flex flex-col p-4 overflow-hidden">
        <DialogHeader className="p-0 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex items-center justify-between flex-wrap grow gap-5 pb-7.5">
            <div className="flex flex-col justify-center gap-2">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                Add Trigger Benefit
              </h1>
            </div>
          </div>
        </DialogHeader>

        <DialogBody
          className="scrollable-y py-0 mb-5 ps-0 pe-3 -me-7"
          ref={parentRef}
        >
          <div className="p-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      <span className="text-red-500">*</span> Benefit Value
                    </label>
                    <Controller
                      control={control}
                      name="benefitValue"
                      rules={{ required: "Benefit Value is required" }}
                      render={({ field }) => (
                        <Input
                          type="number"
                          inputMode="numeric"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === "" ? null : Number(v));
                          }}
                          onWheel={(e) => e.currentTarget.blur()}
                          onKeyDown={(e) => {
                            if (["e", "E", "+"].includes(e.key))
                              e.preventDefault();
                          }}
                          placeholder="Enter Benefit Value"
                          className="w-full"
                        />
                      )}
                    />
                    {errors.benefitValue && (
                      <p className="text-xs text-red-500">
                        {errors.benefitValue.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      <span className="text-red-500">*</span> Account Balance
                      Type
                    </label>
                    <Controller
                      control={control}
                      name="accountBalanceType"
                      rules={{ required: "Account Balance Type is required" }}
                      render={({ field }) => (
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(val) => field.onChange(Number(val))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Account Balance Type" />
                          </SelectTrigger>
                          <SearchSelect
                            onSearch={(query: string) =>
                              fetchAcctBalanceType(query)
                            }
                            onSelect={(value) =>
                              field.onChange(value ? Number(value) : null)
                            }
                            selectedValue={field.value?.toString()}
                          >
                            {acctBalanceType?.map((item) => (
                              <SelectItem
                                key={item.acctResId}
                                value={item.acctResId.toString()}
                              >
                                {item.acctResName}
                              </SelectItem>
                            ))}
                          </SearchSelect>
                        </Select>
                      )}
                    />
                    {errors.accountBalanceType && (
                      <p className="text-xs text-red-500">
                        {errors.accountBalanceType.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Limits Configuration Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Limits Configuration
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Cycle Ceil Limit
                    </label>
                    <Controller
                      control={control}
                      name="cycleCeilLimit"
                      render={({ field }) => (
                        <Input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === "" ? null : Number(v));
                          }}
                          onWheel={(e) => e.currentTarget.blur()}
                          onKeyDown={(e) => {
                            if (["e", "E", "+", "-"].includes(e.key))
                              e.preventDefault();
                          }}
                          placeholder="Enter Cycle Ceil Limit"
                          className="w-full"
                        />
                      )}
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Daily Ceil Limit
                    </label>
                    <Controller
                      control={control}
                      name="dailyCeilLimit"
                      render={({ field }) => (
                        <Input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === "" ? null : Number(v));
                          }}
                          onWheel={(e) => e.currentTarget.blur()}
                          onKeyDown={(e) => {
                            if (["e", "E", "+", "-"].includes(e.key))
                              e.preventDefault();
                          }}
                          placeholder="Enter Daily Ceil Limit"
                          className="w-full"
                        />
                      )}
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Maximum Days
                    </label>
                    <Controller
                      control={control}
                      name="maximumDays"
                      render={({ field }) => (
                        <Input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === "" ? null : Number(v));
                          }}
                          onWheel={(e) => e.currentTarget.blur()}
                          onKeyDown={(e) => {
                            if (["e", "E", "+", "-"].includes(e.key))
                              e.preventDefault();
                          }}
                          placeholder="Enter Maximum Days"
                          className="w-full"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Rules & Settings Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Rules & Settings
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Subscriber Only
                    </label>
                    <Select
                      value={watch("subscriberOnly") ?? ""}
                      onValueChange={(val) =>
                        setValue("subscriberOnly", val === "null" ? null : val)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Subscriber Only" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">
                          Select Subscriber Only
                        </SelectItem>
                        <SelectItem value="Y">Yes</SelectItem>
                        <SelectItem value="N">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Extend Rule
                    </label>
                    <Select
                      value={watch("extendRule") ?? ""}
                      onValueChange={(val) =>
                        setValue("extendRule", val === "null" ? null : val)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Extend Rule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">Select Extend Rule</SelectItem>
                        <SelectItem value="1">Balance Expiry Date</SelectItem>
                        <SelectItem value="2">Curent Date</SelectItem>
                        <SelectItem value="3">Maximum Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Result Account Item Type
                    </label>
                    <Controller
                      control={control}
                      name="resultAccountItemType"
                      render={({ field }) => (
                        <MultiSelect<number>
                          value={field.value ?? []}
                          onChange={field.onChange}
                          loadOptions={fetchAcctItemType}
                          placeholder="Search and select account types..."
                        />
                      )}
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Period Type
                    </label>
                    <Select
                      value={watch("periodType") ?? "absolute"}
                      onValueChange={(e) =>
                        setValue("periodType", e === "null" ? null : e)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Period Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="absolute">Absolute</SelectItem>
                        <SelectItem value="relative">Relative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Period Configuration Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Period Configuration
                </h3>

                {watch("periodType") === "absolute" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Controller
                      control={control}
                      name="absoluteEffectiveDate"
                      render={({ field }) => (
                        <div className="flex flex-col space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Absolute Effective Date{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Input
                            className={`w-full transition-colors ${
                              errors.absoluteEffectiveDate
                                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                            }`}
                            type="date"
                            {...register("absoluteEffectiveDate", {
                              required: "Absolute Effective Date is required",
                            })}
                            placeholder="Select absolute effective date"
                            // disabled={isEffDateDisabled}
                          />
                          {errors.absoluteEffectiveDate && (
                            <p className="text-xs text-red-500">
                              {errors.absoluteEffectiveDate.message}
                            </p>
                          )}
                        </div>
                      )}
                    />

                    <Controller
                      control={control}
                      name="absoluteExpiryDate"
                      render={({ field }) => (
                        <div className="flex flex-col space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Absolute Expiry Date{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Input
                            className={`w-full transition-colors ${
                              errors.absoluteExpiryDate
                                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                            }`}
                            type="date"
                            {...register("absoluteExpiryDate", {
                              required: "Absolute Expiry Date is required",
                            })}
                            placeholder="Select absolute expiry date"
                            // disabled={isEffDateDisabled}
                          />
                          {errors.absoluteExpiryDate && (
                            <p className="text-xs text-red-500">
                              {errors.absoluteExpiryDate.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                ) : watch("periodType") === "relative" ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Offset Of Effective Date
                        </label>
                        <Controller
                          control={control}
                          name="offsetOfEffectiveDate"
                          render={({ field }) => (
                            <Input
                              type="number"
                              min={0}
                              inputMode="numeric"
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                field.onChange(v === "" ? null : Number(v));
                              }}
                              onWheel={(e) => e.currentTarget.blur()}
                              onKeyDown={(e) => {
                                if (["e", "E", "+", "-"].includes(e.key))
                                  e.preventDefault();
                              }}
                              placeholder="Enter Offset Of Effective Date"
                              className="w-full"
                            />
                          )}
                        />
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Time Unit (Effective Date)
                        </label>
                        <Controller
                          control={control}
                          name="effUnit"
                          render={({ field }) => (
                            <Select
                              value={field.value ? String(field.value) : ""}
                              onValueChange={(val) => field.onChange(val)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Time Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeUnit.map((item) => (
                                  <SelectItem
                                    key={item.timeUnit}
                                    value={item.timeUnit}
                                  >
                                    {item.timeUnitName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Day Offset
                      </label>
                      <Controller
                        control={control}
                        name="dayOffset"
                        render={({ field }) => (
                          <Select
                            value={field.value ? String(field.value) : ""}
                            onValueChange={(val) => field.onChange(Number(val))}
                            disabled={watch("effUnit") !== "W"}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Day Offset" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Monday</SelectItem>
                              <SelectItem value="2">Tuesday</SelectItem>
                              <SelectItem value="3">Wednesday</SelectItem>
                              <SelectItem value="4">Thursday</SelectItem>
                              <SelectItem value="5">Friday</SelectItem>
                              <SelectItem value="6">Saturday</SelectItem>
                              <SelectItem value="7">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Duration Of Availability{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          control={control}
                          name="durationOfAvailability"
                          render={({ field }) => (
                            <Input
                              type="number"
                              min={0}
                              inputMode="numeric"
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                field.onChange(v === "" ? null : Number(v));
                              }}
                              onWheel={(e) => e.currentTarget.blur()}
                              onKeyDown={(e) => {
                                if (["e", "E", "+", "-"].includes(e.key))
                                  e.preventDefault();
                              }}
                              placeholder="Enter Duration Of Availability"
                              className="w-full"
                            />
                          )}
                        />
                        {errors.durationOfAvailability && (
                          <p className="text-xs text-red-500">
                            {errors.durationOfAvailability.message}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Time Unit (Expiry Date){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          control={control}
                          name="expUnit"
                          render={({ field }) => (
                            <Select
                              value={field.value ? String(field.value) : ""}
                              onValueChange={(val) => field.onChange(val)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Time Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeUnit.map((item) => (
                                  <SelectItem
                                    key={item.timeUnit}
                                    value={item.timeUnit}
                                  >
                                    {item.timeUnitName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.expUnit && (
                          <p className="text-xs text-red-500">
                            {errors.expUnit.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Relative Effective Time
                        </label>
                        <Input
                          type="time"
                          placeholder="Enter Relative Effective Time"
                          {...register("relativeEffectiveTime")}
                          className="w-full"
                        />
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Relative Expiry Time
                        </label>
                        <Input
                          type="time"
                          placeholder="Enter Relative Expiry Time"
                          {...register("relativeExpiryTime")}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Relative Period Unit
                        </label>
                        <Select
                          value={watch("relativePeriodUnit") ?? ""}
                          onValueChange={(e) =>
                            setValue("relativePeriodUnit", e)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Relative Period Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="D">Day</SelectItem>
                            <SelectItem value="H">Hour</SelectItem>
                            <SelectItem value="M">Month</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Advanced Settings Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Advanced Settings
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Offset of Absolute Expiry
                    </label>
                    <Controller
                      control={control}
                      name="offsetOfAbsoluteExpiry"
                      render={({ field }) => (
                        <Input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === "" ? null : Number(v));
                          }}
                          onWheel={(e) => e.currentTarget.blur()}
                          onKeyDown={(e) => {
                            if (["e", "E", "+", "-"].includes(e.key))
                              e.preventDefault();
                          }}
                          placeholder="Enter Offset of Absolute Expiry"
                          className="w-full"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  className="min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? "Creating..." : "Create Trigger"}
                </Button>
              </div>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { TriggerBenefitDialog };
